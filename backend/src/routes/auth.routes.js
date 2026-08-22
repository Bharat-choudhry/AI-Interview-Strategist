const { Router } = require('express')
const authController = require("../controllers/auth.controller")
const authMiddleware = require("../middlewares/auth.middleware")
const { sendOTP, registerWithOTP } = require('../controllers/auth.controller');
const authRouter = Router()

/**
 * @route POST /api/auth/send-otp
 * @description Send OTP to user email
 * @access Public
 */
authRouter.post('/send-otp', sendOTP);

/**
 * @route POST /api/auth/register
 * @description Register a new user WITH OTP
 * @access Public
 */
// FIX: Purana 'authController.registerUserController' hata diya aur 'registerWithOTP' lagaya
authRouter.post("/register", registerWithOTP);

/**
 * @route POST /api/auth/login
 * @description login user with email and password
 * @access Public
 */
authRouter.post("/login", authController.loginUserController)

/**
 * @route GET /api/auth/logout
 * @description clear token from user cookie and add the token in blacklist
 * @access public
 */
authRouter.get("/logout", authController.logoutUserController)

/**
 * @route GET /api/auth/get-me
 * @description get the current logged in user details
 * @access private
 */
authRouter.get("/get-me", authMiddleware.authUser, authController.getMeController)


module.exports = authRouter;