const $ = id => document.getElementById(id);
let students = [];
const modal = $("modal");

async function request(url, options = {}) {
  const response = await fetch(url, { headers: { "Content-Type": "application/json" }, ...options });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Something went wrong");
  return data;
}
function notify(message) {
  const toast = $("toast"); toast.textContent = message; toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2600);
}
function initials(name) { return name.split(" ").map(x => x[0]).slice(0,2).join("").toUpperCase(); }
function render(list) {
  $("totalCount").textContent = students.length;
  $("courseCount").textContent = new Set(students.map(s => s.course.toLowerCase())).size;
  const avg = students.length ? Math.round(students.reduce((sum,s) => sum + Number(s.attendance || 0),0) / students.length) : 0;
  $("avgAttendance").textContent = avg + "%";
  $("tableNote").textContent = `Showing ${list.length} of ${students.length} student record(s)`;
  if (!list.length) {
    $("studentRows").innerHTML = `<tr><td colspan="6" class="empty">No students found. Click “Add Student” to create a record.</td></tr>`;
    return;
  }
  $("studentRows").innerHTML = list.map(s => `<tr>
    <td><div class="student-cell"><span class="student-avatar">${initials(escapeHtml(s.name))}</span><span>${escapeHtml(s.name)}<small>${escapeHtml(s.email)}</small></span></div></td>
    <td>${escapeHtml(s.rollNo)}</td><td><span class="badge">${escapeHtml(s.course)}</span></td>
    <td>${escapeHtml(s.year)}</td><td class="attendance">${Number(s.attendance)}%</td>
    <td><button class="action-btn" title="Edit" data-edit="${s._id}">✎</button><button class="action-btn delete" title="Delete" data-delete="${s._id}">⌫</button></td>
  </tr>`).join("");
}
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
}
async function loadStudents() {
  try { students = await request("/api/students"); applySearch(); }
  catch (e) { $("studentRows").innerHTML = `<tr><td colspan="6" class="empty">${escapeHtml(e.message)}. Is MongoDB running?</td></tr>`; }
}
function applySearch() {
  const q = $("searchInput").value.toLowerCase().trim();
  render(students.filter(s => [s.name,s.email,s.rollNo,s.course].some(v => String(v).toLowerCase().includes(q))));
}
function openModal(student) {
  $("studentForm").reset(); $("formError").textContent = "";
  $("studentId").value = student?._id || "";
  $("modalTitle").textContent = student ? "Edit Student" : "Add Student";
  if (student) {
    ["name","email","rollNo","course","year","attendance"].forEach(k => $(k).value = student[k] ?? "");
  } else $("attendance").value = 0;
  modal.classList.add("show");
}
function closeModal() { modal.classList.remove("show"); }
$("addBtn").addEventListener("click", () => openModal());
$("closeBtn").addEventListener("click", closeModal);
$("cancelBtn").addEventListener("click", closeModal);
modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
$("refreshBtn").addEventListener("click", loadStudents);
$("searchInput").addEventListener("input", applySearch);

$("studentForm").addEventListener("submit", async e => {
  e.preventDefault(); $("formError").textContent = "";
  const id = $("studentId").value;
  const payload = Object.fromEntries(["name","email","rollNo","course","year","attendance"].map(k => [k, $(k).value.trim()]));
  payload.attendance = Number(payload.attendance);
  try {
    await request(id ? `/api/students/${id}` : "/api/students", {
      method: id ? "PUT" : "POST", body: JSON.stringify(payload)
    });
    closeModal(); await loadStudents(); notify(id ? "Student updated successfully" : "Student added successfully");
  } catch (err) { $("formError").textContent = err.message; }
});

$("studentRows").addEventListener("click", async e => {
  const edit = e.target.closest("[data-edit]"), del = e.target.closest("[data-delete]");
  if (edit) { const student = students.find(s => s._id === edit.dataset.edit); if (student) openModal(student); }
  if (del) {
    const student = students.find(s => s._id === del.dataset.delete);
    if (!student || !confirm(`Delete ${student.name}'s record?`)) return;
    try { await request(`/api/students/${del.dataset.delete}`, { method: "DELETE" }); await loadStudents(); notify("Student deleted"); }
    catch (err) { notify(err.message); }
  }
});
loadStudents();
