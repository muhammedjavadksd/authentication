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
const tokenHelper_1 = __importDefault(require("../helper/tokenHelper"));
const utilHelper_1 = __importDefault(require("../helper/utilHelper"));
const UserAuthentication_1 = __importDefault(require("../repositories/UserAuthentication"));
class UserAuthServices {
    constructor() {
        this.UserAuthRepo = new UserAuthentication_1.default();
    }
    signInHelper(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userAuth = yield this.UserAuthRepo.findUser(null, email, null);
                if (userAuth) {
                    const otpNumber = utilHelper_1.default.generateAnOTP(6);
                    const otpExpireTime = const_1.default.MINIMUM_OTP_TIMER();
                    const token = yield tokenHelper_1.default.createJWTToken({ email_id: userAuth['email'], type: const_1.default.OTP_TYPE.SIGN_IN_OTP }, const_1.default.OTP_EXPIRE_TIME.toString());
                    if (token) {
                        userAuth.otp = otpNumber;
                        userAuth.otp_timer = otpExpireTime;
                        userAuth.jwtToken = token;
                        yield this.UserAuthRepo.updateUser(userAuth);
                        // await userAuth.save()
                        const userAuthProvider = new notification_service_1.default();
                        yield userAuthProvider._init_();
                        userAuthProvider.signInOTPSender({
                            otp: otpNumber,
                            email: userAuth.email,
                            full_name: userAuth.first_name + userAuth.last_name
                        });
                        return {
                            statusCode: 200,
                            status: true,
                            msg: "OTP Has been sent ",
                            data: {
                                token
                            }
                        };
                    }
                    else {
                        return {
                            statusCode: 401,
                            status: false,
                            msg: "Provide valid token"
                        };
                    }
                }
                else {
                    return {
                        statusCode: 401,
                        status: false,
                        msg: "User not found"
                    };
                }
            }
            catch (e) {
                return {
                    statusCode: 500,
                    status: false,
                    msg: "Something went wrong"
                };
            }
        });
    }
}
exports.default = UserAuthServices;
