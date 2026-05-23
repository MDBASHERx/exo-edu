import "colors";
const PORT = process.env.PORT;

const consoleLog = async (app) => {

    if (!PORT) 
    {
        console.error("[ERROR] PORT is missing in .env file.".red);
        process.exit(1);
    }

    app.listen(PORT, () => {
        console.log(`[INFO]`.blue + ` The server is running on `.yellow + `[http://localhost:${PORT}]`.green);
    });
};

export default consoleLog;