const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})

const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job description"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question that can be asked in the interview"),
        intention: z.string().describe("The intention of the interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, points to cover, and approach to take")
    })).describe("Technical questions that can be asked in the interview along with their intention and model answer"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The behavioral question that can be asked in the interview"),
        intention: z.string().describe("The intention of the interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question using the STAR method or structured approach")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and model answer"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum([ "low", "medium", "high" ]).describe("The severity of this skill gap for the target role")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day, e.g. Core Algorithms, System Design, Mock Interviews"),
        tasks: z.array(z.string()).describe("List of actionable tasks to be completed on this day")
    })).describe("A day-wise preparation plan for the candidate to prepare effectively"),
    title: z.string().describe("The title of the target job role"),
})

const MODELS = [
    "gemini-3.5-flash",
    "gemini-3.7-flash",
]

async function generateWithFallback(generateFn) {
    let lastError = null
    for (const model of MODELS) {
        try {
            return await generateFn(model)
        } catch (err) {
            console.warn(`Model ${model} failed with: ${err.message || err}. Trying next fallback model...`)
            lastError = err
        }
    }
    throw lastError || new Error("All AI models failed to respond.")
}

async function generateInterviewReport({ resume = "", selfDescription = "", jobDescription = "" }) {
    const prompt = `You are a rigorous, elite technical interviewer and career coach. Generate a highly specific, unique, and role-tailored interview preparation report.

    Candidate Resume / Profile Details:
    ${resume || "None provided"}
    
    Candidate Self Description:
    ${selfDescription || "None provided"}
    
    Target Job Description:
    ${jobDescription}

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

    const response = await generateWithFallback(async (model) => {
        return await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            }
        })
    })

    let parsed
    try {
        let cleanText = response.text.trim();
        if (cleanText.startsWith("```json")) {
            cleanText = cleanText.substring(7);
        } else if (cleanText.startsWith("```")) {
            cleanText = cleanText.substring(3);
        }
        if (cleanText.endsWith("```")) {
            cleanText = cleanText.slice(0, -3);
        }
        cleanText = cleanText.trim();
        
        parsed = JSON.parse(cleanText)
    } catch (err) {
        console.error("CRITICAL: Failed to parse AI JSON response.", err)
        console.error("Raw AI Output:", response.text)
        // If JSON parsing completely fails, return a default safe structure
        parsed = {};
    }

    // Robust sanitization to prevent Mongoose crashes and React key duplication if the LLM hallucinates
    const sanitizeObjArray = (arr, fallbackObj, isPlan = false) => {
        if (!Array.isArray(arr) || arr.length === 0) {
            // Force exactly 7 items if missing
            arr = new Array(7).fill(null);
        }
        return arr.map((item, index) => {
            const safeItem = { ...fallbackObj };
            
            // Ensure unique keys for React rendering
            if (safeItem.question) safeItem.question = `${safeItem.question} #${index + 1}`;
            if (safeItem.day !== undefined) safeItem.day = index + 1;
            if (safeItem.focus) safeItem.focus = `${safeItem.focus} Day ${index + 1}`;
            
            if (typeof item === 'string') {
                if (safeItem.question) safeItem.question = item;
                if (safeItem.focus) safeItem.focus = item;
                if (safeItem.skill) safeItem.skill = item;
                return safeItem;
            }
            if (typeof item !== 'object' || item === null) return safeItem;
            
            // If the item provides a day, ensure it doesn't duplicate. If not, use index+1
            const merged = { ...safeItem, ...item };
            if (isPlan && (!item.day || typeof item.day !== 'number')) {
                 merged.day = index + 1;
            }
            return merged;
        });
    };

    const safeData = {
        matchScore: typeof parsed.matchScore === 'number' ? parsed.matchScore : 50,
        title: typeof parsed.title === 'string' ? parsed.title : "Interview Strategy",
        technicalQuestions: sanitizeObjArray(parsed.technicalQuestions, { question: "Could you explain your relevant experience?", intention: "General assessment", answer: "Discuss past projects." }),
        behavioralQuestions: sanitizeObjArray(parsed.behavioralQuestions, { question: "Describe a challenge you faced.", intention: "Assess problem solving", answer: "Use STAR method." }),
        skillGaps: sanitizeObjArray(parsed.skillGaps, { skill: "Domain Knowledge", severity: "low" }),
        preparationPlan: sanitizeObjArray(parsed.preparationPlan, { day: 1, focus: "General Prep", tasks: ["Review resume"] }, true),
    };

    if (!parsed.technicalQuestions || !Array.isArray(parsed.technicalQuestions) || parsed.technicalQuestions.length === 0) {
        console.error("DEBUG: AI returned JSON, but technicalQuestions was missing or empty. Parsed data:", JSON.stringify(parsed, null, 2));
    }

    const validation = interviewReportSchema.safeParse(safeData)
    if (!validation.success) {
        console.warn("Zod schema validation warning on safeData:", validation.error.format())
    }

    // Always return safeData to ensure Mongoose never crashes
    return safeData;
}

async function generatePdfFromHtml(htmlContent) {
    let browser = null;
    try {
        browser = await puppeteer.launch({
            headless: "new",
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox', 
                '--disable-dev-shm-usage', 
                '--disable-gpu'
            ]
        });
        
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: "domcontentloaded", timeout: 20000 });

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
                top: "15mm",
                bottom: "15mm",
                left: "12mm",
                right: "12mm"
            }
        });

        return pdfBuffer;
    } catch (error) {
        console.error("Puppeteer PDF Generation Error:", error);
        throw new Error(JSON.stringify({
            message: "Failed to generate PDF. Puppeteer crashed.",
            details: error.message
        }));
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

async function generateResumePdf({ resume = "", selfDescription = "", jobDescription = "" }) {
    const resumePdfSchema = z.object({
        html: z.string().describe("The complete HTML content of the tailored resume suitable for PDF conversion")
    })

    const prompt = `Generate an ATS-friendly, professional, human-crafted resume for a candidate:
        Resume Details: ${resume}
        Self Description: ${selfDescription}
        Target Job Description: ${jobDescription}

        CRITICAL INSTRUCTIONS FOR IDENTITY PRESERVATION:
        1. YOU MUST USE THE ACTUAL DETAILS PROVIDED IN THE 'Resume Details' and 'Self Description'.
        2. DO NOT MAKE UP OR HALLUCINATE fake names, fake education (e.g., if they say JECRC, use JECRC), fake schools (e.g., use Asop, Jodhpur if mentioned), or fake projects.
        3. STRICTLY preserve their actual identity, past experience (e.g., C++ and MERN projects), and contact information.
        4. If a piece of information is missing, DO NOT invent placeholder names like 'John Doe' or 'XYZ University'. Just format what is available professionally.

        The response must be a valid JSON object with a single field "html" containing clean, well-styled, inline CSS HTML for a 1-2 page modern resume.
        Focus on styling the relevant achievements, skills, and qualifications matching the target job description.
    `

    const response = await generateWithFallback(async (model) => {
        return await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: zodToJsonSchema(resumePdfSchema),
            }
        })
    })

    const jsonContent = JSON.parse(response.text)
    if (!jsonContent.html) {
        throw new Error("AI response did not contain HTML content for the resume.")
    }

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)
    return pdfBuffer
}

module.exports = { generateInterviewReport, generateResumePdf }