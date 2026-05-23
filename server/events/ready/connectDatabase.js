import "colors";
import mongoose from "mongoose";

const mongoURL = process.env.MONGODB_URL;

const connectDatabase = async () => {
    if (!mongoURL)
    {
        console.error("[ERROR] MONGODB_URL is missing in .env file.".red);
        process.exit(1);
    }

    try {
        mongoose.set("strictQuery", true);

        const conn = await mongoose.connect(mongoURL);
        console.log("[INFO]".blue + " Connected to MongoDB at ".yellow + `${conn.connection.host}`.green);
    }
    catch (error)
    {
        console.error("[ERROR] Failed to connect to MongoDB:".red, error.message);
        process.exit(1);
    }
};

export default connectDatabase;
