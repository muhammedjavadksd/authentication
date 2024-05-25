

const express = require("express");
const authController = require("../../controller/adminController/authController");
const router = express.Router();

router.post("/forget_password", authMiddleware.isAdminLogged, authController.signUpController)
router.post("/reset_password/:token", authMiddleware.isAdminLogged, authController.signUpController)


module.exports = router;