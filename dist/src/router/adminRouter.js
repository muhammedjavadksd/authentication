"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = __importStar(require("express"));
const adminController_1 = __importDefault(require("../controller/adminController"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const adminRouter = express.Router();
const adminController = new adminController_1.default();
const adminMiddleware = new authMiddleware_1.default();
adminRouter.post("/organization/view/:limit/:skip/", adminMiddleware.isAdminLogged, adminController.organizationPaginationView);
adminRouter.post("/organization/:organization_id", adminMiddleware.isAdminLogged, adminController.organizationSingleView);
adminRouter.post("/sign_in", adminMiddleware.isAdminLogged, adminController.signInController);
adminRouter.post("/forget_password", adminMiddleware.isAdminLogged, adminController.forgetPasswordController);
adminRouter.post("/reset_password/:token", adminMiddleware.isAdminLogged, adminController.adminPasswordReset);
adminRouter.post("/update_organization_status", adminMiddleware.isAdminLogged, adminController.updateOrganizationStatus);
exports.default = adminRouter;