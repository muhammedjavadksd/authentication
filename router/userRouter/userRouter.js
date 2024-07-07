"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = __importDefault(require("../../middleware/authMiddleware"));
const authController_1 = __importDefault(require("../../controller/userController/authController"));
const router = express_1.default.Router();
// GET METHOD
// POST METHOD 
router.post("/sign_up", authController_1.default.signUpController);
router.post("/sign_in", authController_1.default.signInController);
router.post("/auth_otp_submission", authMiddleware_1.default.isValidSignUpTrying, authController_1.default.AuthOTPSubmission);
router.post("/resend_otp", authMiddleware_1.default.isValidSignUpTrying, authController_1.default.resetOtpNumber);
//PUT METHOD
router.put("/edit_auth_phone", authMiddleware_1.default.isValidSignUpTrying, authController_1.default.editAuthPhoneNumber);
exports.default = router;
