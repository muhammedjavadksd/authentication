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
const OrganizationRepo_1 = __importDefault(require("../repositories/OrganizationRepo"));
class AdminAuthService {
    constructor() {
        this.signIn = this.signIn.bind(this);
        this.forgetPassword = this.forgetPassword.bind(this);
        this.resetPassword = this.resetPassword.bind(this);
        this.AdminAuthRepo = new AdminAuthentication_1.default();
        this.OrganizationRepo = new OrganizationRepo_1.default();
        this.tokenHelpers = new tokenHelper_1.default();
    }
    updatePassword(password, email_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const findAdmin = yield this.AdminAuthRepo.findAdmin(email_id);
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
                    findAdmin.password = decodePassword;
                    findAdmin.email_address = email_id;
                    const updatePassword = yield this.AdminAuthRepo.updateAdmin(findAdmin);
                    if (updatePassword) {
                        return {
                            status: true,
                            msg: "Password update success",
                            statusCode: Enums_1.StatusCode.BAD_REQUEST
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
                const findAdmin = yield this.AdminAuthRepo.findAdmin(email); //await AdminAuthModel.findOne({ email_address: email });
                if (findAdmin) {
                    const adminPassword = findAdmin.password;
                    if (adminPassword) {
                        const comparePassword = yield bcrypt_1.default.compare(password, adminPassword);
                        const token = yield this.tokenHelpers.generateJWtToken({ email: findAdmin.email_address, type: const_1.default.JWT_FOR.ADMIN_AUTH, role: "admin" }, const_1.default.USERAUTH_EXPIRE_TIME.toString());
                        if (comparePassword && token) {
                            findAdmin.token = token !== null && token !== void 0 ? token : "";
                            yield this.AdminAuthRepo.updateAdmin(findAdmin);
                            return {
                                statusCode: 200,
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
        });
    }
    forgetPassword(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const findAdmin = yield this.AdminAuthRepo.findAdmin(email);
                const token = yield this.tokenHelpers.generateJWtToken({ email, type: const_1.default.MAIL_TYPE.ADMIN_PASSWORD_REST }, const_1.default.OTP_EXPIRE_TIME.toString());
                if (findAdmin && token) {
                    findAdmin.token = token;
                    yield this.AdminAuthRepo.updateAdmin(findAdmin);
                    console.log(findAdmin);
                    const authCommunicationProvider = new notification_service_1.default(process.env.ADMIN_FORGETPASSWORD_EMAIL);
                    yield authCommunicationProvider._init_();
                    authCommunicationProvider.adminForgetPasswordEmail({
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
        });
    }
    resetPassword(token, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const isTokenValid = yield this.tokenHelpers.checkTokenValidity(token);
            if (isTokenValid) {
                if (typeof isTokenValid == "object") {
                    const email_id = isTokenValid.email;
                    const findAdmin = yield this.AdminAuthRepo.findAdmin(email_id); //AdminAuthModel.findOne({ email_address: email_id })
                    if (findAdmin && findAdmin.password) {
                        console.log(token);
                        console.log(findAdmin.token);
                        if (findAdmin.token == token) {
                            const newPassword = yield bcrypt_1.default.hash(password, Number(process.env.BCRYPT_SALTROUND));
                            const comparePassword = yield bcrypt_1.default.compare(password, findAdmin.password);
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
                                // await findAdmin.save();
                                this.AdminAuthRepo.updateAdmin(findAdmin);
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
        });
    }
}
exports.default = AdminAuthService;
