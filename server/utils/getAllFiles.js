import fs from "fs";
import path from "path";

const getAllFiles = (directory, foldersOnly = false, recursive = false) => {
    let results = [];

    if (!fs.existsSync(directory))
    {
        return [];
    }
    
    const entries = fs.readdirSync(directory, { withFileTypes: true });

    for (const entry of entries)
    {
        const fullPath = path.join(directory, entry.name);

        if (entry.isDirectory())
        {
            if (foldersOnly)
            {
                results.push(fullPath);
            }
            if (recursive)
            {
                results = results.concat(getAllFiles(fullPath, foldersOnly, recursive));
            }
        }
        else if (entry.isFile() && !foldersOnly)
        {
            results.push(fullPath);
        }
    }

    return results;
};

export default getAllFiles;