

const express = require("express");
const authMiddleware = require("../../middleware/authMiddleware");
const authController = require("../../controller/userController.js/authController");
const router = express.Router();

router.post("/sign_up", authController.signUpController)
router.post("/sign_in", authController.signInController)
router.post("/auth_otp_submission", authMiddleware.isValidSignUpTrying, authController.AuthOTPSubmission)
router.post("/edit_auth_phone", authMiddleware.isValidSignUpTrying, authController.editAuthPhoneNumber)


module.exports = router;