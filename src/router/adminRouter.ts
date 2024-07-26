
import * as express from 'express'
import authMiddleware from '../middleware/authMiddleware';
import AdminController from '../controller/adminController';
import AuthMiddleware from '../middleware/authMiddleware';

const adminRouter: express.Router = express.Router();
const adminController = new AdminController();
const adminMiddleware = new AuthMiddleware();

adminRouter.post("/organization/view/:limit/:skip/:per_page", adminMiddleware.isAdminLogged, adminController.signInController)
adminRouter.post("/organization/:organization_id", adminMiddleware.isAdminLogged, adminController.signInController)

adminRouter.post("/sign_in", adminMiddleware.isAdminLogged, adminController.signInController)
adminRouter.post("/forget_password", adminMiddleware.isAdminLogged, adminController.forgetPasswordController)
adminRouter.post("/reset_password/:token", adminMiddleware.isAdminLogged, adminController.adminPasswordReset)
adminRouter.post("/update_organization_status", adminMiddleware.isAdminLogged, adminController.updateOrganizationStatus)

export default adminRouter

