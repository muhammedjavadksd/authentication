"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = __importDefault(require("../controller/userController"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const router = express_1.default.Router();
const AuthController = new userController_1.default();
const UserMiddleware = new authMiddleware_1.default();
// POST METHOD 
router.post("/sign_up", UserMiddleware.isUserLogged, AuthController.signWithToken);
router.post("/sign_in", AuthController.signInController);
router.post("/sign_in_with_token", UserMiddleware.isUserLogged, AuthController.signWithToken); //retry login attemo for logged users
router.post("/auth_otp_submission", UserMiddleware.isValidSignUpAttempt, AuthController.AuthOTPSubmission);
router.post("/resend_otp", UserMiddleware.isValidSignUpAttempt, AuthController.resetOtpNumber);
//PUT METHOD
router.put("/edit_auth_phone", UserMiddleware.isValidSignUpAttempt, AuthController.editAuthPhoneNumber);
//PATCH METHOD
router.patch("/update_auth", UserMiddleware.isUserLogged, AuthController.updateAuth);
exports.default = router;
