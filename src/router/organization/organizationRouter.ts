

import express from 'express'
import multer from 'multer';
import organizationStorage from '../../helper/multerStorage';
import authController from '../../controller/organization/authController';

const kycStorage = multer({ storage: organizationStorage.kycMulter })
const logoStorage = multer({ storage: organizationStorage.logoPicture })

const organizationRouter: express.Router = express.Router();

organizationRouter.post("/sign_up", logoStorage.single("logo"), kycStorage.single("office"), kycStorage.single("registration_photo"), kycStorage.single("pan_card"), authController.signUpController)
organizationRouter.post("/sign_in", authController.signInController)
organizationRouter.post("/forget_password", authController.forgetPasswordController)
organizationRouter.post("/reset_password", authController.resetPasswordController)


export default organizationRouter