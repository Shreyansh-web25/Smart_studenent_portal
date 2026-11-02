const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  course: { type: String, required: true, trim: true },
  year: { type: String, required: true },
  rollNo: { type: String, required: true, trim: true, unique: true },
  attendance: { type: Number, default: 0, min: 0, max: 100 }
}, { timestamps: true });

const Student = mongoose.model("Student", studentSchema);

app.get("/api/health", (req, res) => res.json({ status: "ok", message: "Student Portal API is running" }));

app.get("/api/students", async (req, res) => {
  try {
    const q = (req.query.search || "").trim();
    const filter = q ? { $or: [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
      { rollNo: { $regex: q, $options: "i" } },
      { course: { $regex: q, $options: "i" } }
    ] } : {};
    const students = await Student.find(filter).sort({ createdAt: -1 });
    res.json(students);
  } catch (err) { res.status(500).json({ message: "Could not fetch students" }); }
});

app.post("/api/students", async (req, res) => {
  try {
    const { name, email, course, year, rollNo, attendance } = req.body;
    if (!name || !email || !course || !year || !rollNo) {
      return res.status(400).json({ message: "Please fill in all required fields." });
    }
    const student = await Student.create({ name, email, course, year, rollNo, attendance: attendance ?? 0 });
    res.status(201).json(student);
  } catch (err) {
    res.status(err.code === 11000 ? 409 : 400).json({
      message: err.code === 11000 ? "This roll number already exists." : "Please check the entered details."
    });
  }
});

app.put("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!student) return res.status(404).json({ message: "Student not found." });
    res.json(student);
  } catch (err) { res.status(400).json({ message: "Could not update student. Check the details." }); }
});

app.delete("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found." });
    res.json({ message: "Student deleted successfully." });
  } catch (err) { res.status(400).json({ message: "Could not delete student." }); }
});

app.get("*", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/student_portal";

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Portal running at http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error("MongoDB connection failed:", err.message);
    console.error("Check that MongoDB is installed/running and your MONGODB_URI is correct.");
    process.exit(1);
  });
