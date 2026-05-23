import Attendance from "../schemas/Attendance.js";
import User from "../schemas/User.js";
import Course from "../schemas/Course.js";

export const getStudentsWithAttendance = async (req, res) => {
    try {
        const students = await User.find({ role: "student" }).select("name gender");

        const attendanceData = await Attendance.aggregate([
            { $group: { _id: "$student", count: { $sum: 1 } } }
        ]);

        const attendanceMap = {};
        attendanceData.forEach(item => {
            attendanceMap[item._id.toString()] = item.count;
        });

        const courses = await Course.find({}).select("name students");

        const courseMap = {};
        courses.forEach(course => {
            course.students.forEach(studentId => {
                courseMap[studentId.toString()] = course.name;
            });
        });

        const maleImages = [
            "/avatars/male/male1.png",
            "/avatars/male/male2.png",
            "/avatars/male/male3.png"
        ];

        const femaleImages = [
            "/avatars/female/female1.png",
            "/avatars/female/female2.png",
            "/avatars/female/female3.png"
        ];

        const data = students.map(student => {
            const images = student.gender === "male" ? maleImages : femaleImages;
            const randomImage = images[Math.floor(Math.random() * images.length)];

            return {
                name: student.name,
                attendance: attendanceMap[student._id.toString()] || 0,
                image: randomImage,
                course: courseMap[student._id.toString()] || "No course"
            };
        });

        res.status(200).json(data);
    }
    catch (err)
    {
        console.error("[ERROR] Failed to fetch student data:", err.message);
        res.status(500).json({ msg: "Failed to fetch student data" });
    }
};

export const getStudentById = async (req, res) => {
    try {
        const student = await User.findById(req.params.id).select("name");
        
        if (!student)
        {
            return res.status(404).json({ msg: "Student not found" });
        }

        res.status(200).json(student);
    }
    catch (err)
    {
        console.error("[ERROR] fetching student:", err.message);
        res.status(500).json({ msg: "Failed to fetch student." });
    }
};