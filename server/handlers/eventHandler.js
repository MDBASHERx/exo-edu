import path from "path";
import { fileURLToPath } from "url";
import getAllFiles from "../utils/getAllFiles.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pathToFileURL = (filePath) => {
    const resolvedPath = path.resolve(filePath);
    return `file://${resolvedPath.replace(/\\/g, "/")}`;
};

const eventHandler = async (app) => {
    const eventFolders = getAllFiles(path.join(__dirname, "..", "events"), true);

    for (const eventFolder of eventFolders)
    {
        let eventName = path.basename(eventFolder).toLowerCase();
        if (eventName === "validations")
        {
            eventName = "interactionCreate";
        }

        const eventFiles = getAllFiles(eventFolder);
        
        for (const eventFile of eventFiles)
        {
            try {
                const eventURL = pathToFileURL(eventFile);
                const eventFunction = await import(eventURL);

                if (typeof eventFunction.default === "function")
                {
                    eventFunction.default(app, eventName);
                }
            }
            catch (err)
            {
                console.error(`[ERROR] Failed to load event from ${eventFile}:`, err.message);
            }
        }
    }
};

export default eventHandler;