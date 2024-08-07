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
// const bcrypt = require("bcrypt");
const bcrypt_1 = __importDefault(require("bcrypt"));
// const AdminAuthModel = require("../db/models/adminAuth");
const adminAuth_1 = __importDefault(require("../db/models/adminAuth"));
// const COMMUNICATION_PROVIDER = require("../communication/Provider/notification/notification_service");
const notification_service_1 = __importDefault(require("../communication/Provider/notification/notification_service"));
// const tokenHelper = require("./tokenHelper");
const tokenHelper_1 = __importDefault(require("./tokenHelper"));
// const { MAIL_TYPE } = require("../config/const");
const const_1 = __importDefault(require("../config/const"));
let authAdminHelper = {
    signInHelper: (email, password) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let findAdmin = yield adminAuth_1.default.findOne({ email_address: email });
            if (findAdmin) {
                console.log("Got admin");
                let adminPassword = findAdmin.password;
                if (adminPassword) {
                    let comparePassword = yield bcrypt_1.default.compare(password, adminPassword);
                    let token = yield tokenHelper_1.default.createJWTToken({ email: findAdmin.email_address, type: const_1.default.JWT_FOR.ADMIN_AUTH }, const_1.default.USERAUTH_EXPIRE_TIME.toString());
                    if (comparePassword && token) {
                        return {
                            statusCode: 200,
                            status: true,
                            msg: "Admin auth success",
                            data: {
                                email: email,
                                name: findAdmin.name,
                                token
                            }
                        };
                    }
                    else {
                        console.log("Creditial is wrong");
                        return {
                            statusCode: 401,
                            status: false,
                            msg: "Incorrect Password",
                        };
                    }
                }
                else {
                    return {
                        statusCode: 400,
                        status: false,
                        msg: "Please provide valid password",
                    };
                }
            }
            else {
                return {
                    statusCode: 401,
                    status: false,
                    msg: "Email id is not found",
                };
            }
        }
        catch (e) {
            console.log(e);
            return {
                statusCode: 500,
                status: false,
                msg: "Internal Server Error",
            };
        }
    }),
    forgetPasswordHelpers: (email) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let findAdmin = yield adminAuth_1.default.findOne({ email_address: email });
            let token = yield tokenHelper_1.default.createJWTToken({ email, type: const_1.default.MAIL_TYPE.ADMIN_PASSWORD_REST }, const_1.default.OTP_EXPIRE_TIME.toString());
            if (findAdmin && token) {
                findAdmin.token = token;
                yield findAdmin.save();
                notification_service_1.default.adminForgetPasswordEmail({
                    token: token,
                    email,
                    name: findAdmin.name
                });
                return {
                    status: true,
                    statusCode: 200,
                    msg: "Reset email has been sent"
                };
            }
            else {
                return {
                    status: false,
                    statusCode: 401,
                    msg: "We couldn't locate the admin you're looking for."
                };
            }
        }
        catch (e) {
            console.log(e);
            return {
                status: false,
                statusCode: 500,
                msg: "Internal Server Error"
            };
        }
    }),
    resetPassword: (token, password) => __awaiter(void 0, void 0, void 0, function* () {
        let isTokenValid = yield tokenHelper_1.default.checkTokenValidity(token);
        if (isTokenValid) {
            if (typeof isTokenValid == "object") {
                let email_id = isTokenValid.email;
                let findAdmin = yield adminAuth_1.default.findOne({ email_address: email_id });
                if (findAdmin && findAdmin.pasword) {
                    if (findAdmin.token == token) {
                        let newPassword = yield bcrypt_1.default.hash(password, Number(process.env.BCRYPT_SALTROUND));
                        let comparePassword = yield bcrypt_1.default.compare(password, findAdmin.password);
                        if (comparePassword) {
                            return {
                                status: false,
                                statusCode: 400,
                                msg: "New password cannot be the same as the last used password."
                            };
                        }
                        if (newPassword) {
                            findAdmin.password = newPassword;
                            findAdmin.token = "";
                            yield findAdmin.save();
                            return {
                                status: true,
                                statusCode: 200,
                                msg: "Password has been updated"
                            };
                        }
                        else {
                            return {
                                status: false,
                                statusCode: 500,
                                msg: "Internal Server Error"
                            };
                        }
                    }
                    else {
                        return {
                            status: false,
                            statusCode: 401,
                            msg: "Invalid Token"
                        };
                    }
                }
                else {
                    return {
                        status: false,
                        statusCode: 401,
                        msg: "Invalid Token ID"
                    };
                }
            }
            else {
                return {
                    status: false,
                    statusCode: 401,
                    msg: "Invalid Token ID"
                };
            }
        }
        else {
            return {
                status: false,
                statusCode: 401,
                msg: "Token time has been expired"
            };
        }
    }),
    getTokenFromHeader: (headers) => {
        const splitAuth = headers === null || headers === void 0 ? void 0 : headers.split(" ");
        if (splitAuth && splitAuth[0] == "Bearer") {
            const token = splitAuth[0];
            if (token) {
                return token;
            }
        }
        return false;
    }
};
// module.exports = authAdminHelper
exports.default = authAdminHelper;
