import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import eventHandler from "./handlers/eventHandler.js";
import { startAbsenceJob } from "./cron/absenceJob.js";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js"

dotenv.config();
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/attendance", attendanceRoutes);

// 404 handler
app.use("*", (req, res) => {
    res.status(404).json({ msg: "API route not found" });
});

const start = async () => {
    await eventHandler(app);
};

start();
startAbsenceJob();