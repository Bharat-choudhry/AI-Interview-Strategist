import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const Register = () => {
    const navigate = useNavigate()
    const [ username, setUsername ] = useState("")
    const [ email, setEmail ] = useState("")
    const [ password, setPassword ] = useState("")
    const [ otp, setOtp ] = useState("")
    
    // State to track if OTP has been sent
    const [ step, setStep ] = useState(1) // 1: Info, 2: OTP
    const [ error, setError ] = useState("")
    const [ successMsg, setSuccessMsg ] = useState("")

    const { loading, handleRegister, handleSendOtp } = useAuth()
    
    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setSuccessMsg("")

        if (step === 1) {
            // Step 1: Send OTP
            const result = await handleSendOtp({ email })
            if (result?.success) {
                setSuccessMsg("OTP sent to your email!")
                setStep(2)
            } else {
                setError(result?.message || "Failed to send OTP. Please try again.")
            }
        } else {
            // Step 2: Verify & Register
            if (!otp) {
                setError("Please enter the OTP")
                return
            }
            const result = await handleRegister({ username, email, password, otp })
            if (result?.success) {
                navigate("/")
            } else {
                setError(result?.message || "Registration failed. Please try again.")
            }
        }
    }

    return (
        <main>
            <div className="form-container">
                <h1>Register</h1>
                
                {error && <p style={{ color: "#ff4d6d", marginBottom: "1rem", fontSize: "0.875rem", textAlign: "center" }}>{error}</p>}
                {successMsg && <p style={{ color: "#4ade80", marginBottom: "1rem", fontSize: "0.875rem", textAlign: "center" }}>{successMsg}</p>}
                
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <input
                            onChange={(e) => { setUsername(e.target.value) }}
                            value={username}
                            type="text" id="username" name='username' placeholder='Enter username' required disabled={step === 2 || loading} />
                    </div>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            onChange={(e) => { setEmail(e.target.value) }}
                            value={email}
                            type="email" id="email" name='email' placeholder='Enter email address' required disabled={step === 2 || loading} />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            onChange={(e) => { setPassword(e.target.value) }}
                            value={password}
                            type="password" id="password" name='password' placeholder='Enter password' required disabled={step === 2 || loading} />
                    </div>

                    {step === 2 && (
                        <div className="input-group">
                            <label htmlFor="otp">6-Digit OTP</label>
                            <input
                                onChange={(e) => { setOtp(e.target.value) }}
                                value={otp}
                                type="text" id="otp" name='otp' placeholder='Enter OTP sent to your email' required disabled={loading} maxLength={6} />
                        </div>
                    )}

                    <button className='button primary-button' disabled={loading}>
                        {loading ? (step === 1 ? 'Sending...' : 'Verifying...') : (step === 1 ? 'Send OTP' : 'Verify & Register')}
                    </button>
                </form>

                <p>Already have an account? <Link to={"/login"}>Login</Link> </p>
            </div>
        </main>
    )
}

export default Register
