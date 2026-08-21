require('dotenv').config();
const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });
async function main() {
    try {
        const response = await ai.models.list();
        // Just print models that include 'flash' or 'pro' and generateContent support
        for await (const model of response) {
            if (model.name.includes("flash") || model.name.includes("pro") || model.name.includes("gemini")) {
                console.log(model.name);
            }
        }
    } catch(err) {
        console.error(err);
    }
}
main();
