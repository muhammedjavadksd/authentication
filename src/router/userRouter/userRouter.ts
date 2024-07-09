import express, { Router } from "express";
import authMiddleware from "../../middleware/authMiddleware";
import authController from "../../controller/userController/authController";
import UserAuthController from "../../controller/userController/authController";

const router: Router = express.Router();
const AuthController = new UserAuthController()

// POST METHOD 
router.post("/sign_up", AuthController.signUpController);
router.post("/sign_in", AuthController.signInController);
router.post("/auth_otp_submission", authMiddleware.isValidSignUpTrying, AuthController.AuthOTPSubmission);
router.post("/resend_otp", authMiddleware.isValidSignUpTrying, AuthController.resetOtpNumber);

//PUT METHOD
router.put("/edit_auth_phone", authMiddleware.isValidSignUpTrying, AuthController.editAuthPhoneNumber);

export default router;

