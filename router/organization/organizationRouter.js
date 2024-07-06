

const express = require("express");
const authController = require("../../controller/organization/authController");
const organizationRouter = express.Router();
const multer = require("multer");
const organizationStorage = require("../../helper/multerStorage");


const kycStorage = multer({ storage: organizationStorage.kycMulter })
const logoStorage = multer({ storage: organizationStorage.logoPicture })

organizationRouter.post("/sign_up", logoStorage.single("logo"), kycStorage.single("office"), kycStorage.single("registration_photo"), kycStorage.single("pan_card"), authController.signUpController)
organizationRouter.post("/sign_in", authController.signInController)
organizationRouter.post("/forget_password", authController.forgetPasswordController)
organizationRouter.post("/reset_password", authController.resetPasswordController)


module.exports = organizationRouter;