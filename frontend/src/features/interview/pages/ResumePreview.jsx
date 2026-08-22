import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ResumePreview = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const pdfUrl = location.state?.pdfUrl;

    useEffect(() => {
        if (!pdfUrl) {
            navigate('/'); // Redirect to home if accessed without a pdf URL
        }
    }, [pdfUrl, navigate]);

    if (!pdfUrl) return null;

    const handleDownload = () => {
        const link = document.createElement("a");
        link.href = pdfUrl;
        link.setAttribute("download", `resume_preview.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#0f172a' }}>
            {/* Header Toolbar */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 2rem',
                backgroundColor: '#1e293b',
                borderBottom: '1px solid #334155',
                color: '#f8fafc',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
                <button 
                    onClick={() => navigate(-1)}
                    style={{
                        backgroundColor: 'transparent',
                        color: '#94a3b8',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.375rem',
                        fontWeight: '500',
                        fontSize: '0.875rem',
                        border: '1px solid #475569',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                    }}
                    onMouseOver={(e) => { e.target.style.color = '#f8fafc'; e.target.style.borderColor = '#64748b'; }}
                    onMouseOut={(e) => { e.target.style.color = '#94a3b8'; e.target.style.borderColor = '#475569'; }}
                >
                    &larr; Go Back
                </button>
                
                <h1 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>Resume Preview</h1>

                <button 
                    onClick={handleDownload}
                    style={{
                        backgroundColor: '#6366f1',
                        color: '#ffffff',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.375rem',
                        fontWeight: '500',
                        fontSize: '0.875rem',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                        transition: 'background-color 0.2s ease-in-out'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#4f46e5'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#6366f1'}
                >
                    Download Resume
                </button>
            </div>

            {/* PDF Viewer */}
            <div style={{ flex: 1, position: 'relative' }}>
                <iframe 
                    src={pdfUrl} 
                    title="Resume Preview"
                    style={{ width: '100%', height: '100%', border: 'none' }}
                />
            </div>
        </div>
    );
};

export default ResumePreview;
