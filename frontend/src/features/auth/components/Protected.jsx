import { useAuth } from '../hooks/useAuth.js'
import React from 'react'
import { Navigate } from "react-router-dom"
import Navbar from '../../../components/Navbar.jsx'
import Loading from '../../interview/components/Loading.jsx'

const Protected = ({ children }) => {
    const { loading, user } = useAuth()

    if (loading) {
        return <Loading />
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
