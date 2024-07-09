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
const notification_service_1 = __importDefault(require("../../communication/Provider/notification/notification_service"));
const const_1 = __importDefault(require("../../config/const"));
const utilHelper_1 = __importDefault(require("../../helper/util/utilHelper"));
const UserAuthentication_1 = __importDefault(require("../../repositories/UserRepo/UserAuthentication"));
const profile_service_1 = __importDefault(require("../../communication/Provider/profile/profile_service"));
const tokenHelper_1 = __importDefault(require("../../helper/token/tokenHelper"));
class UserAuthServices {
    constructor() {
        this.UserAuthRepo = new UserAuthentication_1.default();
        this.TokenHelpers = new tokenHelper_1.default();
    }
    signInHelper(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userAuth = yield this.UserAuthRepo.findUser(null, email, null);
                if (userAuth) {
                    const otpNumber = utilHelper_1.default.generateAnOTP(6);
                    const otpExpireTime = const_1.default.MINIMUM_OTP_TIMER();
                    const token = yield this.TokenHelpers.generateJWtToken({ email_id: userAuth['email'], type: const_1.default.OTP_TYPE.SIGN_IN_OTP }, const_1.default.OTP_EXPIRE_TIME.toString());
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
    authOTPValidate(otp, email_id, token) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                const getUser = yield this.UserAuthRepo.findUser(null, email_id, null);
                if (!getUser) {
                    return {
                        status: false,
                        msg: "Email ID not found",
                        statusCode: 401
                    };
                }
                const userJwtToken = getUser.jwtToken;
                if (userJwtToken != token) {
                    return {
                        status: false,
                        msg: "Invalid Token",
                        statusCode: 401
                    };
                }
                const otpExpireTimer = getUser.otp_timer;
                const validateOtp = utilHelper_1.default.OTPValidator(otp, getUser.otp, otpExpireTimer);
                if (!validateOtp.status) {
                    return {
                        status: false,
                        msg: (_a = validateOtp.msg) !== null && _a !== void 0 ? _a : "Incorrect OTP or OTP has been expired",
                        statusCode: 400
                    };
                }
                const first_name = getUser.first_name;
                const last_name = getUser.last_name;
                const _id = getUser._id;
                const phone_number = getUser.phone_number;
                const jwtToken = yield this.TokenHelpers.generateJWtToken({ email: email_id, first_name: first_name, last_name: last_name, phone: phone_number }, const_1.default.USERAUTH_EXPIRE_TIME.toString());
                if (!jwtToken) {
                    return {
                        status: false,
                        msg: "Internal server error",
                        statusCode: 500
                    };
                }
                getUser.jwtToken = jwtToken;
                if (!getUser.account_started) {
                    getUser.account_started = true;
                    const profileCommunicationProvider = new profile_service_1.default();
                    yield profileCommunicationProvider._init_();
                    profileCommunicationProvider.authDataTransfer({ email: getUser.email, first_name: getUser.first_name, last_name: getUser.last_name, phone_number: getUser.phone_number, auth_id: (_b = getUser.auth_id) !== null && _b !== void 0 ? _b : "", auth_provider: (_c = getUser.auth_provider) !== null && _c !== void 0 ? _c : "" });
                }
                // await getUser.save();
                yield this.UserAuthRepo.updateUser(getUser);
                const userJwtData = {
                    jwt: jwtToken,
                    first_name: getUser.first_name,
                    last_name: getUser.last_name,
                    email: getUser.email,
                    phone: getUser.phone_number,
                };
                return {
                    status: true,
                    msg: "OTP Verified Success",
                    data: { UserJwtInterFace: userJwtData },
                    statusCode: 200
                };
            }
            catch (e) {
                return {
                    status: false,
                    msg: "Something went wront",
                    statusCode: 500
                };
            }
        });
    }
    editAuthEmailID(oldEmailId, newEmailID) {
        return __awaiter(this, void 0, void 0, function* () {
            const otpNumber = utilHelper_1.default.generateAnOTP(6);
            const otpExpireTime = const_1.default.MINIMUM_OTP_TIMER();
            try {
                const getUser = yield this.UserAuthRepo.findUser(null, newEmailID, null);
                if (getUser && !getUser.account_started) {
                    const newToken = yield this.TokenHelpers.generateJWtToken({ email_id: newEmailID, type: const_1.default.OTP_TYPE.SIGN_UP_OTP }, const_1.default.OTP_EXPIRE_TIME.toString());
                    if (newToken) {
                        getUser.email = newEmailID;
                        getUser.otp = otpNumber;
                        getUser.otp_timer = otpExpireTime;
                        getUser.jwtToken = newToken;
                        // getUser.save()
                        yield this.UserAuthRepo.updateUser(getUser);
                        const authNotificationProvider = new notification_service_1.default();
                        authNotificationProvider._init_();
                        authNotificationProvider.signInOTPSender({
                            otp: otpNumber,
                            email: newEmailID,
                            full_name: getUser.first_name + getUser.last_name
                        });
                        return {
                            status: true,
                            msg: "Email id has been updated",
                            statusCode: 200,
                            data: {
                                token: newToken
                            }
                        };
                    }
                    else {
                        return {
                            status: false,
                            msg: "Something went wrong",
                            statusCode: 400,
                        };
                    }
                }
                else {
                    return {
                        statusCode: 401,
                        status: false,
                        msg: "The email address you entered does not exist",
                    };
                }
            }
            catch (e) {
                return {
                    statusCode: 500,
                    status: false,
                    msg: "Something went wrong",
                };
            }
        });
    }
    resendOtpNumer(email_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const getUser = yield this.UserAuthRepo.findUser(null, email_id, null);
                if (getUser) {
                    const otpNumber = utilHelper_1.default.generateAnOTP(6);
                    const otpExpireTime = const_1.default.MINIMUM_OTP_TIMER();
                    const newToken = yield this.TokenHelpers.generateJWtToken({ email_id: getUser.email, type: const_1.default.OTP_TYPE.SIGN_UP_OTP }, const_1.default.OTP_EXPIRE_TIME.toString());
                    if (newToken) {
                        getUser.otp = otpNumber;
                        getUser.otp_timer = otpExpireTime;
                        getUser.jwtToken = newToken;
                        yield this.UserAuthRepo.updateUser(getUser);
                        const authCommunicationProvider = new notification_service_1.default();
                        authCommunicationProvider._init_();
                        authCommunicationProvider.signInOTPSender({
                            otp: otpNumber,
                            email: email_id,
                            full_name: getUser.first_name + " " + getUser.last_name
                        });
                        return {
                            statusCode: 200,
                            status: true,
                            data: {
                                token: newToken,
                            },
                            msg: "OTP Has been sent "
                        };
                    }
                    else {
                        return {
                            statusCode: 500,
                            status: false,
                            msg: "Something went wrong"
                        };
                    }
                }
                else {
                    return {
                        statusCode: 401,
                        status: false,
                        msg: "Unauthorized request"
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
    _checkUserIDValidity(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.UserAuthRepo.findByUserId(user_id);
                if (!user) {
                    return false;
                }
                else {
                    return true;
                }
            }
            catch (e) {
                return false;
            }
        });
    }
    generateUserID(first_name) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const randomText = utilHelper_1.default.createRandomText(4);
                let count = 0;
                let userId;
                let isUserIDValid;
                do {
                    userId = first_name + "@" + randomText + count;
                    isUserIDValid = yield this._checkUserIDValidity(userId);
                    count++;
                } while (isUserIDValid);
                return userId;
            }
            catch (e) {
                console.log(e);
                return false;
            }
        });
    }
}
exports.default = UserAuthServices;
