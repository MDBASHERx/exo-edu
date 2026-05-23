import "colors";
import Course from "../schemas/Course.js";
import User from "../schemas/User.js";
import mongoose from "mongoose";

export const getUserCourses = async (req, res) => {
    const role = req.user.role;
    const userId = req.user.id;

    try {
        let courses = [];
        const today = new Date();
        const todayStart = new Date(today.setHours(0, 0, 0, 0));
        const todayEnd = new Date(today.setHours(23, 59, 59, 999));

        if (role === "teacher")
        {
            courses = await Course.find({
                $or: [
                    { teacher: userId },
                    { isZoom: true, teacher: userId, date: { $gte: todayStart, $lte: todayEnd } }
                ]
            }).populate("teacher", "name");
        }
        else if (role === "student")
        {
            courses = await Course.find({
                $or: [
                    { students: userId },
                    { isZoom: true, date: { $gte: todayStart, $lte: todayEnd } }
                ]
            }).populate("teacher", "name");
        }
        else if (role === "admin")
        {
            courses = await Course.find({
                $or: [
                    {},
                    { isZoom: true, date: { $gte: todayStart, $lte: todayEnd } }
                ]
            }).populate("teacher", "name");
        }
        res.status(200).json(courses);
    }
    catch (err)
    {
        console.error("[ERROR] fetching courses:", err.message);
        res.status(500).json({ msg: "Failed to fetch courses." });
    }
};

export const createCourse = async (req, res) => {
    try {
        const { name, teacherId, dayOfWeek, startTime, endTime } = req.body;

        if (!name || !teacherId || !dayOfWeek || !startTime || !endTime)
        {
            return res.status(400).json({ msg: "Please fill in all fields" });
        }

        const existing = await Course.findOne({ name });
        if (existing)
        {
            return res.status(409).json({ msg: "A course with this name already exists" });
        }

        const teacher = await User.findById(teacherId);
        if (!teacher || teacher.role !== "teacher")
        {
            return res.status(400).json({ msg: "Invalid teacher" });
        }

        const course = new Course({
            name,
            teacher: teacherId,
            dayOfWeek,
            startTime,
            endTime,
            students: []
        });

        await course.save();

        res.status(201).json({ msg: "[SUCCESS] Course created successfully", course });
    }
    catch (err)
    {
        console.error("[ERROR] Failed to create course:".red, err.message);
        res.status(500).json({ msg: "[ERROR] Failed to create course" });
    }
};

export const addStudentToCourse = async (req, res) => {
    try {
        const { courseId, studentId } = req.body;

        if (!courseId || !studentId)
        {
            return res.status(400).json({ msg: "Course ID and Student ID are required" });
        }

        const course = await Course.findById(courseId);
        if (!course)
        {
            return res.status(404).json({ msg: "Course not found" });
        }

        const studentObjectId = new mongoose.Types.ObjectId(studentId);
        const exists = await User.exists({ _id: studentObjectId, role: "student" });

        if (!exists)
        {
            return res.status(400).json({ msg: "Invalid student" });
        }

        if (course.students.some(id => id.equals(studentObjectId)))
        {
            return res.status(409).json({ msg: "Student is already enrolled in this course" });
        }

        course.students.push(studentObjectId);
        await course.save();

        res.status(200).json({ msg: "[SUCCESS] Student added successfully" });
    }
    catch (err)
    {
        console.error("[ERROR] Adding student to course failed:".red, err.message);
        res.status(500).json({ msg: "[ERROR] Failed to add student to course" });
    }
};

export const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find().select("name");
        res.json(courses);
    } 
    catch (err) 
    {
        console.error("[ERROR] Fetching all courses failed:".red, err.message);
        res.status(500).json({ msg: "Failed to fetch all courses." });
    }
};

export const getCourseById = async (req, res) => {
    const course = await Course.findById(req.params.id).populate("teacher", "name");

    if (!course)
    {
        return res.status(404).json({ msg: "Course not found" });
    }

    res.status(200).json(course);
};

export const createZoomCourse = async (req, res) => {
    try {
        const { name, startTime, endTime, zoomLink, date } = req.body;
  
        if (!name || !startTime || !endTime || !zoomLink || !date)
        {
            return res.status(400).json({ msg: "Missing required fields." });
        }
  
        const newCourse = await Course.create({
            name,
            teacher: req.user._id,
            startTime,
            endTime,
            isZoom: true,
            zoomLink,
            date: new Date(date)
        });
  
        res.status(201).json({ msg: "Zoom course created.", course: newCourse });
    }
    catch (err)
    {
        console.error("[ERROR] creating zoom course:", err);
        res.status(500).json({ msg: "Failed to create zoom course." });
    }
};  

export const copyStudentsToCourse = async (req, res) => {
    const { fromCourseId, toCourseId } = req.body;

    if (!fromCourseId || !toCourseId)
    {
        return res.status(400).json({ msg: "Both course IDs are required." });
    }

    try {
        const fromCourse = await Course.findById(frofmCourseId);
        const toCourse = await Course.findById(toCourseId);

        if (!fromCourse || !toCourse)
        {
            return res.status(404).json({ msg: "One or both courses not found." });
        }

        const studentsToAdd = fromCourse.students.filter(
            studentId => !toCourse.students.includes(studentId)
        );

        toCourse.students.push(...studentsToAdd);
        await toCourse.save();

        res.status(200).json({ msg: "Students copied successfully." });
    }
    catch (err)
    {
        console.error("[ERROR] Copying students:", err.message);
        res.status(500).json({ msg: "Failed to copy students." });
    }
};