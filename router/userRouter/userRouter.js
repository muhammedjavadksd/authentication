

const express = require("express");
const authMiddleware = require("../../middleware/authMiddleware");
const authController = require("../../controller/userController.js/authController");
const router = express.Router();

router.post("/sign_up", authMiddleware.isUserLogged, authController.signUpController)
router.post("/sign_in", authMiddleware.isUserLogged, authController.signInController)
router.post("/auth_otp_submission", authMiddleware.isUserLogged, authController.AuthOTPSubmission)


module.exports = router;