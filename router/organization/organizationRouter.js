"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const express = require("express");
const express_1 = __importDefault(require("express"));
// import authController from '../../controller/adminController/authController';
// authController
const multer_1 = __importDefault(require("multer"));
// const authController = require("../../controller/organization/authController");
// authController
const organizationRouter = express_1.default.Router();
// const multer = require("multer");
// multer
// const organizationStorage = require("../../helper/multerStorage");
const multerStorage_1 = __importDefault(require("../../helper/multerStorage"));
const authController_1 = __importDefault(require("../../controller/organization/authController"));
const kycStorage = (0, multer_1.default)({ storage: multerStorage_1.default.kycMulter });
const logoStorage = (0, multer_1.default)({ storage: multerStorage_1.default.logoPicture });
organizationRouter.post("/sign_up", logoStorage.single("logo"), kycStorage.single("office"), kycStorage.single("registration_photo"), kycStorage.single("pan_card"), authController_1.default.signUpController);
organizationRouter.post("/sign_in", authController_1.default.signInController);
organizationRouter.post("/forget_password", authController_1.default.forgetPasswordController);
organizationRouter.post("/reset_password", authController_1.default.resetPasswordController);
// module.exports = organizationRouter;
exports.default = organizationRouter;
