const{Router} = require('express');

const authController = require('../controller/auth.controller');

const authRouter = Router();
const authMiddleware  = require('../middleware/auth.middleware');

/**
 * @route post /api/auth/register
 * @description Register a new user
 * @access public
 */

authRouter.post('/register', authController.registerUserController);

/**
 * @route post /api/auth/login
 * @description Login a user with email and password
 * @access public
 */

authRouter.post('/login', authController.loginUserController);

/**
 * @route get /api/auth/logout
 * @description Logout a user by blacklisting the token
 * @access public
 */

authRouter.get('/logout', authController.logoutUserController);

/**
 * @route get /api/auth/get-me
 * @description Get the details of the logged-in user
 * @access private
 */

authRouter.get('/get-me',authMiddleware.authUser,authController.getMeController);


module.exports = authRouter;
