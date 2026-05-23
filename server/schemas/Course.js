import mongoose, { Schema, model } from "mongoose";

const courseSchema = new Schema(
    {
        name: { type: String, required: true, unique: true, trim: true },
        teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        dayOfWeek: { type: String, required: true, enum: ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday"],
            required: function () 
            {
                return !this.isZoom;
            }
        },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
        students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        isZoom: { type: Boolean, default: false },
        zoomLink: { type: String, default: "" },
        date: { type: Date, default: null }          
    },
    { timestamps: true }
);

courseSchema.pre("save", function (next) {
    if (this.startTime >= this.endTime)
    {
      return next(new Error("Start time must be before end time"));
    }
    next();
});

export default model("Course", courseSchema);