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
const notification_service_1 = __importDefault(require("../communication/Provider/notification/notification_service"));
const profile_service_1 = __importDefault(require("../communication/Provider/profile/profile_service"));
const userAuth_1 = __importDefault(require("../db/models/userAuth"));
const tokenHelper_1 = __importDefault(require("./tokenHelper"));
const userHelper_1 = __importDefault(require("./userHelper"));
const utilHelper_1 = __importDefault(require("./utilHelper"));
let authHelper = {
    AuthOTPValidate: (otp, email_id, token) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const getUser = yield userAuth_1.default.findOne({ email: email_id }).sort({ id: -1 }).exec();
            if (getUser) {
                if (getUser.jwtToken != token) {
                    return {
                        status: false,
                        msg: "Invalid Token",
                        statusCode: 401
                    };
                }
                else {
                    const first_name = getUser.first_name;
                    const last_name = getUser.last_name;
                    const _id = getUser._id;
                    const phone_number = getUser.phone_number;
                    if (getUser.otp == otp) {
                        const otpExpireTimer = getUser.otp_timer;
                        const currentTime = new Date().getUTCMilliseconds();
                        if (currentTime > otpExpireTimer) {
                            return {
                                status: false,
                                msg: "OTP TIME Expired",
                                statusCode: 400
                            };
                        }
                        else {
                            const jwtToken = yield tokenHelper_1.default.createJWTToken({
                                email: email_id,
                                first_name: first_name,
                                last_name: last_name,
                                phone: phone_number
                            }, const_1.default.USERAUTH_EXPIRE_TIME.toString());
                            if (jwtToken) {
                                getUser.jwtToken = jwtToken;
                                if (!getUser.account_started) {
                                    getUser.account_started = true;
                                    profile_service_1.default.authDataTransfer(getUser.first_name, getUser.last_name, getUser.email, getUser.location, getUser.phone_number, getUser.id, getUser.user_id);
                                }
                                yield getUser.save();
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
                            else {
                                return {
                                    status: false,
                                    msg: "Internal server error",
                                    statusCode: 500
                                };
                            }
                        }
                    }
                    else {
                        return {
                            status: false,
                            msg: "Incorrect OTP",
                            statusCode: 401
                        };
                    }
                }
            }
            else {
                return {
                    status: false,
                    msg: "Email ID not found",
                    statusCode: 401
                };
            }
        }
        catch (e) {
            return {
                status: false,
                msg: "Something went wront",
                statusCode: 500
            };
        }
    }),
    userSignInHelper: function (email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userAuth = yield userHelper_1.default.isUserExist(email);
                if (!userAuth) {
                    return {
                        statusCode: 401,
                        status: false,
                        msg: "User not found"
                    };
                }
                const otpNumber = utilHelper_1.default.generateAnOTP(6);
                const otpExpireTime = const_1.default.MINIMUM_OTP_TIMER();
                const token = yield tokenHelper_1.default.createJWTToken({ email_id: userAuth.email, type: const_1.default.OTP_TYPE.SIGN_IN_OTP }, const_1.default.OTP_EXPIRE_TIME.toString());
                if (token) {
                    userAuth.otp = otpNumber;
                    userAuth.otp_timer = otpExpireTime;
                    userAuth.jwtToken = token;
                    yield userAuth.save();
                    notification_service_1.default.signInOTPSender({
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
            catch (e) {
                return {
                    statusCode: 500,
                    status: false,
                    msg: "Something went wrong"
                };
            }
        });
    },
    resendOtpNumer: function (email_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const getUser = yield userAuth_1.default.findOne({ email: email_id });
                if (getUser) {
                    const otpNumber = utilHelper_1.default.generateAnOTP(6);
                    const otpExpireTime = const_1.default.MINIMUM_OTP_TIMER();
                    const updateToken = yield this.resetToken(getUser.id);
                    if (updateToken) {
                        getUser.otp = otpNumber;
                        getUser.otp_timer = otpExpireTime;
                        yield getUser.save();
                        notification_service_1.default.signInOTPSender({
                            otp: otpNumber,
                            email: email_id,
                            full_name: getUser.first_name + " " + getUser.last_name
                        });
                        return {
                            statusCode: 200,
                            status: true,
                            data: {
                                token: updateToken,
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
                console.log(e);
                return {
                    statusCode: 500,
                    status: false,
                    msg: "Something went wrong"
                };
            }
        });
    },
    editAuthPhoneNumber: function (oldEmailId, newEmailID) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("The old email id is : " + oldEmailId);
            const otpNumber = utilHelper_1.default.generateAnOTP(6);
            const otpExpireTime = const_1.default.MINIMUM_OTP_TIMER();
            try {
                const getUser = yield userAuth_1.default.findOne({ email: oldEmailId });
                if (getUser && !getUser.account_started) {
                    const newToken = yield tokenHelper_1.default.createJWTToken({ email_id: newEmailID, type: const_1.default.OTP_TYPE.SIGN_UP_OTP }, const_1.default.OTP_EXPIRE_TIME.toString());
                    if (newToken) {
                        getUser.email = newEmailID;
                        getUser.otp = otpNumber;
                        getUser.otp_timer = otpExpireTime;
                        getUser.jwtToken = newToken;
                        getUser.save();
                        notification_service_1.default.signInOTPSender({
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
    },
    resetToken: (userId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const findUser = yield userAuth_1.default.findById(userId);
            if (findUser) {
                const newToken = yield tokenHelper_1.default.createJWTToken({ email_id: findUser.email, type: const_1.default.OTP_TYPE.SIGN_UP_OTP }, const_1.default.OTP_EXPIRE_TIME.toString());
                if (newToken) {
                    findUser.jwtToken = newToken;
                    yield findUser.save();
                    return newToken;
                }
                else {
                    return null;
                }
            }
            else {
                return null;
            }
        }
        catch (e) {
            console.log(e);
            return null;
        }
    }),
    updateUserProfile: (data, user_id) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const findUser = yield userAuth_1.default.findById(user_id);
            if (findUser) {
                const mergedData = Object.assign(Object.assign({}, findUser.toObject()), data);
                Object.assign(findUser, mergedData);
                findUser.save();
                return {
                    statusCode: 200,
                    status: true,
                    msg: "User updated success"
                };
            }
            else {
                return {
                    statusCode: 401,
                    status: false,
                    msg: "Authentication failed"
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
    })
};
exports.default = authHelper;
