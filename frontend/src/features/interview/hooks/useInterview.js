import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf } from "../services/interview.api"
import { useContext, useEffect } from "react"
import { InterviewContext } from "../interview.context"
import { useParams } from "react-router"


export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context
// 1. Add 'title' to the destructured parameters
    const generateReport = async ({ title, jobDescription, selfDescription, resumeFile, onUploadProgress }) => {
        setLoading(true)
        let response = null
        try {
            response = await generateInterviewReport({ title, jobDescription, selfDescription, resumeFile, onUploadProgress })
            
            if (response && response.interviewReport) {
                setReport(response.interviewReport)
            }
        } catch (error) {
            console.error("API Error:", error)
            const msg = error.response?.data?.message || "Failed to generate report. Please try again.";
            alert(`Error: ${msg}`)
        } finally {
            setLoading(false)
        }

        return response?.interviewReport 
    }
    const getReportById = async (id) => {
        setLoading(true)
        let response = null
        try {
            response = await getInterviewReportById(id)
            if (response?.interviewReport) {
                setReport(response.interviewReport)
            }
        } catch (error) {
            console.error("Failed to fetch report by id:", error)
        } finally {
            setLoading(false)
        }
        return response?.interviewReport
    }

    const getReports = async () => {
        setLoading(true)
        let response = null
        try {
            response = await getAllInterviewReports()
            if (response?.interviewReports) {
                setReports(response.interviewReports)
            }
        } catch (error) {
            console.error("Failed to fetch reports:", error)
        } finally {
            setLoading(false)
        }

        return response?.interviewReports
    }

    const getResumePdf = async (interviewReportId) => {
        try {
            const response = await generateResumePdf({ interviewReportId })
            if (response) {
                const blob = new Blob([ response ], { type: "application/pdf" })
                const url = window.URL.createObjectURL(blob)
                const link = document.createElement("a")
                link.href = url
                link.setAttribute("download", `resume_${interviewReportId}.pdf`)
                document.body.appendChild(link)
                link.click()
                link.remove()
                window.URL.revokeObjectURL(url)
            }
        }
        catch (error) {
            console.error("Failed to generate PDF:", error)
        }
    }

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        } else {
            getReports()
        }
    }, [ interviewId ])

    return { loading, report, reports, generateReport, getReportById, getReports, getResumePdf }

}