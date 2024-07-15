import express, { Router } from "express";
import UserAuthController from "../controller/userController";
import AuthMiddleware from "../middleware/authMiddleware";

const router: Router = express.Router();
const AuthController = new UserAuthController()
const UserMiddleware = new AuthMiddleware()




// POST METHOD 
router.post("/sign_up", AuthController.signUpController);
router.post("/sign_in", AuthController.signInController);
router.post("/auth_otp_submission", UserMiddleware.isValidSignUpAttempt, AuthController.AuthOTPSubmission);
router.post("/resend_otp", UserMiddleware.isValidSignUpAttempt, AuthController.resetOtpNumber);

//PUT METHOD
router.put("/edit_auth_phone", UserMiddleware.isValidSignUpAttempt, AuthController.editAuthPhoneNumber);

export default router;

