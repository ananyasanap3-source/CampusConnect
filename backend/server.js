require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
});


// ==========================================
// DATABASE CONNECTION
// ==========================================

db.connect((err) => {

    if (err) {
        console.log("Database connection failed:", err.message);
    } else {
        console.log("MySQL database connected successfully!");
    }

});


// ==========================================
// HOME
// ==========================================

app.get("/", (req, res) => {
    res.send("Welcome to CampusConnect API");
});


// ==========================================
// AUTH: REGISTER
// ==========================================

app.post("/api/register", (req, res) => {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {

        return res.status(400).json({
            message: "Name, email and password are required"
        });

    }

    const sql = `
        INSERT INTO users (name, email, password)
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [name, email, password],
        (err, result) => {

            if (err) {

                if (err.code === "ER_DUP_ENTRY") {

                    return res.status(409).json({
                        message: "Email already registered"
                    });

                }

                return res.status(500).json({
                    message: "Registration failed",
                    error: err.message
                });

            }

            res.status(201).json({
                message: "Registration successful",
                user_id: result.insertId
            });

        }
    );

});


// ==========================================
// AUTH: LOGIN
// ==========================================

app.post("/api/login", (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {

        return res.status(400).json({
            message: "Email and password are required"
        });

    }

    const sql = `
        SELECT user_id, student_id, name, email, password, role
        FROM users
        WHERE email = ?
    `;

    db.query(
        sql,
        [email],
        (err, results) => {

            if (err) {

                return res.status(500).json({
                    message: "Login failed",
                    error: err.message
                });

            }

            if (results.length === 0) {

                return res.status(401).json({
                    message: "Invalid email or password"
                });

            }

            const user = results[0];

            if (user.password !== password) {

                return res.status(401).json({
                    message: "Invalid email or password"
                });

            }

            res.json({

                message: "Login successful",

                user: {
                    user_id: user.user_id,
                    student_id: user.student_id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }

            });

        }
    );

});


// ==========================================
// GET ALL STUDENTS
// ==========================================

app.get("/api/students", (req, res) => {

    const sql = `
        SELECT student_id, name, email, course, year, skills, bio
        FROM students
        ORDER BY name
    `;

    db.query(
        sql,
        (err, results) => {

            if (err) {

                return res.status(500).json({
                    message: "Failed to fetch students",
                    error: err.message
                });

            }

            res.json(results);

        }
    );

});


// ==========================================
// GET CONVERSATIONS FOR A STUDENT
// ==========================================

app.get("/api/conversations/:studentId", (req, res) => {

    const studentId = req.params.studentId;

    const sql = `

        SELECT

            c.conversation_id,

            CASE
                WHEN c.student1_id = ? THEN c.student2_id
                ELSE c.student1_id
            END AS other_student_id,

            s.name AS other_student_name,
            s.course,
            s.year,

            (
                SELECT m.message_text
                FROM messages m
                WHERE m.conversation_id = c.conversation_id
                ORDER BY m.sent_at DESC
                LIMIT 1
            ) AS last_message,

            (
                SELECT m.sent_at
                FROM messages m
                WHERE m.conversation_id = c.conversation_id
                ORDER BY m.sent_at DESC
                LIMIT 1
            ) AS last_message_time

        FROM conversations c

        JOIN students s
        ON s.student_id =
            CASE
                WHEN c.student1_id = ? THEN c.student2_id
                ELSE c.student1_id
            END

        WHERE
            c.student1_id = ?
            OR c.student2_id = ?

        ORDER BY last_message_time DESC

    `;

    db.query(
        sql,
        [studentId, studentId, studentId, studentId],
        (err, results) => {

            if (err) {

                return res.status(500).json({
                    message: "Failed to fetch conversations",
                    error: err.message
                });

            }

            res.json(results);

        }
    );

});


// ==========================================
// CREATE NEW CONVERSATION
// ==========================================

app.post("/api/conversations", (req, res) => {

    const {
        student1_id,
        student2_id
    } = req.body;

    if (!student1_id || !student2_id) {

        return res.status(400).json({
            message: "Both student IDs are required"
        });

    }

    if (student1_id == student2_id) {

        return res.status(400).json({
            message: "You cannot create a conversation with yourself"
        });

    }

    // Check whether conversation already exists

    const checkSql = `

        SELECT conversation_id

        FROM conversations

        WHERE
            (
                student1_id = ?
                AND student2_id = ?
            )

            OR

            (
                student1_id = ?
                AND student2_id = ?
            )

        LIMIT 1

    `;

    db.query(
        checkSql,
        [
            student1_id,
            student2_id,
            student2_id,
            student1_id
        ],
        (err, results) => {

            if (err) {

                return res.status(500).json({
                    message: "Failed to check conversation",
                    error: err.message
                });

            }

            if (results.length > 0) {

                return res.json({

                    message: "Conversation already exists",

                    conversation_id:
                        results[0].conversation_id

                });

            }

            const insertSql = `

                INSERT INTO conversations
                (
                    student1_id,
                    student2_id
                )

                VALUES (?, ?)

            `;

            db.query(
                insertSql,
                [student1_id, student2_id],
                (err, result) => {

                    if (err) {

                        return res.status(500).json({
                            message: "Failed to create conversation",
                            error: err.message
                        });

                    }

                    res.status(201).json({

                        message: "Conversation created successfully",

                        conversation_id:
                            result.insertId

                    });

                }
            );

        }
    );

});


// ==========================================
// GET MESSAGES FROM A CONVERSATION
// ==========================================

app.get("/api/messages/:conversationId", (req, res) => {

    const conversationId = req.params.conversationId;

    const sql = `

        SELECT
            message_id,
            conversation_id,
            sender_id,
            message_text,
            sent_at

        FROM messages

        WHERE conversation_id = ?

        ORDER BY sent_at ASC

    `;

    db.query(
        sql,
        [conversationId],
        (err, results) => {

            if (err) {

                return res.status(500).json({
                    message: "Failed to fetch messages",
                    error: err.message
                });

            }

            res.json(results);

        }
    );

});


// ==========================================
// SEND MESSAGE
// ==========================================

app.post("/api/messages", (req, res) => {

    const {
        conversation_id,
        sender_id,
        message_text
    } = req.body;

    if (
        !conversation_id ||
        !sender_id ||
        !message_text
    ) {

        return res.status(400).json({
            message: "Conversation ID, sender ID and message are required"
        });

    }

    const sql = `

        INSERT INTO messages
        (
            conversation_id,
            sender_id,
            message_text
        )

        VALUES (?, ?, ?)

    `;

    db.query(
        sql,
        [
            conversation_id,
            sender_id,
            message_text
        ],
        (err, result) => {

            if (err) {

                return res.status(500).json({
                    message: "Failed to send message",
                    error: err.message
                });

            }

            res.status(201).json({

                message: "Message sent successfully",

                message_id: result.insertId

            });

        }
    );

});


// ==========================================
// GET ALL STUDY GROUPS
// ==========================================

app.get("/api/study-groups", (req, res) => {

    const sql = `

        SELECT

            sg.group_id,
            sg.name,
            sg.subject,
            sg.description,
            sg.meeting_info,
            sg.icon,
            sg.created_by,

            (
                SELECT COUNT(*)
                FROM group_members gm
                WHERE gm.group_id = sg.group_id
            ) AS member_count

        FROM study_groups sg

        ORDER BY sg.created_at DESC

    `;

    db.query(sql, (err, results) => {

        if (err) {

            return res.status(500).json({
                message: "Failed to fetch study groups",
                error: err.message
            });

        }

        res.json(results);

    });

});


// ==========================================
// CREATE STUDY GROUP
// ==========================================

app.post("/api/study-groups", (req, res) => {

    const {
        name,
        subject,
        description,
        meeting_info,
        icon,
        created_by
    } = req.body;

    if (!name || !subject || !created_by) {

        return res.status(400).json({
            message: "Name, subject and created_by are required"
        });

    }

    const sql = `

        INSERT INTO study_groups
        (name, subject, description, meeting_info, icon, created_by)

        VALUES (?, ?, ?, ?, ?, ?)

    `;

    db.query(
        sql,
        [
            name,
            subject,
            description || null,
            meeting_info || null,
            icon || "📚",
            created_by
        ],
        (err, result) => {

            if (err) {

                return res.status(500).json({
                    message: "Failed to create study group",
                    error: err.message
                });

            }

            const groupId = result.insertId;

            // Automatically add the creator as a member
            const joinSql = `
                INSERT INTO group_members (group_id, student_id)
                VALUES (?, ?)
            `;

            db.query(joinSql, [groupId, created_by], (joinErr) => {

                if (joinErr) {

                    return res.status(500).json({
                        message: "Group created but failed to add creator as member",
                        error: joinErr.message
                    });

                }

                res.status(201).json({
                    message: "Study group created successfully",
                    group_id: groupId
                });

            });

        }
    );

});


// ==========================================
// JOIN STUDY GROUP
// ==========================================

app.post("/api/study-groups/:groupId/join", (req, res) => {

    const groupId = req.params.groupId;
    const { student_id } = req.body;

    if (!student_id) {

        return res.status(400).json({
            message: "student_id is required"
        });

    }

    const sql = `
        INSERT INTO group_members (group_id, student_id)
        VALUES (?, ?)
    `;

    db.query(sql, [groupId, student_id], (err) => {

        if (err) {

            if (err.code === "ER_DUP_ENTRY") {

                return res.status(409).json({
                    message: "You have already joined this group"
                });

            }

            return res.status(500).json({
                message: "Failed to join group",
                error: err.message
            });

        }

        res.status(201).json({
            message: "Joined group successfully"
        });

    });

});


// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {

    console.log(
        `CampusConnect server running on port ${PORT}`
    );

});