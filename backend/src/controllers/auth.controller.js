const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/blacklist.model");
const OTP = require("../models/otp.model");
const nodemailer = require("nodemailer");
const dns = require("dns");

// FORCE IPv4 DNS RESOLUTION TO FIX RENDER'S ENETUNREACH BUG!
try {
  if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch (e) {
  console.warn("dns.setDefaultResultOrder not supported on this Node version.");
}

/**
 * Nodemailer Transporter Setup (Use App Passwords from Gmail)
 */

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  requireTLS: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    // do not fail on invalid certs
    rejectUnauthorized: false,
  }
});

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

        // Save OTP to Database
        await OTP.create({
            email,
            otp: generatedOtp
        });

        // --- RENDER FREE TIER WORKAROUND ---
        // Render blocks outbound SMTP, causing Nodemailer to fail.
        // We print the OTP to the Render server logs so you can still test your app!
        console.log(`\n========================================`);
        console.log(`🔑 DEVELOPMENT OTP FOR ${email}: ${generatedOtp}`);
        console.log(`========================================\n`);

        // Send Email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "OTP Verification",
            text: `Your OTP is: ${generatedOtp}`
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log("Email sent successfully!");
        } catch (emailError) {
            console.warn("⚠️ Nodemailer failed (Render Free Tier block). Continuing anyway...");
        }

        // ALWAYS return 200 OK so the frontend can proceed to the OTP input screen!
        res.status(200).json({ message: "OTP generated successfully! Check Render logs." });

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
     //console.log("Logout route hit");
    const token =req.cookies.token;
     //console.log("Token:", token);
     //console.log("Cookies:", req.cookies);
     
    if(token){
        await tokenBlacklistModel.create({ token });
          //console.log("Token saved to blacklist");
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
    const user = await userModel.findById(req.user.id);

    res.status(200).json({
        message: "User details fetched successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    });
}

module.exports = {
    sendOTP,
    registerWithOTP,
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
};