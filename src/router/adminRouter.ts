
import * as express from 'express'
import authMiddleware from '../middleware/authMiddleware';
import AdminController from '../controller/adminController';
import AuthMiddleware from '../middleware/authMiddleware';

const adminRouter: express.Router = express.Router();
const adminController = new AdminController();
const adminMiddleware = new AuthMiddleware();

adminRouter.post("/sign_in", adminController.signInController)
adminRouter.post("/forget_password", adminController.forgetPasswordController)
adminRouter.post("/reset_password/:token", adminController.adminPasswordReset)

adminRouter.patch("/update-settings", adminMiddleware.isAdminLogged, adminController.updateSettings)

export default adminRouter

