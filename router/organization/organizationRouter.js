

const express = require("express");
const authController = require("../../controller/organization/authController");
const router = express.Router();

router.post("/sign_in", authMiddleware.isOrganizationLogged, authController.signInController)
router.post("/forget_password", authMiddleware.isOrganizationLogged, authController.forgetPasswordController)
router.post("/reset_password", authMiddleware.isOrganizationLogged, authController.resetPasswordController)


module.exports = router;