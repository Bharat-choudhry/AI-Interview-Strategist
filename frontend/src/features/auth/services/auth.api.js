import axios from "axios"


const api = axios.create({
    baseURL:"https://ai-interview-strategist.onrender.com/api"||'http://localhost:3000/api',
    withCredentials: true
})

export async function sendOtp({ email }) {
    const response = await api.post('/api/auth/send-otp', { email })
    return response.data
}

export async function register({ username, email, password, otp }) {
    const response = await api.post('/api/auth/register', {
        username, email, password, otp
    })
    return response.data
}

export async function login({ email, password }) {
    const response = await api.post("/api/auth/login", {
        email, password
    })
    return response.data
}

export async function logout() {
    const response = await api.get("/api/auth/logout")
    return response.data
}

export async function getMe() {
    try {
        const response = await api.get("/api/auth/get-me")
        return response.data
    } catch (err) {
        // 401 Unauthorized is expected when user has no active session cookie
        if (err.response?.status === 401) {
            return null
        }
        console.error("Error fetching current session:", err)
        return null
    }
}