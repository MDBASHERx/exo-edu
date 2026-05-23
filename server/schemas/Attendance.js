import mongoose, { Schema, model } from "mongoose";

const attendanceSchema = new Schema(
    {
        student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
        date: { type: Date, default: () => new Date(new Date().setHours(0, 0, 0, 0)) },
        location: { type: { type: String, enum: ["Point"], default: "Point" }, 
        coordinates: { type: [Number], default: [0, 0] } },
        status: { type: String, enum: ["present", "late", "absent"], default: "present" }
    },
    { timestamps: true }
);

attendanceSchema.index(
    { student: 1, course: 1, date: 1 },
    { unique: true, partialFilterExpression: { date: { $exists: true } } }
);
export default model("Attendance", attendanceSchema);
