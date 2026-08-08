import React from 'react'
import {useNavigate,Link} from "react-router-dom"


const Register=() => {
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle register logic here
    }
    return(
        <main>
            <div className="form-container">
                <h1>Register</h1>
                <form onSubmit={handleSubmit}>
                     <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <input type="text" id="username" name='username' placeholder='Enter the username'/>
                    </div>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" name='email' placeholder='Enter the email address'/>
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" name='password' placeholder='Enter the password'/>
                    </div>
                    <button type="submit" className='button primary-button'>Register</button>
                </form>
                <p>Already have an account? <Link to="/login">Login here</Link></p>
            </div>
        </main>
    )
}

export default Register