
import * as express from 'express'
import authController from '../../controller/adminController/authController';
import authMiddleware from '../../middleware/authMiddleware';

const adminRouter: express.Router = express.Router();

adminRouter.post("/sign_in", authMiddleware.isAdminLogged, authController.signInController)
adminRouter.post("/forget_password", authMiddleware.isAdminLogged, authController.forgetPasswordController)
adminRouter.post("/reset_password", authMiddleware.isAdminLogged, authController.adminPasswordReset)

export default adminRouter

