import React from 'react'
import  "../auth.form.scss"
import {Link} from "react-router-dom"

const Login = () => {

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle login logic here
    }
    return(
        <main>
            <div className="form-container">
                <h1>Login</h1>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" name='email' placeholder='Enter the email address'/>
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" name='password' placeholder='Enter the password'/>
                    </div>
                    <button type="submit" className='button primary-button'>Login</button>
                </form>
                <p>Don't have an account? <Link to="/register">Register here</Link></p>
            </div>
        </main>
    )
}

export default Login