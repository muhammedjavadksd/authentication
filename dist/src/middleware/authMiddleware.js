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
const const_1 = __importDefault(require("../config/const"));
const utilHelper_1 = __importDefault(require("../helper/utilHelper"));
const tokenHelper_1 = __importDefault(require("../helper/tokenHelper"));
const { OTP_TYPE } = const_1.default;
class AuthMiddleware {
    constructor() {
        this.isAdminLogged = this.isAdminLogged.bind(this);
        this.isOrganizationLogged = this.isOrganizationLogged.bind(this);
        this.isUserLogged = this.isUserLogged.bind(this);
        this.isValidSignUpAttempt = this.isValidSignUpAttempt.bind(this);
        this.isValidResetPasswordForOrganization = this.isValidResetPasswordForOrganization.bind(this);
        this.tokenHelpers = new tokenHelper_1.default();
    }
    isValidResetPasswordForOrganization(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // const headers: CustomRequest['headers'] = req.headers;
            const token = req.params.token; //utilHelper.getTokenFromHeader(headers['authorization'])
            console.log(token);
            if (token) {
                if (!req.context) {
                    req.context = {};
                }
                req.context.auth_token = token;
                const checkValidity = yield this.tokenHelpers.checkTokenValidity(token);
                if (checkValidity) {
                    if (typeof checkValidity == "object") {
                        if (checkValidity.email_id) {
                            if (checkValidity.type == OTP_TYPE.ORGANIZATION_FORGET_PASSWORD) {
                                req.context.email_id = checkValidity === null || checkValidity === void 0 ? void 0 : checkValidity.email_id;
                                req.context.token = token;
                                next();
                            }
                            else {
                                res.status(401).json({
                                    status: false,
                                    msg: "Authorization is failed"
                                });
                            }
                        }
                        else {
                            res.status(401).json({
                                status: false,
                                msg: "Authorization is failed"
                            });
                        }
                    }
                    else {
                        res.status(401).json({
                            status: false,
                            msg: "Authorization is failed"
                        });
                    }
                }
                else {
                    res.status(401).json({
                        status: false,
                        msg: "Authorization is failed"
                    });
                }
            }
            else {
                res.status(401).json({
                    status: false,
                    msg: "Invalid auth attempt"
                });
            }
        });
    }
    isValidSignUpAttempt(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const headers = req.headers;
            const token = utilHelper_1.default.getTokenFromHeader(headers['authorization']);
            console.log(token);
            console.log("TOken is");
            console.log(headers['authorization']);
            if (token) {
                if (!req.context) {
                    req.context = {};
                }
                req.context.auth_token = token;
                const checkValidity = yield this.tokenHelpers.checkTokenValidity(token);
                console.log("Validity");
                console.log(checkValidity);
                if (checkValidity) {
                    if (typeof checkValidity == "object") {
                        if (checkValidity.email) {
                            if (checkValidity.type == OTP_TYPE.SIGN_UP_OTP || checkValidity.type == OTP_TYPE.SIGN_IN_OTP) {
                                req.context.email_id = checkValidity === null || checkValidity === void 0 ? void 0 : checkValidity.email;
                                req.context.token = token;
                                console.log("Passed");
                                next();
                            }
                            else {
                                res.status(401).json({
                                    status: false,
                                    msg: "Authorization is failed"
                                });
                            }
                        }
                        else {
                            res.status(401).json({
                                status: false,
                                msg: "Authorization is failed"
                            });
                        }
                    }
                    else {
                        res.status(401).json({
                            status: false,
                            msg: "Authorization is failed"
                        });
                    }
                }
                else {
                    res.status(401).json({
                        status: false,
                        msg: "Authorization is failed"
                    });
                }
            }
            else {
                res.status(401).json({
                    status: false,
                    msg: "Invalid auth attempt"
                });
            }
        });
    }
    isUserLogged(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const headers = req.headers;
            const token = utilHelper_1.default.getTokenFromHeader(headers['authorization']);
            console.log("The token is :" + token);
            if (token) {
                if (!req.context) {
                    req.context = {};
                }
                req.context.auth_token = token;
                const checkValidity = yield this.tokenHelpers.checkTokenValidity(token);
                console.log(checkValidity);
                if (checkValidity) {
                    if (typeof checkValidity == "object") {
                        const emailAddress = checkValidity.email || checkValidity.email_address;
                        if (emailAddress) {
                            if (checkValidity) {
                                req.context.email_id = emailAddress;
                                req.context.token = token;
                                req.context.user_id = checkValidity.user_id;
                                console.log("Passed");
                                console.log(req.context);
                                next();
                            }
                            else {
                                res.status(401).json({
                                    status: false,
                                    msg: "Authorization is failed"
                                });
                            }
                        }
                        else {
                            res.status(401).json({
                                status: false,
                                msg: "Authorization is failed"
                            });
                        }
                    }
                    else {
                        res.status(401).json({
                            status: false,
                            msg: "Authorization is failed"
                        });
                    }
                }
                else {
                    res.status(401).json({
                        status: false,
                        msg: "Authorization is failed"
                    });
                }
            }
            else {
                res.status(401).json({
                    status: false,
                    msg: "Invalid auth attempt"
                });
            }
        });
    }
    isAdminLogged(req, res, next) {
        next();
    }
    isOrganizationLogged(req, res, next) {
        next();
    }
}
exports.default = AuthMiddleware;
