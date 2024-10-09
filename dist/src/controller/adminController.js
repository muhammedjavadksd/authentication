"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AdminAuthService_1 = __importDefault(require("../services/AdminAuthService"));
const Enums_1 = require("../config/Datas/Enums");
const utilHelper_1 = __importDefault(require("../helper/utilHelper"));
class AdminController {
    constructor() {
        this.signInController = this.signInController.bind(this);
        this.forgetPasswordController = this.forgetPasswordController.bind(this);
        this.adminPasswordReset = this.adminPasswordReset.bind(this);
        this.updateSettings = this.updateSettings.bind(this);
        this.verifyToken = this.verifyToken.bind(this);
        this.AdminServices = new AdminAuthService_1.default();
    }
    verifyToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const authToken = req.headers['authorization'];
            const token = utilHelper_1.default.getTokenFromHeader(authToken);
            if (token) {
                const emailEmail = yield this.AdminServices.verifyToken(token);
                res.status(emailEmail.statusCode).json({ status: emailEmail.status, msg: emailEmail.msg, data: emailEmail.data });
            }
            else {
                res.status(Enums_1.StatusCode.UNAUTHORIZED).json({ status: false, msg: "Un authraized access" });
            }
        });
    }
    updateSettings(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const password = req.body.password;
            const email_id = req.body.email_id;
            const admin_email = (_a = req.context) === null || _a === void 0 ? void 0 : _a.email_id;
            if (email_id || password) {
                const updatePassword = yield this.AdminServices.updatePassword(password, email_id, admin_email);
                res.status(updatePassword.statusCode).json({ status: updatePassword.status, msg: updatePassword.msg, data: updatePassword.data });
            }
            else {
                res.status(Enums_1.StatusCode.UNAUTHORIZED).json({ status: false, msg: "Un authraized access" });
            }
        });
    }
    signInController(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const email_address = req.body.email_address;
            const password = req.body.password;
            try {
                const adminAuthAttempt = yield this.AdminServices.signIn(email_address, password);
                if (adminAuthAttempt.status) {
                    const helperData = adminAuthAttempt.data;
                    if (helperData) {
                        const response = {
                            status: adminAuthAttempt.status,
                            msg: adminAuthAttempt.msg,
                            data: {
                                email: helperData.email,
                                name: helperData.name,
                                token: helperData.token
                            }
                        };
                        res.status(adminAuthAttempt.statusCode).json(response);
                    }
                    else {
                        const response = {
                            status: adminAuthAttempt.status,
                            msg: adminAuthAttempt.msg,
                        };
                        console.log(adminAuthAttempt.msg);
                        res.status(adminAuthAttempt.statusCode).json(response);
                    }
                }
                else {
                    const response = {
                        status: false,
                        msg: adminAuthAttempt.msg,
                    };
                    res.status(adminAuthAttempt.statusCode).json(response);
                }
            }
            catch (e) {
                const response = {
                    status: false,
                    msg: "Internal server error",
                };
                res.status(Enums_1.StatusCode.SERVER_ERROR).json(response);
            }
        });
    }
    forgetPasswordController(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const email_id = req.body.email_id;
                const adminResetRequest = yield this.AdminServices.forgetPassword(email_id);
                res.status(adminResetRequest.statusCode).json({ status: true, msg: adminResetRequest.msg });
            }
            catch (e) {
                res.status(Enums_1.StatusCode.SERVER_ERROR).json({ status: false, msg: "Internal Server Error" });
            }
        });
    }
    adminPasswordReset(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = req.params.token;
                const password = req.body.password;
                if (password && token) {
                    const resetPassword = yield this.AdminServices.resetPassword(token, password);
                    res.status(resetPassword.statusCode).json({
                        status: resetPassword.status,
                        msg: resetPassword.msg,
                    });
                }
                else {
                    res.status(Enums_1.StatusCode.UNAUTHORIZED).json({
                        status: false,
                        msg: "Please provide a password",
                    });
                }
            }
            catch (e) {
                console.log(e);
                res.status(Enums_1.StatusCode.SERVER_ERROR).json({
                    status: false,
                    msg: "Internal Servor Error",
                });
            }
        });
    }
}
exports.default = AdminController;
