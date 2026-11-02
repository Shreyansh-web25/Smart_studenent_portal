# CampusHub – Smart Student Portal

A ready-to-run student management mini project built with **Node.js, Express, MongoDB, HTML, CSS and JavaScript**.

## Features
- Dashboard with total students, unique courses and average attendance
- Add, view, edit and delete student records
- Search by name, email, roll number or course
- MongoDB database storage
- Responsive dashboard layout
- Duplicate roll-number validation

## Requirements
- Node.js (LTS)
- MongoDB Community Server running locally, or a MongoDB Atlas connection string
- VS Code (recommended)

## Setup on Windows

1. Extract the ZIP file.
2. Open the extracted `Smart_Student_Portal` folder in VS Code.
3. Open the VS Code terminal: **Terminal → New Terminal**.
4. Install packages:

   ```bash
   npm install
   ```

5. Create a file named `.env` in the project root (same folder as `server.js`). Copy this into it:

   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/student_portal
   ```

   If using MongoDB Atlas, replace the value of `MONGODB_URI` with your own connection string. Keep your `.env` private; do not upload it to GitHub.

6. Make sure the MongoDB service is running.
7. Start the project:

   ```bash
   npm start
   ```

8. Open this address in your browser:

   `http://localhost:5000`

## MongoDB database
- Database: `student_portal`
- Collection: `students`
- MongoDB creates the database and collection automatically when the first student is added.

## Project structure

```text
Smart_Student_Portal/
├── public/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── server.js
```

## API routes

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/health` | Check API |
| GET | `/api/students` | List/search students |
| POST | `/api/students` | Add a student |
| PUT | `/api/students/:id` | Update a student |
| DELETE | `/api/students/:id` | Delete a student |

## Important note
This is an educational mini-project starter. It does not include production authentication or role-based access control. Add those before using real student data.
