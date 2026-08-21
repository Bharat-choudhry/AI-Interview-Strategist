require('dotenv').config();
const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });
async function run() {
    try {
        // Just generate a simple hello
        const res = await ai.models.generateContent({ model: "gemini-1.5-flash", contents: "Say hi" });
        console.log("1.5-flash works:", res.text);
    } catch(e) { console.error("1.5 error:", e.message) }
    
    try {
        const res2 = await ai.models.generateContent({ model: "gemini-3.5-flash", contents: "Say hi" });
        console.log("3.5-flash works:", res2.text);
    } catch(e) { console.error("3.5 error:", e.message) }
}
run();
