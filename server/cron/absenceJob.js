import cron from "node-cron";
import { generateAbsences } from "../controllers/attendanceController.js";

export const startAbsenceJob = () => {
    cron.schedule("59 23 * * *", async () => {
        console.log("[CRON] Generating absences...");
        await generateAbsences(
            { method: "CRON" },
            {
                status: (code) => ({
                    json: (data) => console.log(`[CRON] ${data.msg}`),
                }),
            }
        );
    });
};