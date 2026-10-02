const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_FILE = path.join(__dirname, "data.json");

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Read data from data.json
function readData() {
    const data = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(data);
}

// Save data to data.json
function saveData(data) {
    fs.writeFileSync(
        DATA_FILE,
        JSON.stringify(data, null, 2)
    );
}


// ------------------------------
// GET ALL STUDENTS
// ------------------------------
app.get("/api/students", (req, res) => {

    const data = readData();

    let students = data.students;

    // Search
    const search = req.query.search;

    if (search) {
        const keyword = search.toLowerCase();

        students = students.filter(student =>
            student.name.toLowerCase().includes(keyword) ||
            student.role.toLowerCase().includes(keyword) ||
            student.skills.some(skill =>
                skill.toLowerCase().includes(keyword)
            ) ||
            student.interests.some(interest =>
                interest.toLowerCase().includes(keyword)
            )
        );
    }

    // Skill filter
    const skill = req.query.skill;

    if (skill && skill !== "All") {
        students = students.filter(student =>
            student.skills.some(
                item => item.toLowerCase() === skill.toLowerCase()
            )
        );
    }

    res.json(students);
});


// ------------------------------
// ADD NEW STUDENT
// ------------------------------
app.post("/api/students", (req, res) => {

    const {
        name,
        role,
        skills,
        interests,
        bio
    } = req.body;

    // Basic validation
    if (!name || !role || !skills || !interests) {
        return res.status(400).json({
            message: "Please fill all required fields."
        });
    }

    const data = readData();

    // Generate new ID
    const newId =
        data.students.length > 0
            ? Math.max(...data.students.map(student => student.id)) + 1
            : 1;

    const newStudent = {
        id: newId,
        name: name.trim(),
        role: role.trim(),

        skills: Array.isArray(skills)
            ? skills
            : skills.split(",").map(item => item.trim()).filter(Boolean),

        interests: Array.isArray(interests)
            ? interests
            : interests.split(",").map(item => item.trim()).filter(Boolean),

        bio: bio ? bio.trim() : ""
    };

    data.students.push(newStudent);

    saveData(data);

    res.status(201).json(newStudent);
});


// ------------------------------
// GET TEAM-UP REQUESTS
// ------------------------------
app.get("/api/requests", (req, res) => {

    const data = readData();

    res.json(data.requests);
});


// ------------------------------
// SEND TEAM-UP REQUEST
// ------------------------------
app.post("/api/requests", (req, res) => {

    const {
        fromName,
        studentId,
        message
    } = req.body;

    if (!fromName || !studentId) {
        return res.status(400).json({
            message: "Name and student are required."
        });
    }

    const data = readData();

    // Find the student receiving the request
    const student = data.students.find(
        item => item.id === Number(studentId)
    );

    if (!student) {
        return res.status(404).json({
            message: "Student not found."
        });
    }

    const newId =
        data.requests.length > 0
            ? Math.max(...data.requests.map(request => request.id)) + 1
            : 1;

    const newRequest = {
        id: newId,
        fromName: fromName.trim(),
        toStudentId: student.id,
        toStudentName: student.name,
        message: message
            ? message.trim()
            : "I would like to team up with you!",
        status: "Pending",
        createdAt: new Date().toISOString()
    };

    data.requests.push(newRequest);

    saveData(data);

    res.status(201).json(newRequest);
});
// API HEALTH CHECK
app.get("/api/health", (req, res) => {

    res.json({
        message: "TeamUp API is running successfully!"
    });
});
//server start
app.listen(PORT, "0.0.0.0", () => {
    console.log(`TeamUp server running at http://localhost:${PORT}`);
});