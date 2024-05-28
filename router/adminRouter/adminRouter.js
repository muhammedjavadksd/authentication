

const express = require("express");
const authController = require("../../controller/adminController/authController");
const authMiddleware = require("../../middleware/authMiddleware");
const router = express.Router();

router.post("/sign_in", authMiddleware.isAdminLogged, authController.signUpController)
router.post("/forget_password", authMiddleware.isAdminLogged, authController.forgetPasswordController)
router.post("/reset_password", authMiddleware.isAdminLogged, authController.signUpController)


module.exports = router;

