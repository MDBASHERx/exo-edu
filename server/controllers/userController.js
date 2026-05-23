import User from "../schemas/User.js";

export const getAllUsers = async (req, res) => {
    try {
        const role = req.query.role;
        const validRoles = ["admin", "teacher", "student"];
        let users;

        if (role)
        {
            if (!validRoles.includes(role))
            {
                return res.status(400).json({ msg: "Invalid role provided." });
            }

            users = await User.find({ role });
        }
        else
        {
            users = await User.find();
        }

        res.json(users);
    }
    catch (err)
    {
        console.error("[ERROR] Failed to fetch users:", err.message);
        res.status(500).json({ msg: "Failed to fetch users" });
    }
};
