"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const multerStorage_1 = __importDefault(require("../../helper/multerStorage"));
const authController_1 = __importDefault(require("../../controller/organization/authController"));
const kycStorage = (0, multer_1.default)({ storage: multerStorage_1.default.kycMulter });
const logoStorage = (0, multer_1.default)({ storage: multerStorage_1.default.logoPicture });
const organizationRouter = express_1.default.Router();
const organizationController = new authController_1.default();
organizationRouter.post("/sign_up", logoStorage.single("logo"), kycStorage.single("office"), kycStorage.single("registration_photo"), kycStorage.single("pan_card"), organizationController.signUpController);
organizationRouter.post("/sign_in", organizationController.signInController);
organizationRouter.post("/forget_password", organizationController.forgetPasswordController);
organizationRouter.post("/reset_password", organizationController.resetPasswordController);
exports.default = organizationRouter;
