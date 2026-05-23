import { Schema, model} from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new Schema(
    {
        username: { type: String, required: true, trim: true, unique: true, minlength: 3},
        password: { type: String, required: true, select: false, minlength: 6},
        name: { type: String, required: true, minlength: 2 },
        gender: { type: String, enum: ["male", "female"], required: true },
        role: { type: String, enum: ["student", "teacher", "admin"], default: 'student' }
    },
    { timestamps: true }
);

UserSchema.pre("save", async function (next)
{
    if (!this.isModified("password"))
    {
        return next();
    }

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

UserSchema.methods.comparePassword = async function (password)
{
    return bcrypt.compare(password, this.password);
};

export default model("User", UserSchema);