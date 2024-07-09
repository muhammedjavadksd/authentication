
import * as express from 'express'
import authMiddleware from '../../middleware/authMiddleware';
import AdminController from '../../controller/adminController/authController';
import AuthMiddleware from '../../middleware/authMiddleware';

const adminRouter: express.Router = express.Router();
const adminController = new AdminController();
const adminMiddleware = new AuthMiddleware();

adminRouter.post("/sign_in", adminMiddleware.isAdminLogged, adminController.signInController)
adminRouter.post("/forget_password", adminMiddleware.isAdminLogged, adminController.forgetPasswordController)
adminRouter.post("/reset_password", adminMiddleware.isAdminLogged, adminController.adminPasswordReset)

export default adminRouter

