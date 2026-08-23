import { useContext } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout, sendOtp } from "../services/auth.api";

export const useAuth = () => {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }

    const { user, setUser, loading, setLoading } = context

    const handleLogin = async ({ email, password }) => {
        setLoading(true)
        try {
            const data = await login({ email, password })
            if (data?.user) {
                if (data.token) localStorage.setItem("token", data.token);
                setUser(data.user)
                return { success: true, user: data.user }
            }
            return { success: false, message: data?.message || "Login failed" }
        } catch (err) {
            const message = err.response?.data?.message || "Invalid email or password"
            return { success: false, message }
        } finally {
            setLoading(false)
        }
    }

    const handleSendOtp = async ({ email }) => {
        setLoading(true)
        try {
            const data = await sendOtp({ email })
            return { success: true, message: data?.message || "OTP sent successfully" }
        } catch (err) {
            console.error("Backend Error Details:", err.response?.data)
            const message = err.response?.data?.errorDetails || err.response?.data?.message || "Failed to send OTP"
            return { success: false, message }
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async ({ username, email, password, otp }) => {
        setLoading(true)
        try {
            const data = await register({ username, email, password, otp })
            if (data?.user) {
                if (data.token) localStorage.setItem("token", data.token);
                setUser(data.user)
                return { success: true, user: data.user }
            }
            return { success: false, message: data?.message || "Registration failed" }
        } catch (err) {
            const message = err.response?.data?.message || "Registration failed"
            return { success: false, message }
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        try {
            await logout()
            localStorage.removeItem("token");
            setUser(null)
            return { success: true }
        } catch (err) {
            localStorage.removeItem("token");
            setUser(null)
            return { success: false }
        } finally {
            setLoading(false)
        }
    }

    return { user, loading, handleRegister, handleLogin, handleLogout, handleSendOtp }
}