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
const utilHelper_1 = __importDefault(require("../helper/util/utilHelper"));
const tokenHelper_1 = __importDefault(require("../helper/token/tokenHelper"));
let { OTP_TYPE } = const_1.default;
class AuthMiddleware {
    constructor() {
        this.tokenHelpers = new tokenHelper_1.default();
    }
    isValidSignUpAttempt(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const headers = req.headers;
            const token = utilHelper_1.default.getTokenFromHeader(headers['authorization']);
            if (token) {
                if (!req.context) {
                    req.context = {};
                }
                req.context.auth_token = token;
                const checkValidity = yield this.tokenHelpers.checkTokenValidity(token);
                if (checkValidity) {
                    if (typeof checkValidity == "object") {
                        if (checkValidity.email_id) {
                            if (checkValidity.type == OTP_TYPE.SIGN_UP_OTP || checkValidity.type == OTP_TYPE.SIGN_IN_OTP) {
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
    isUserLogged(req, res, next) {
        next();
    }
    isAdminLogged(req, res, next) {
        next();
    }
    isOrganizationLogged(req, res, next) {
        next();
    }
}
exports.default = AuthMiddleware;
