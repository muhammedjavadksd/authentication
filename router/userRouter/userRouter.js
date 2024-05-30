

const express = require("express");
const authMiddleware = require("../../middleware/authMiddleware");
const authController = require("../../controller/userController/authController");
const router = express.Router();

// GET METHOD

// POST METHOD 
router.post("/sign_up", authController.signUpController)
router.post("/sign_in", authController.signInController)
router.post("/auth_otp_submission", authMiddleware.isValidSignUpTrying, authController.AuthOTPSubmission)
router.post("/resend_otp", authMiddleware.isValidSignUpTrying, authController.resetOtpNumber)

//PUT METHOD
router.put("/edit_auth_phone", authMiddleware.isValidSignUpTrying, authController.editAuthPhoneNumber)



module.exports = router;