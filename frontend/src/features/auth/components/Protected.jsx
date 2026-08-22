import { useAuth } from '../hooks/useAuth.js'
import React from 'react'
import { Navigate } from "react-router-dom"
import Navbar from '../../../components/Navbar.jsx'

const Protected = ({ children }) => {
    const { loading, user } = useAuth()

    if (loading) {
        return (<main><h1>Loading...</h1></main>)
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return (
        <>
            <Navbar />
            {children}
        </>
    )
}

export default Protected

 