import "colors";
import User from "../schemas/User.js";
import jwt from "jsonwebtoken";

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.LOGIN_TOKEN,
        { expiresIn: "1h" }
  );
};

export const register = async (req, res) => {
    try {
        const { username, password, name, gender, role } = req.body;
        const existingUser = await User.findOne({ username: new RegExp(`^${username}$`, 'i') });

        if (!username || !password || !name || !gender) 
        {
            return res.status(400).json({ msg: "Please fill in all fields" });
        }          

        if (existingUser)
        {
            return res.status(400).json({ msg: "Username already exists in the system" });
        }

        const englishOnly = /^[a-zA-Z]+$/;
        if (!englishOnly.test(username))
        {
            return res.status(400).json({ msg: "Username must contain English letters only" });
        }

        const user = new User({ username, password, name, gender, role });
        await user.save();

        res.status(201).json({ msg: "User registered successfully" });
    }
    catch (err)
    {
        console.error("[ERROR] Register failed:".red, err.message);
        res.status(500).json({ msg: "Server error while trying to register" });
    }
};

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username: new RegExp(`^${username}$`, "i") }).select("+password");

        if (!user)
        {
            return res.status(401).json({ msg: "Invalid username or password" });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch)
        {
            return res.status(401).json({ msg: "Invalid username or password" });
        }

        const token = generateToken(user);

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                name: user.name,
                gender: user.gender,
                role: user.role
            }
        });
    }
    catch (err)
    {
        console.error("[ERROR] Login failed:".red, err.message);
        res.status(500).json({ msg: "Server error while trying to login" });
    }
};