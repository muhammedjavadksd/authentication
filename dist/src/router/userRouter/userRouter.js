"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = __importDefault(require("../../controller/userController/authController"));
const authMiddleware_1 = __importDefault(require("../../middleware/authMiddleware"));
const router = express_1.default.Router();
const AuthController = new authController_1.default();
const UserMiddleware = new authMiddleware_1.default();
// POST METHOD 
router.post("/sign_up", AuthController.signUpController);
router.post("/sign_in", AuthController.signInController);
router.post("/auth_otp_submission", UserMiddleware.isValidSignUpAttempt, AuthController.AuthOTPSubmission);
router.post("/resend_otp", UserMiddleware.isValidSignUpAttempt, AuthController.resetOtpNumber);
//PUT METHOD
router.put("/edit_auth_phone", UserMiddleware.isValidSignUpAttempt, AuthController.editAuthPhoneNumber);
exports.default = router;
