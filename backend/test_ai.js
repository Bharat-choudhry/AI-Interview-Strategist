require('dotenv').config();
const { generateInterviewReport } = require("./src/services/ai.service");
async function run() {
    try {
        const res = await generateInterviewReport({
            resume: "Experienced Node.js developer",
            jobDescription: "Senior Backend Engineer needing React and Node.js skills"
        });
        console.log("SUCCESS:", JSON.stringify(res, null, 2));
    } catch(err) {
        console.error("FAIL:", err.message);
    }
}
run();
