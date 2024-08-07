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
// import { OTP_TYPE } from "../config/const";
// import { OTP_TYPE } from '../config/const'
const const_1 = __importDefault(require("../config/const"));
// import tokenHelper from "../helper/tokenHelper";
const tokenHelper_1 = __importDefault(require("../helper/tokenHelper"));
let { OTP_TYPE } = const_1.default;
const authMiddleware = {
    isValidSignUpTrying: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const headers = req.headers;
        if (headers.authorization && headers.authorization.split(' ')[0] === 'Bearer') {
            if (!req.context) {
                req.context = {};
            }
            const token = headers.authorization.split(' ')[1];
            req.context.auth_token = token;
            const checkValidity = yield tokenHelper_1.default.checkTokenValidity(token);
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
    }),
    isUserLogged: (req, res, next) => {
        next();
    },
    isAdminLogged: (req, res, next) => {
        next();
    },
    isOrganizationLogged: (req, res, next) => {
        next();
    }
};
exports.default = authMiddleware;
