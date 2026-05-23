import "colors";
import mongoose from "mongoose";
import Attendance from "../schemas/Attendance.js";
import Course from "../schemas/Course.js";
import User from "../schemas/User.js";

export const markAttendance = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { courseId, location } = req.body;

        if (!courseId)
        {
            return res.status(400).json({ msg: "Course ID is required." });
        }

        const course = await Course.findById(courseId);
        if (!course || !course.students.includes(studentId))
        {
            return res.status(403).json({ msg: "You are not enrolled in this course." });
        }

        const [startHour, startMin] = course.startTime.split(":").map(Number);
        const classStart = new Date();
        classStart.setHours(startHour, startMin, 0, 0);

        const now = new Date();
        const diffMinutes = Math.floor((now - classStart) / 60000);

        if (now < classStart)
        {
            return res.status(403).json({ msg: "Class hasn't started yet." });
        }

        if (diffMinutes > 15)
        {
            return res.status(403).json({ msg: "You are too late to mark attendance." });
        }

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(startOfDay);
        endOfDay.setDate(endOfDay.getDate() + 1);

        const alreadyExists = await Attendance.findOne({
            student: studentId,
            course: courseId,
            date: { $gte: startOfDay, $lt: endOfDay }
        });

        if (alreadyExists)
        {
            return res.status(409).json({ msg: "Attendance already recorded for today." });
        }

        const attendance = new Attendance({
            student: studentId,
            course: courseId,
            location: {
                type: "Point",
                coordinates: [location.longitude, location.latitude]
            },
            status: diffMinutes > 5 ? "late" : "present"
        }); 
        
        await attendance.save();

        let message = "Attendance recorded successfully.";

        if (diffMinutes > 5)
        {
            message += " Try not to be late next time.";
        }

        res.status(201).json({ msg: message });
    }
    catch (err) 
    {
        console.error("[ERROR] marking attendance:".red, err.message);
        res.status(500).json({ msg: "Failed to record attendance." });
    }
};

export const getAttendanceSummary = async (req, res) => {
    try {
        const studentId = req.user.id;
        const courses = await Course.find({ students: studentId, isZoom: { $ne: true } }).select("name _id");

        const attendanceCounts = await Attendance.aggregate([
            {
                $match: { student: new mongoose.Types.ObjectId(studentId) }
            },
            {
                $group: { _id: "$course", count: { $sum: 1 } }
            }
        ]);

        const attendanceMap = {};
        attendanceCounts.forEach(({ _id, count }) => {
            attendanceMap[_id.toString()] = count;
        });

        const summary = courses.map(course => ({
            course: course.name,
            courseId: course._id,
            attendanceCount: attendanceMap[course._id.toString()] || 0
        }));

        res.status(200).json(summary);
    }
    catch (err)
    {
        console.error("[ERROR] fetching attendance summary:".red, err.message);
        res.status(500).json({ msg: "Failed to fetch attendance summary." });
    }
};

export const getCourseAttendanceForStudent = async (req, res) => {
    try {
        const studentId = req.query.student || req.user.id;
        const courseId = req.params.courseId;
        const langCode = req.headers["accept-language"] || "en-US";

        const records = await Attendance.find({
            student: studentId,
            course: courseId
        })
            .sort({ date: -1 })
            .select("createdAt status");

        const formatted = records.map((rec) => {
            const createdAt = rec.createdAt ? new Date(rec.createdAt) : null;

            if (!createdAt || isNaN(createdAt))
            {
                return null;
            }

            return {
                date: createdAt.toLocaleDateString(langCode),
                day: createdAt.toLocaleDateString(langCode, { weekday: "long" }),
                time: createdAt.toLocaleTimeString(langCode, {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true
                }),
                status: rec.status
            };
        }).filter(Boolean);

        res.status(200).json(formatted);
    }
    catch (err)
    {
        console.error("[ERROR] fetching course attendance:".red, err.message);
        res.status(500).json({ msg: "Failed to fetch attendance records." });
    }
};

export const generateAbsences = async (req, res) => {
    try {
        const now = new Date();
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(startOfDay);
        endOfDay.setDate(endOfDay.getDate() + 1);

        const courses = await Course.find({});
        let totalAbsences = 0;

        for (const course of courses)
        {
            const [endHour, endMin] = course.endTime.split(":").map(Number);
            const classEnd = new Date();
            classEnd.setHours(endHour, endMin, 0, 0);

            if (now < classEnd)
            {
                continue;
            }

            for (const studentId of course.students)
            {
                const alreadyMarked = await Attendance.findOne({
                    student: studentId,
                    course: course._id,
                    date: { $gte: startOfDay, $lt: endOfDay }
                });

                if (!alreadyMarked)
                {
                    await Attendance.create({
                        student: studentId,
                        course: course._id,
                        status: "absent"
                    });
                    totalAbsences++;
                }
            }
        }

        return res.status(200).json({ msg: `Absences generated successfully. Total: ${totalAbsences}` });
    }
    catch (err)
    {
        console.error("[ERROR] generating absences:".red, err.message);
        return res.status(500).json({ msg: "Failed to generate absences." });
    }
};

export const getCourseStudentsWithAttendance = async (req, res) => {
    try {
        const courseId = req.params.courseId;

        const course = await Course.findById(courseId).populate("students", "name");
        if (!course)
        {
            return res.status(404).json({ msg: "Course not found" });
        }

        const attendanceData = await Attendance.aggregate([
            { $match: { course: course._id } },
            { $group: { _id: "$student", count: { $sum: 1 } } }
        ]);

        const attendanceMap = {};
        attendanceData.forEach(({ _id, count }) => {
            attendanceMap[_id.toString()] = count;
        });

        const students = course.students.map((student) => ({
            _id: student._id,
            name: student.name,
            attendanceCount: attendanceMap[student._id.toString()] || 0
        }));

        res.status(200).json(students);
    }
    catch (err)
    {
        console.error("[ERROR] fetching course students:", err.message);
        res.status(500).json({ msg: "Failed to fetch student list." });
    }
};

export const getTeacherCourses = async (req, res) => {
    try {
        const teacherId = req.user.id;

        const courses = await Course.find({ teacher: teacherId, isZoom: { $ne: true } }).populate("students", "name");

        const result = courses.map(course => ({
            course: course.name,
            courseId: course._id,
            attendanceCount: course.students.length
        }));

        res.status(200).json(result);
    }
    catch (err)
    {
        console.error("[ERROR] fetching teacher courses:", err.message);
        res.status(500).json({ msg: "Failed to fetch teacher courses" });
    }
};

export const getAllCoursesForAdmin = async (req, res) => {
    try {
        const courses = await Course.find({ isZoom: { $ne: true } }).populate("students", "name");

        const result = courses.map(course => ({
            course: course.name,
            courseId: course._id,
            attendanceCount: course.students.length
        }));

        res.status(200).json(result);
    }
    catch (err)
    {
        console.error("[ERROR] fetching all courses:", err.message);
        res.status(500).json({ msg: "Failed to fetch courses" });
    }
};

export const getTodayCourses = async (req, res) => {
    try {
        const user = req.user;
        const today = new Date();
        const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        const todayName = days[today.getDay()].toLowerCase();

        let courses;

        if (user.role === "admin")
        {
            courses = await Course.find({ dayOfWeek: todayName });
        }
        else 
        {
            courses = await Course.find({ teacher: user._id, dayOfWeek: todayName });
        }

        res.status(200).json(courses);
    }
    catch (err)
    {
        console.error("[ERROR] getTodayCourses:", err.message);
        res.status(500).json({ msg: "Failed to fetch today courses." });
    }
};

export const manualAttendanceBulk = async (req, res) => {
    try {
        const { date, attendances } = req.body;

        if (!date || !Array.isArray(attendances))
        {
            return res.status(400).json({ msg: "Missing or invalid data." });
        }

        const validStatuses = ["present", "late", "absent"];
        const dateStart = new Date(date);
        dateStart.setHours(0, 0, 0, 0);

        const dateEnd = new Date(date);
        dateEnd.setHours(23, 59, 59, 999);

        for (const entry of attendances)
        {
            const status = validStatuses.includes(entry.status?.toLowerCase()) ? entry.status.toLowerCase() : "absent";

            const existing = await Attendance.findOne({
                student: entry.studentId,
                course: entry.courseId,
                date: { $gte: dateStart, $lte: dateEnd }
            });

            if (existing)
            {
                existing.status = status;
                await existing.save();
            }
            else
            {
                await Attendance.create({
                    student: entry.studentId,
                    course: entry.courseId,
                    date: new Date(date),
                    status,
                    location: {
                        type: "Point",
                        coordinates: [0, 0]
                    }
                });
            }
        }

        res.status(200).json({ msg: "Manual attendance saved successfully." });
    }
    catch (err)
    {
        console.error("[ERROR] manualAttendanceBulk:", err.message);
        res.status(500).json({ msg: "Failed to save attendance." });
    }
};

export const getManualAttendance = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const course = await Course.findById(courseId).populate("students", "name");

        if (!course)
        {
            return res.status(404).json({ msg: "Course not found." });
        }

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const records = await Attendance.find({
            course: courseId,
            date: { $gte: todayStart, $lte: todayEnd }
        });

        const attendanceMap = {};
        records.forEach(record => {
            attendanceMap[record.student.toString()] = {
                attendanceId: record._id,
                status: record.status
            };
        });

        const studentsWithStatus = course.students.map(student => ({
            _id: student._id,
            name: student.name,
            attendanceId: attendanceMap[student._id.toString()]?.attendanceId || null,
            status: attendanceMap[student._id.toString()]?.status || "absent"
        }));

        res.status(200).json(studentsWithStatus);
    }
    catch (err) 
    {
        console.error("[ERROR] fetching manual attendance:", err.message);
        res.status(500).json({ msg: "Failed to fetch attendance records." });
    }
};