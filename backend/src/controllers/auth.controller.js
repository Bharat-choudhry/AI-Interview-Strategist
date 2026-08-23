const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/blacklist.model");

/**
 * @route post /api/auth/register
 * @description Register a new user
 * @access public
 */
async function registerUserController(req, res) {
    try {
        const { username, email, password } = req.body;

        if(!username || !email || !password) {
            return res.status(400).json({ message: "Please provide username, email and password" });
        }

        const isUserExist = await userModel.findOne({
            $or: [{ username }, { email }]
        });

        if(isUserExist) {
            return res.status(400).json({ message: "Username or email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            username,
            email,
            password: hashedPassword
        });

        const token = jwt.sign(
            {id: user._id, username: user.username },
            process.env.JWT_SECRET, 
            { expiresIn: "1d"}
        );

        res.cookie("token", token, { httpOnly: true, secure: true, sameSite: 'none' });

        res.status(201).json({ message: "User registered successfully", user: { id: user._id, username: user.username, email: user.email }, token });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ 
            message: "Registration failed", 
            errorDetails: error.message || error.toString() 
        });
    }
}

/**
 * @name loginUserController
 * @description login a user,expects username and password in the request body, returns a JWT token if successful
 * @access public
 * 
 */
async function loginUserController(req,res){
    try {
        const { email, password}= req.body;

        const user = await userModel.findOne({ email });

        if(!user){
            return res.status(400).json({ message:"invalid username or password" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if(!isPasswordValid){
            return res.status(400).json({ message:"invalid username or password" });
        }

        const token = jwt.sign(
            {id: user._id, username: user.username},
            process.env.JWT_SECRET,
            { expiresIn: "1d"}
        );

        res.cookie("token", token, { httpOnly: true, secure: true, sameSite: 'none' });

        res.status(200).json({ message: "User logged in successfully", user: { id: user._id, username: user.username, email: user.email }, token });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Login failed", errorDetails: error.message });
    }
}

async function logoutUserController(req, res) {
    try {
        const token = req.cookies.token;
        
        if(token){
            await tokenBlacklistModel.create({ token });
        }
        
        res.clearCookie("token", { httpOnly: true, secure: true, sameSite: 'none' });

        res.status(200).json({ 
            message: "User logged out successfully" 
        });
    } catch (error) {
        res.status(500).json({ message: "Logout failed", errorDetails: error.message });
    }
}

/**
 * @name getMeController
 * @description Get the details of the logged-in user
 * @access private
 */
async function getMeController(req, res) {
    try {
        const user = await userModel.findById(req.user.id);
        
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "User details fetched successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (err) {
        res.status(500).json({ message: "Server error in getMe", errorDetails: err.message });
    }
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
};
