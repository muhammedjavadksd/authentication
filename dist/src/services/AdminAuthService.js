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
const notification_service_1 = __importDefault(require("../communication/Provider/notification/notification_service"));
const const_1 = __importDefault(require("../config/const"));
const AdminAuthentication_1 = __importDefault(require("../repositories/AdminAuthentication"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const tokenHelper_1 = __importDefault(require("../helper/tokenHelper"));
const Enums_1 = require("../config/Datas/Enums");
class AdminAuthService {
    constructor() {
        this.signIn = this.signIn.bind(this);
        this.forgetPassword = this.forgetPassword.bind(this);
        this.resetPassword = this.resetPassword.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
        this.verifyToken = this.verifyToken.bind(this);
        this.AdminAuthRepo = new AdminAuthentication_1.default();
        this.tokenHelpers = new tokenHelper_1.default();
    }
    verifyToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const decodeToken = yield this.tokenHelpers.checkTokenValidity(token);
            if (decodeToken && typeof decodeToken == "object") {
                const email_id = decodeToken['email_id'];
                const adminEmail = decodeToken['admin_email'];
                if (email_id && adminEmail) {
                    const findAdmin = yield this.AdminAuthRepo.findAdmin(adminEmail);
                    if (findAdmin) {
                        findAdmin.email_address = email_id;
                        const updateEmailId = yield this.AdminAuthRepo.updateAdmin(findAdmin);
                        if (updateEmailId) {
                            return {
                                msg: "Email id has been updated",
                                status: true,
                                statusCode: Enums_1.StatusCode.OK
                            };
                        }
                    }
                }
            }
            return {
                msg: "Admin not found",
                status: false,
                statusCode: Enums_1.StatusCode.BAD_REQUEST
            };
        });
    }
    updatePassword(password, email_id, admin_email) {
        return __awaiter(this, void 0, void 0, function* () {
            const findAdmin = yield this.AdminAuthRepo.findAdmin(admin_email);
            if (findAdmin) {
                const decodePassword = password ? yield bcrypt_1.default.hash(password, Number(process.env.BCRYPT_SALTROUND)) : findAdmin.password;
                if (decodePassword == findAdmin.password && password) {
                    return {
                        status: false,
                        msg: "Use a diffrent password",
                        statusCode: Enums_1.StatusCode.BAD_REQUEST
                    };
                }
                else {
                    if (admin_email != email_id) {
                        const verifyPayload = {
                            email_id,
                            admin_email
                        };
                        const verifyToken = yield this.tokenHelpers.generateJWtToken(verifyPayload, Enums_1.JwtTimer.OtpTimer);
                        if (verifyPayload) {
                            const provider = new notification_service_1.default(process.env.ADMIN_UPDATE_VERIFY || "");
                            yield provider._init_();
                            provider.dataTransfer({ token: verifyToken, email_id: admin_email });
                        }
                    }
                    findAdmin.password = decodePassword;
                    const updatePassword = yield this.AdminAuthRepo.updateAdmin(findAdmin);
                    if (updatePassword) {
                        return {
                            status: true,
                            msg: "Password update success",
                            statusCode: Enums_1.StatusCode.OK
                        };
                    }
                    else {
                        return {
                            status: false,
                            msg: "Password update failed",
                            statusCode: Enums_1.StatusCode.BAD_REQUEST
                        };
                    }
                }
            }
            else {
                return {
                    msg: "We couldn't find the admin",
                    status: false,
                    statusCode: Enums_1.StatusCode.UNAUTHORIZED
                };
            }
        });
    }
    signIn(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const findAdmin = yield this.AdminAuthRepo.findAdmin(email);
                if (findAdmin) {
                    const adminPassword = findAdmin.password;
                    if (adminPassword) {
                        const comparePassword = yield bcrypt_1.default.compare(password, adminPassword);
                        const token = yield this.tokenHelpers.generateJWtToken({ email: findAdmin.email_address, type: const_1.default.JWT_FOR.ADMIN_AUTH, role: "admin", profile_id: "admin_profile", user_id: findAdmin._id }, Enums_1.JwtTimer.RefreshTokenExpiresInDays);
                        if (comparePassword && token) {
                            findAdmin.token = token !== null && token !== void 0 ? token : "";
                            yield this.AdminAuthRepo.updateAdmin(findAdmin);
                            return {
                                statusCode: Enums_1.StatusCode.OK,
                                status: true,
                                msg: "Admin auth success",
                                data: {
                                    email: email,
                                    name: findAdmin.name,
                                    token,
                                    role: "admin"
                                }
                            };
                        }
                        else {
                            return {
                                statusCode: Enums_1.StatusCode.UNAUTHORIZED,
                                status: false,
                                msg: "Incorrect Password",
                            };
                        }
                    }
                    else {
                        return {
                            statusCode: Enums_1.StatusCode.BAD_REQUEST,
                            status: false,
                            msg: "Please provide valid password",
                        };
                    }
                }
                else {
                    return {
                        statusCode: Enums_1.StatusCode.BAD_REQUEST,
                        status: false,
                        msg: "Email id is not found",
                    };
                }
            }
            catch (e) {
                console.log(e);
                return {
                    statusCode: Enums_1.StatusCode.SERVER_ERROR,
                    status: false,
                    msg: "Internal Server Error",
                };
            }
        });
    }
    forgetPassword(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const findAdmin = yield this.AdminAuthRepo.findAdmin(email);
                const token = yield this.tokenHelpers.generateJWtToken({ email, type: const_1.default.MAIL_TYPE.ADMIN_PASSWORD_REST }, Enums_1.JwtTimer.OtpTimer);
                if (findAdmin && token) {
                    findAdmin.token = token;
                    yield this.AdminAuthRepo.updateAdmin(findAdmin);
                    const authCommunicationProvider = new notification_service_1.default(process.env.ADMIN_FORGETPASSWORD_EMAIL);
                    yield authCommunicationProvider._init_();
                    authCommunicationProvider.adminForgetPasswordEmail({
                        token: token,
                        email,
                        name: findAdmin.name
                    });
                    return {
                        status: true,
                        statusCode: Enums_1.StatusCode.OK,
                        msg: "Reset email has been sent"
                    };
                }
                else {
                    return {
                        status: false,
                        statusCode: Enums_1.StatusCode.OK,
                        msg: "We couldn't locate the admin you're looking for."
                    };
                }
            }
            catch (e) {
                return {
                    status: false,
                    statusCode: Enums_1.StatusCode.SERVER_ERROR,
                    msg: "Internal Server Error"
                };
            }
        });
    }
    resetPassword(token, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const isTokenValid = yield this.tokenHelpers.checkTokenValidity(token);
            if (isTokenValid && typeof isTokenValid == "object") {
                const email_id = isTokenValid.email;
                if (email_id) {
                    const findAdmin = yield this.AdminAuthRepo.findAdmin(email_id); //AdminAuthModel.findOne({ email_address: email_id })
                    if (findAdmin && findAdmin.password) {
                        if (findAdmin.token == token) {
                            const newPassword = yield bcrypt_1.default.hash(password, Number(process.env.BCRYPT_SALTROUND));
                            const comparePassword = yield bcrypt_1.default.compare(password, findAdmin.password);
                            if (comparePassword) {
                                return {
                                    status: false,
                                    statusCode: Enums_1.StatusCode.BAD_REQUEST,
                                    msg: "New password cannot be the same as the last used password."
                                };
                            }
                            if (newPassword) {
                                findAdmin.password = newPassword;
                                findAdmin.token = "";
                                this.AdminAuthRepo.updateAdmin(findAdmin);
                                return {
                                    status: true,
                                    statusCode: Enums_1.StatusCode.OK,
                                    msg: "Password has been updated"
                                };
                            }
                            else {
                                return {
                                    status: false,
                                    statusCode: Enums_1.StatusCode.SERVER_ERROR,
                                    msg: "Internal Server Error"
                                };
                            }
                        }
                    }
                }
            }
            return {
                status: false,
                statusCode: Enums_1.StatusCode.UNAUTHORIZED,
                msg: "Invalid Token ID"
            };
        });
    }
}
exports.default = AdminAuthService;
