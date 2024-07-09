
import * as express from 'express'
import authController from '../../controller/adminController/authController';
import authMiddleware from '../../middleware/authMiddleware';
import AdminController from '../../controller/adminController/authController';

const adminRouter: express.Router = express.Router();
const adminController = new AdminController();

adminRouter.post("/sign_in", authMiddleware.isAdminLogged, adminController.signInController)
adminRouter.post("/forget_password", authMiddleware.isAdminLogged, adminController.forgetPasswordController)
adminRouter.post("/reset_password", authMiddleware.isAdminLogged, adminController.forgetPasswordController)

export default adminRouter

