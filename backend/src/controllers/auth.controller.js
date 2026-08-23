const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/blacklist.model");
const OTP = require("../models/otp.model");
const { Resend } = require("resend");

// Initialize Resend safely so it doesn't crash if API key is missing locally
const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key");

/**
 * 1. SEND OTP CONTROLLER
 */
async function sendOTP(req, res){
    try {
        const { email } = req.body;

        // Check if user already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already registered!" });
        }

        // Generate 6-digit OTP
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

        // STRICT ERROR HANDLING: Attempt to send email FIRST
        try {
            const { data, error } = await resend.emails.send({
                from: "onboarding@resend.dev", // Resend default test domain
                to: email,
                subject: "Your OTP for Registration",
                html: `<p>Your OTP is: <strong>${generatedOtp}</strong></p>`
            });

            if (error) {
                console.error("Resend API Error:", error);
                return res.status(500).json({ 
                    message: "Failed to send OTP email. Please try again.",
                    errorDetails: error.message 
                });
            }
        } catch (emailError) {
            console.error("Resend Exception:", emailError);
            return res.status(500).json({ 
                message: "Failed to send OTP email. Please try again.",
                errorDetails: emailError.message 
            });
        }

        // ONLY save OTP to Database if the email successfully sent
        await OTP.create({
            email,
            otp: generatedOtp
        });

        res.status(200).json({ message: "OTP sent successfully to email" });

    } catch (error) {
        console.error("Error sending OTP:", error);
        res.status(500).json({ 
            message: "Failed to generate OTP", 
            errorDetails: error.message || "Unknown error"
        });
    }
};

/**
 * 2. VERIFY OTP & REGISTER CONTROLLER
 */
async function registerWithOTP(req, res){
    try {
        const { username, email, password, otp } = req.body;

        // Find the most recent OTP for this email
        const otpRecord = await OTP.findOne({ email }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return res.status(400).json({ message: "OTP expired or not found!" });
        }

        if (otpRecord.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP!" });
        }

        // Check if username/email already exists
        const isUserExist = await userModel.findOne({
            $or: [{ username }, { email }]
         });
    
         if(isUserExist) {
            return res.status(400).json({ message: "Username or email already exists" });
         }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // OTP is correct! Now create the user
        const user = await userModel.create({
            username,
            email,
            password: hashedPassword 
        });

        // Optional: Delete OTP record after successful registration
        await OTP.deleteOne({ _id: otpRecord._id });

        // Generate JWT Token
        const token = jwt.sign(
            {id: user._id, username: user.username },
             process.env.JWT_SECRET, 
             { expiresIn: "1d"}
        );
        
        // Set cookie
        res.cookie("token", token, { httpOnly: true, secure: true, sameSite: 'none' });

        res.status(201).json({ message: "User registered successfully!", user: { id: user._id, username: user.username, email: user.email }, token });

    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ 
            message: "Registration failed", 
            errorDetails: error.message || error.toString() 
        });
    }
};

/**
 * @route post /api/auth/register
 * @description Register a new user
 * @access public
 */
async function registerUserController(req, res) {
    const { username, email, password } = req.body;

    if(!username || !email || !password) {
        return res.status(400).json({ message: "Please provide username,email and password" });
    }
    const isUserExist = await userModel.findOne({
        $or: [{ username }, { email }]
     });

     if(isUserExist) {
        return res.status(400).json({ message: "Username or email already exists" });
     }


const hashedPassword = await bcrypt.hash(password, 10);

const user= await userModel.create({
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

res.status(201).json({ message: "User registered successfully", user: { id: user._id, username: user.username, email: user.email }, token })
}

/**
 * @name loginUserController
 * @description login a user,expects username and password in the request body, returns a JWT token if successful
 * @access public
 * 
 */

async function loginUserController(req,res){
    const { email, password}= req.body;

    const user =await userModel.findOne({ email})

    if(!user){
        return res.status(400).json({ message:"invalid username or password"})
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if(!isPasswordValid){
        return res.status(400).json({ message:"invalid username or password"})
    }

    const token=jwt.sign(
        {id: user._id, username: user.username},
        process.env.JWT_SECRET,
        { expiresIn: "1d"}
    )

    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: 'none' });

    res.status(200).json({ message: "User logged in successfully", user: { id: user._id, username: user.username, email: user.email }, token })
}

async function logoutUserController(req, res) {
    const token =req.cookies.token;
     
    if(token){
        await tokenBlacklistModel.create({ token });
    }
    
    res.clearCookie("token", { httpOnly: true, secure: true, sameSite: 'none' });

    res.status(200).json({ 
        message: "User logged out successfully" 
    });
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
    sendOTP,
    registerWithOTP,
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
};