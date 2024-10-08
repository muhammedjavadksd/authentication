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
const utilHelper_1 = __importDefault(require("../helper/utilHelper"));
const UserAuthentication_1 = __importDefault(require("../repositories/UserAuthentication"));
const profile_service_1 = __importDefault(require("../communication/Provider/profile/profile_service"));
const tokenHelper_1 = __importDefault(require("../helper/tokenHelper"));
const axios_1 = __importDefault(require("axios"));
const Enums_1 = require("../config/Datas/Enums");
class UserAuthServices {
    constructor() {
        this.signInHelper = this.signInHelper.bind(this);
        this.authOTPValidate = this.authOTPValidate.bind(this);
        this.editAuthEmailID = this.editAuthEmailID.bind(this);
        this.resendOtpNumer = this.resendOtpNumer.bind(this);
        this._checkUserIDValidity = this._checkUserIDValidity.bind(this);
        this.generateUserID = this.generateUserID.bind(this);
        this.refreshToken = this.refreshToken.bind(this);
        this.UserAuthRepo = new UserAuthentication_1.default();
        this.TokenHelpers = new tokenHelper_1.default();
    }
    refreshToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenVerify = yield this.TokenHelpers.checkTokenValidity(token);
            if (tokenVerify && typeof tokenVerify == "object") {
                const checkRefreshToken = tokenVerify.exp;
                const newAccessToken = yield this.TokenHelpers.generateJWtToken(tokenVerify, Enums_1.JwtTimer.AccessTokenExpiresInMinutes);
                if (newAccessToken) {
                    const responseData = {
                        access_token: newAccessToken,
                        refresh_token: undefined
                    };
                    if (checkRefreshToken) {
                        const currentTime = Date.now();
                        const maxAge = 1000 * 60 * 60;
                        const diff = checkRefreshToken - currentTime;
                        if (diff < maxAge) {
                            const newRefreshToken = yield this.TokenHelpers.generateJWtToken(tokenVerify, Enums_1.JwtTimer.RefreshTokenExpiresInDays);
                            if (newRefreshToken) {
                                responseData.refresh_token = newRefreshToken;
                            }
                        }
                    }
                    return {
                        msg: "New access token created",
                        status: true,
                        statusCode: Enums_1.StatusCode.OK,
                        data: responseData
                    };
                }
                else {
                    return {
                        msg: "Something went wrong",
                        status: false,
                        statusCode: Enums_1.StatusCode.SERVER_ERROR,
                    };
                }
            }
            else {
                return {
                    msg: "Un authraized access",
                    status: false,
                    statusCode: Enums_1.StatusCode.UNAUTHORIZED,
                };
            }
        });
    }
    accountCompleteHelper(token, phone) {
        return __awaiter(this, void 0, void 0, function* () {
            const endPoint = `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`;
            const { data } = yield axios_1.default.get(endPoint);
            if (!data.error && data.email) {
                const email = data.email;
                const findUser = yield this.UserAuthRepo.findUser(null, email, null);
                if (findUser && !findUser.account_started) {
                    const updateData = {
                        phone_number: phone,
                        account_started: true
                    };
                    const updateUser = yield this.UserAuthRepo.updateUserById(findUser.id, updateData);
                    if (updateUser) {
                        return {
                            status: true,
                            msg: "Account completion done",
                            statusCode: Enums_1.StatusCode.OK
                        };
                    }
                    else {
                        return {
                            status: false,
                            msg: "Account completion failed",
                            statusCode: Enums_1.StatusCode.BAD_REQUEST
                        };
                    }
                }
                else {
                    return {
                        status: false,
                        msg: "Account already verified",
                        statusCode: Enums_1.StatusCode.BAD_REQUEST
                    };
                }
            }
            else {
                return {
                    status: false,
                    msg: "Account not found",
                    statusCode: Enums_1.StatusCode.UNAUTHORIZED
                };
            }
        });
    }
    signUpProvideHelper(token, auth_id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const endPoint = `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`;
            const { data } = yield axios_1.default.get(endPoint);
            if (!data.error && data.email) {
                const emailId = data.email;
                const fullName = data.name.split(" ");
                const firstName = fullName[0];
                const lastName = (_a = fullName[1]) !== null && _a !== void 0 ? _a : "";
                const findUser = yield this.UserAuthRepo.findUser(null, emailId, null);
                if (findUser && findUser.account_started) {
                    const jwtToken = yield this.TokenHelpers.generateJWtToken({ email: emailId, first_name: findUser.first_name, last_name: findUser.last_name, phone: findUser.phone_number, profile_id: findUser.user_id, user_id: findUser.id, }, Enums_1.JwtTimer.AccessTokenExpiresInMinutes);
                    if (findUser.phone_number && jwtToken) {
                        const userJwtData = {
                            jwt: jwtToken,
                            first_name: findUser.first_name,
                            last_name: findUser.last_name,
                            email: findUser.email,
                            phone: findUser.phone_number,
                            user_id: findUser.id,
                            profile_id: findUser.user_id,
                            blood_token: findUser === null || findUser === void 0 ? void 0 : findUser.blood_token
                        };
                        return {
                            status: true,
                            msg: "OTP Verified Success",
                            data: userJwtData,
                            statusCode: 200
                        };
                    }
                    else {
                        return {
                            status: false,
                            msg: "Account need to be verified",
                            statusCode: Enums_1.StatusCode.FORBIDDEN
                        };
                    }
                }
                else {
                    const userDetails = {
                        auth_id: auth_id,
                        auth_provider: "google",
                        email: emailId,
                        first_name: firstName,
                        last_name: lastName,
                    };
                    const insertNewUser = yield this.UserAuthRepo.insertUserWithAuth(userDetails, token);
                    if (insertNewUser) {
                        return {
                            msg: "User created success",
                            status: true,
                            statusCode: Enums_1.StatusCode.CREATED
                        };
                    }
                    else {
                        return {
                            msg: "Internal server error",
                            status: false,
                            statusCode: Enums_1.StatusCode.SERVER_ERROR
                        };
                    }
                }
            }
            else {
                return {
                    msg: "Invalid sign up attempt",
                    status: false,
                    statusCode: Enums_1.StatusCode.BAD_REQUEST
                };
            }
        });
    }
    signInHelper(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userAuth = yield this.UserAuthRepo.findUser(null, email, null);
                if (userAuth) {
                    if (!userAuth.account_started) {
                        return {
                            statusCode: Enums_1.StatusCode.NOT_FOUND,
                            status: false,
                            msg: "Email id not found",
                        };
                    }
                    const otpNumber = utilHelper_1.default.generateAnOTP(6);
                    const otpExpireTime = const_1.default.MINIMUM_OTP_TIMER();
                    const token = yield this.TokenHelpers.generateJWtToken({ email: userAuth['email'], type: const_1.default.OTP_TYPE.SIGN_IN_OTP }, Enums_1.JwtTimer.AccessTokenExpiresInMinutes);
                    if (token) {
                        userAuth.otp = otpNumber;
                        userAuth.otp_timer = otpExpireTime;
                        userAuth.jwtToken = token;
                        yield this.UserAuthRepo.updateUser(userAuth);
                        const userAuthProvider = new notification_service_1.default(process.env.USER_SIGN_IN_NOTIFICATION);
                        yield userAuthProvider._init_();
                        userAuthProvider.signInOTPSender({
                            otp: otpNumber,
                            email: userAuth.email,
                            full_name: userAuth.first_name + userAuth.last_name
                        });
                        return {
                            statusCode: Enums_1.StatusCode.OK,
                            status: true,
                            msg: "OTP Has been sent ",
                            data: {
                                token
                            }
                        };
                    }
                    else {
                        return {
                            statusCode: Enums_1.StatusCode.UNAUTHORIZED,
                            status: false,
                            msg: "Provide valid token"
                        };
                    }
                }
                else {
                    return {
                        statusCode: Enums_1.StatusCode.NOT_FOUND,
                        status: false,
                        msg: "User not found"
                    };
                }
            }
            catch (e) {
                console.log(e);
                return {
                    statusCode: Enums_1.StatusCode.SERVER_ERROR,
                    status: false,
                    msg: "Something went wrong"
                };
            }
        });
    }
    authOTPValidate(otp, email_id, token) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const getUser = yield this.UserAuthRepo.findUser(null, email_id, null);
                if (!getUser) {
                    return {
                        status: false,
                        msg: "Email ID not found",
                        statusCode: Enums_1.StatusCode.NOT_FOUND
                    };
                }
                const userJwtToken = getUser.jwtToken;
                if (userJwtToken != token) {
                    return {
                        status: false,
                        msg: "Invalid Token",
                        statusCode: Enums_1.StatusCode.UNAUTHORIZED
                    };
                }
                const otpExpireTimer = getUser.otp_timer;
                const validateOtp = utilHelper_1.default.OTPValidator(otp, getUser.otp, otpExpireTimer);
                if (!validateOtp.status) {
                    return {
                        status: false,
                        msg: (_a = validateOtp.msg) !== null && _a !== void 0 ? _a : "Incorrect OTP or OTP has been expired",
                        statusCode: Enums_1.StatusCode.BAD_REQUEST
                    };
                }
                const first_name = getUser.first_name;
                const last_name = getUser.last_name;
                const phone_number = getUser.phone_number;
                const userAuth = {
                    email: email_id,
                    first_name: first_name,
                    last_name: last_name,
                    phone: phone_number,
                    profile_id: getUser.user_id,
                    user_id: getUser.id,
                };
                const refreshToken = yield this.TokenHelpers.generateJWtToken(userAuth, Enums_1.JwtTimer.AccessTokenExpiresInMinutes);
                const jwtToken = yield this.TokenHelpers.generateJWtToken(userAuth, Enums_1.JwtTimer.RefreshTokenExpiresInDays);
                if (!jwtToken || !refreshToken) {
                    return {
                        status: false,
                        msg: "Internal server error",
                        statusCode: Enums_1.StatusCode.SERVER_ERROR
                    };
                }
                getUser.jwtToken = jwtToken;
                if (getUser.phone_number) {
                    if (!getUser.account_started) {
                        getUser.account_started = true;
                        const profileCommunicationProvider = new profile_service_1.default();
                        yield profileCommunicationProvider._init_();
                        console.log("Profile data transfer");
                        profileCommunicationProvider.authDataTransfer({
                            email: getUser.email,
                            first_name: getUser.first_name,
                            last_name: getUser.last_name,
                            phone_number: getUser.phone_number,
                            user_id: getUser.id,
                            profile_id: getUser.user_id
                        });
                    }
                    // await getUser.save();
                    yield this.UserAuthRepo.updateUser(getUser);
                    const userJwtData = {
                        jwt: jwtToken,
                        first_name: getUser.first_name,
                        last_name: getUser.last_name,
                        email: getUser.email,
                        phone: getUser.phone_number,
                        user_id: getUser.id,
                        profile_id: getUser.user_id,
                        blood_token: getUser === null || getUser === void 0 ? void 0 : getUser.blood_token,
                        refresh_token: refreshToken
                    };
                    return {
                        status: true,
                        msg: "OTP Verified Success",
                        data: userJwtData,
                        statusCode: Enums_1.StatusCode.OK
                    };
                }
                else {
                    return {
                        status: false,
                        msg: "Account need verification",
                        statusCode: Enums_1.StatusCode.FORBIDDEN
                    };
                }
            }
            catch (e) {
                return {
                    status: false,
                    msg: "Something went wront",
                    statusCode: Enums_1.StatusCode.UNAUTHORIZED
                };
            }
        });
    }
    editAuthEmailID(oldEmailId, newEmailID) {
        return __awaiter(this, void 0, void 0, function* () {
            const otpNumber = utilHelper_1.default.generateAnOTP(6);
            const otpExpireTime = const_1.default.MINIMUM_OTP_TIMER();
            try {
                const checkExist = yield this.UserAuthRepo.findUser(null, newEmailID, null);
                if (!checkExist) {
                    const getUser = yield this.UserAuthRepo.findUser(null, oldEmailId, null);
                    if (getUser) {
                        const newToken = yield this.TokenHelpers.generateJWtToken({ email: newEmailID, type: const_1.default.OTP_TYPE.SIGN_UP_OTP }, Enums_1.JwtTimer.OtpTimer);
                        if (newToken) {
                            getUser.email = newEmailID;
                            getUser.otp = otpNumber;
                            getUser.otp_timer = otpExpireTime;
                            getUser.jwtToken = newToken;
                            // getUser.save()
                            yield this.UserAuthRepo.updateUser(getUser);
                            const authNotificationProvider = new notification_service_1.default(process.env.USER_SIGN_IN_NOTIFICATION);
                            yield authNotificationProvider._init_();
                            authNotificationProvider.signInOTPSender({
                                otp: otpNumber,
                                email: newEmailID,
                                full_name: getUser.first_name + getUser.last_name
                            });
                            return {
                                status: true,
                                msg: "Email id has been updated",
                                statusCode: Enums_1.StatusCode.OK,
                                data: {
                                    token: newToken
                                }
                            };
                        }
                        else {
                            return {
                                status: false,
                                msg: "Something went wrong",
                                statusCode: Enums_1.StatusCode.BAD_REQUEST,
                            };
                        }
                    }
                    else {
                        return {
                            statusCode: Enums_1.StatusCode.NOT_FOUND,
                            status: false,
                            msg: "The email address you entered does not exist",
                        };
                    }
                }
                else {
                    return {
                        status: false,
                        msg: "The email address already exist",
                        statusCode: Enums_1.StatusCode.CONFLICT
                    };
                }
            }
            catch (e) {
                console.log(e);
                return {
                    statusCode: Enums_1.StatusCode.SERVER_ERROR,
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
                    const newToken = yield this.TokenHelpers.generateJWtToken({ email: getUser.email, type: const_1.default.OTP_TYPE.SIGN_UP_OTP }, Enums_1.JwtTimer.OtpTimer);
                    if (newToken) {
                        getUser.otp = otpNumber;
                        getUser.otp_timer = otpExpireTime;
                        getUser.jwtToken = newToken;
                        yield this.UserAuthRepo.updateUser(getUser);
                        const authCommunicationProvider = new notification_service_1.default(process.env.USER_SIGN_IN_NOTIFICATION);
                        yield authCommunicationProvider._init_();
                        authCommunicationProvider.signInOTPSender({
                            otp: otpNumber,
                            email: email_id,
                            full_name: getUser.first_name + " " + getUser.last_name
                        });
                        return {
                            statusCode: Enums_1.StatusCode.OK,
                            status: true,
                            data: {
                                token: newToken,
                            },
                            msg: "OTP Has been sent "
                        };
                    }
                    else {
                        return {
                            statusCode: Enums_1.StatusCode.SERVER_ERROR,
                            status: false,
                            msg: "Something went wrong"
                        };
                    }
                }
                else {
                    return {
                        statusCode: Enums_1.StatusCode.UNAUTHORIZED,
                        status: false,
                        msg: "Unauthorized request"
                    };
                }
            }
            catch (e) {
                return {
                    statusCode: Enums_1.StatusCode.SERVER_ERROR,
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
                    userId = first_name + "_" + randomText + count;
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
