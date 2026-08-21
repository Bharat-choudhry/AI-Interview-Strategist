require('dotenv').config();
const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });
async function run() {
    const prompt = `You are a rigorous, elite technical interviewer and career coach. Generate a highly specific, unique, and role-tailored interview preparation report.

    Candidate Resume / Profile Details:
    Bharat, Jaipur, B.Tech CS. Projects: MERN Stack E-Commerce, React Chat App
    
    Target Job Description:
    Senior React Developer, 5 years experience, Node.js, System Design

    CRITICAL INSTRUCTIONS TO PREVENT HALLUCINATION & LAZINESS:
    1. ZERO REPETITION: Every single technical question, behavioral question, and roadmap day MUST be 100% unique, diverse, and deeply grounded in the candidate's actual resume projects, tech stack, and the job description.
    2. NO SEQUENTIAL NUMBERING IN STRINGS: Do not use generic strings like "Question 1" or "Day 1 General Prep". Be specific: "Mastering React Context API", "Advanced C++ Graph Algorithms", etc.
    3. STRICT JSON OBJECT ARRAYS: You MUST return arrays of OBJECTS exactly matching the schema. NEVER return flat arrays of strings. 
    4. Provide EXACTLY 7 distinct Technical Questions.
    5. Provide EXACTLY 7 distinct Behavioral Questions.
    6. Provide EXACTLY a 7-day Preparation Plan with hyper-specific, highly actionable daily tasks (e.g., "Build a scalable API using Node.js and Redis", not "Study backend").

    You MUST return ONLY a valid JSON object matching this exact structure, with no markdown formatting or backticks around the JSON.
    {
      "matchScore": 85,
      "title": "Software Engineer",
      "technicalQuestions": [ { "question": "Deep dive into your specific C++ project...", "intention": "Assess memory management", "answer": "Discuss pointers and RAII." } ],
      "behavioralQuestions": [ { "question": "Tell me about a time you disagreed on a PR...", "intention": "Assess conflict resolution", "answer": "Use STAR method." } ],
      "skillGaps": [ { "skill": "System Design", "severity": "high" } ],
      "preparationPlan": [ { "day": 1, "focus": "Advanced System Design Concepts", "tasks": ["Study load balancing", "Design a URL shortener"] } ]
    }`;

    try {
        const res = await ai.models.generateContent({ model: "gemini-3.5-flash", contents: prompt, config: { responseMimeType: "application/json" } });
        console.log("RAW LLM OUTPUT:");
        console.log(res.text);
    } catch(e) { console.error("Error:", e) }
}
run();
