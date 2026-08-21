import React, { useState, useRef } from 'react'
import "../style/home.scss"
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate } from 'react-router-dom'
import Loading from '../components/Loading'

const Home = () => {
    const { loading, generateReport, reports } = useInterview()
    const [ title, setTitle ] = useState("")
    const [ jobDescription, setJobDescription ] = useState("")
    const [ selfDescription, setSelfDescription ] = useState("")
    const [ error, setError ] = useState("")
    const [ selectedFile, setSelectedFile ] = useState(null)
    const [ uploadProgress, setUploadProgress ] = useState(0)
    
    const resumeInputRef = useRef()
    const navigate = useNavigate()

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0])
        }
    }

    const handleGenerateReport = async () => {
        setError("")
        setUploadProgress(0)

        if (!title.trim()) {
            setError("Please enter a Job Title.")
            return
        }

        const resumeFile = selectedFile
        if (!jobDescription.trim() && !selfDescription.trim() && !resumeFile) {
            setError("Please provide a Job Description and either a Resume or Self-Description.")
            return
        }

        const data = await generateReport({
            title, 
            jobDescription, 
            selfDescription, 
            resumeFile,
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                setUploadProgress(percentCompleted)
            }
        })
        
        if (data && data._id) {
            navigate(`/interview/${data._id}`)
        } else {
            setError("Could not generate interview plan. Please check the inputs or try again in a moment.")
            setUploadProgress(0)
        }
    }

    // If loading but we have finished uploading, or if there's no file, show sci-fi loading
    if (loading && uploadProgress === 100) {
        return <Loading />
    } else if (loading && !selectedFile) {
        return <Loading />
    }

    return (
        <div className='home-page'>
            {/* Page Header */}
            <header className='page-header'>
                <h1>AI Interview Strategist</h1>
                <p>Upload your resume and the job description to get a personalized preparation roadmap.</p>
            </header>

            {error && (
                <div className='error-box'>
                    {error}
                </div>
            )}

            {/* Main Card */}
            <div className='interview-card saas-card-wrapper'>
                <div className='interview-card__body'>

                    {/* Left Panel - Job Description */}
                    <div className='panel panel--left'>
                        <div className='panel__header'>
                            <h2>Target Job Title <span className='required-star'>*</span></h2>
                        </div>
                        <input 
                            type="text"
                            onChange={(e) => setTitle(e.target.value)}
                            value={title}
                            className='saas-input'
                            placeholder="e.g. Senior Frontend Engineer"
                        />

                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                            </span>
                            <h2>Job Description <span className='required-star'>*</span></h2>
                        </div>
                        <textarea
                            value={jobDescription}
                            onChange={(e) => { setJobDescription(e.target.value) }}
                            className='panel__textarea saas-input'
                            placeholder="Paste job description here..."
                            maxLength={5000}
                        />
                        <div className='char-counter'>{jobDescription.length} / 5000 chars</div>
                    </div>

                    {/* Vertical Divider */}
                    <div className='panel-divider' />

                    {/* Right Panel - Profile */}
                    <div className='panel panel--right'>
                        {/* Upload Resume */}
                        <div className='upload-section'>
                            <label className={`dropzone ${selectedFile ? 'dropzone--success' : ''}`} htmlFor='resume'>
                                {selectedFile ? (
                                    <div className="dropzone-success-content">
                                        <svg className="success-icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                        <p className="dropzone__title">{selectedFile.name}</p>
                                        <p className="dropzone__subtitle">Resume successfully attached.</p>
                                    </div>
                                ) : (
                                    <>
                                        <span className='dropzone__icon'>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>
                                        </span>
                                        <p className='dropzone__title'>Click to upload or drag &amp; drop your Resume (PDF)</p>
                                        <p className='dropzone__subtitle'>Max 5MB</p>
                                    </>
                                )}
                                
                                {loading && uploadProgress > 0 && uploadProgress < 100 && (
                                    <div className="upload-progress-bar">
                                        <div className="upload-progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                                    </div>
                                )}
                                
                                <input ref={resumeInputRef} onChange={handleFileChange} hidden type='file' id='resume' name='resume' accept='.pdf,.docx' />
                            </label>
                        </div>

                        {/* OR Divider */}
                        <div className='or-divider'><span>OR</span></div>

                        {/* Quick Self-Description */}
                        <div className='self-description'>
                            <label className='section-label' htmlFor='selfDescription'>Self Description / Extra Details</label>
                            <textarea
                                onChange={(e) => { setSelfDescription(e.target.value) }}
                                id='selfDescription'
                                name='selfDescription'
                                className='panel__textarea panel__textarea--short saas-input'
                                placeholder="Manually input your experience, key skills, and background..."
                            />
                        </div>
                    </div>
                </div>

                {/* Card Footer */}
                <div className='interview-card__footer'>
                    <span className='footer-info'>Estimated Generation Time: ~30s</span>
                    <button
                        onClick={handleGenerateReport}
                        disabled={loading}
                        className='generate-btn saas-btn'>
                        {loading ? 'Uploading...' : 'Generate Interview Report'}
                    </button>
                </div>
            </div>

            {/* Recent Reports List */}
            {reports.length > 0 && (
                <section className='recent-reports'>
                    <h2>Recent Matrices</h2>
                    <ul className='reports-list'>
                        {reports.map(report => (
                            <li key={report._id} className='report-item tech-card' onClick={() => navigate(`/interview/${report._id}`)}>
                                <h3>{report.title || 'Untitled Position'}</h3>
                                <p className='report-meta'>Log: {new Date(report.createdAt).toLocaleDateString()}</p>
                                <p className={`match-score ${report.matchScore >= 80 ? 'score--high' : report.matchScore >= 60 ? 'score--mid' : 'score--low'}`}>Match Score: {report.matchScore}%</p>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </div>
    )
}

export default Home