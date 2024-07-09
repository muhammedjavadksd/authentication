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
const authAdminHelper_1 = __importDefault(require("../../helper/authAdminHelper"));
let authController = {
    signInController: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const email_address = req.body.email_address;
        const password = req.body.password;
        try {
            const adminAuthAttempt = yield authAdminHelper_1.default.signInHelper(email_address, password);
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
                res.status(adminAuthAttempt.statusCode).json(response);
            }
        }
        catch (e) {
            const response = {
                status: false,
                msg: "Internal server error",
            };
            res.status(500).json(response);
        }
    }),
    forgetPasswordController: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let email_id = req.body.email_id;
            let adminResetRequest = yield authAdminHelper_1.default.forgetPasswordHelpers(email_id);
            res.status(adminResetRequest.statusCode).json({ status: true, msg: adminResetRequest.msg });
        }
        catch (e) {
            console.log(e);
            res.status(500).json({ status: false, msg: "Internal Server Error" });
        }
    }),
    adminPasswordReset: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let token = authAdminHelper_1.default.getTokenFromHeader(req['headers']['authorization']);
            let password = req.body.password;
            if (password && token) {
                const resetPassword = yield authAdminHelper_1.default.resetPassword(token, password);
                res.status(resetPassword.statusCode).json({
                    status: resetPassword.status,
                    msg: resetPassword.msg,
                });
            }
            else {
                res.status(401).json({
                    status: false,
                    msg: "Please provide a password",
                });
            }
        }
        catch (e) {
            console.log(e);
            res.status(500).json({
                status: false,
                msg: "Internal Servor Error",
            });
        }
    })
};
exports.default = authController;
