const pdfParse = require("pdf-parse")
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")

/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {
    try {
        let resumeText = ""

        if (req.file?.buffer) {
            try {
                const pdfParser = new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))
                const parsedPdf = await pdfParser.getText()
                resumeText = parsedPdf.text || ""
            } catch (err) {
                console.warn("Failed to parse uploaded PDF, proceeding without resume text:", err.message)
            }
        }

        const { selfDescription = "", jobDescription = "", title = "" } = req.body

        if (!jobDescription && !selfDescription && !resumeText) {
            return res.status(400).json({
                message: "Please provide a job description and either a resume or self-description."
            })
        }

        const interViewReportByAi = await generateInterviewReport({
            resume: resumeText,
            selfDescription,
            jobDescription
        })

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeText,
            selfDescription,
            jobDescription,
            ...interViewReportByAi,
            title: title || interViewReportByAi.title || "Interview Strategy"
        })

        res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        })
    } catch (err) {
        console.error("Error generating interview report:", err)
        const isUnavailable = err.status === 503 || err.status === 429 || err.message?.includes("demand") || err.message?.includes("503") || err.message?.includes("quota") || err.message?.includes("RESOURCE_EXHAUSTED") || err.message?.includes("429");
        res.status(isUnavailable ? 503 : 500).json({
            message: isUnavailable
                ? "The AI model is currently busy or rate-limited by the free tier quota. Please wait a few moments and try again."
                : (err.message || "Failed to generate interview strategy.")
        })
    }
}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {
    try {
        const { interviewId } = req.params

        const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            })
        }

        res.status(200).json({
            message: "Interview report fetched successfully.",
            interviewReport
        })
    } catch (err) {
        console.error("Error fetching report:", err)
        res.status(500).json({ message: "Failed to fetch interview report." })
    }
}

/** 
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
    try {
        const interviewReports = await interviewReportModel
            .find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

        res.status(200).json({
            message: "Interview reports fetched successfully.",
            interviewReports
        })
    } catch (err) {
        console.error("Error fetching reports:", err)
        res.status(500).json({ message: "Failed to fetch interview reports." })
    }
}

/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params

        // IDOR check: ensure report belongs to the authenticated user
        const interviewReport = await interviewReportModel.findOne({
            _id: interviewReportId,
            user: req.user.id
        })

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found or access denied."
            })
        }

        const { resume, jobDescription, selfDescription } = interviewReport

        const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
        })

        res.send(pdfBuffer)
    } catch (err) {
        console.error("Error generating resume PDF:", err)
        const isUnavailable = err.status === 503 || err.status === 429 || err.message?.includes("demand") || err.message?.includes("503") || err.message?.includes("quota") || err.message?.includes("RESOURCE_EXHAUSTED") || err.message?.includes("429");
        res.status(isUnavailable ? 503 : 500).json({ 
            message: isUnavailable
                ? "The AI model is currently busy or rate-limited by the free tier quota. Please wait a few moments and try again."
                : "Failed to generate resume PDF." 
        })
    }
}

module.exports = {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController
}