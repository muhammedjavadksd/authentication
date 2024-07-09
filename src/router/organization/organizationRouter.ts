

import express from 'express'
import multer from 'multer';
import OrganizationController from '../../controller/organization/authController';
import organizationStorage from '../../helper/multer/multerStorage';

const kycStorage = multer({ storage: organizationStorage.kycMulter })
const logoStorage = multer({ storage: organizationStorage.logoPicture })

const organizationRouter: express.Router = express.Router();
const organizationController = new OrganizationController();

organizationRouter.post("/sign_up", logoStorage.single("logo"), kycStorage.single("office"), kycStorage.single("registration_photo"), kycStorage.single("pan_card"), organizationController.signUpController)
organizationRouter.post("/sign_in", organizationController.signInController)
organizationRouter.post("/forget_password", organizationController.forgetPasswordController)
organizationRouter.post("/reset_password", organizationController.resetPasswordController)


export default organizationRouter