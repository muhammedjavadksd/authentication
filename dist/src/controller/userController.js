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
const validation_1 = __importDefault(require("../config/validation/validation"));
const UserAuthentication_1 = __importDefault(require("../repositories/UserAuthentication"));
const UserAuthServices_1 = __importDefault(require("../services/UserAuthServices"));
const Enums_1 = require("../config/Datas/Enums");
const utilHelper_1 = __importDefault(require("../helper/utilHelper"));
const { AUTH_PROVIDERS_DATA } = const_1.default;
class UserAuthController {
    constructor() {
        this.signUpController = this.signUpController.bind(this);
        this.signInController = this.signInController.bind(this);
        this.AuthOTPSubmission = this.AuthOTPSubmission.bind(this);
        this.editAuthPhoneNumber = this.editAuthPhoneNumber.bind(this);
        this.resetOtpNumber = this.resetOtpNumber.bind(this);
        this.updateAuth = this.updateAuth.bind(this);
        this.signWithToken = this.signWithToken.bind(this);
        this.refreshToken = this.refreshToken.bind(this);
        this.completeAccount = this.completeAccount.bind(this);
        this.signUpWithProvide = this.signUpWithProvide.bind(this);
        this.UserAuthRepo = new UserAuthentication_1.default();
        this.UserAuthService = new UserAuthServices_1.default();
    }
    refreshToken(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const refreshToken = req.cookies['refresh_token'];
            if (refreshToken) {
                const refresh = yield this.UserAuthService.refreshToken(refreshToken);
                res.status(refresh.statusCode).json({ status: refresh.status, msg: refresh.msg, data: refresh.data });
            }
            else {
                res.status(Enums_1.StatusCode.UNAUTHORIZED).json({ status: false, msg: "Un authraized access" });
            }
        });
    }
    completeAccount(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const phoneNumber = req.body.phone_number;
            const header = req.headers['authorization'];
            const token = utilHelper_1.default.getTokenFromHeader(header);
            if (token) {
                const complete_account = yield this.UserAuthService.accountCompleteHelper(token, phoneNumber);
                res.status(complete_account.statusCode).json({ status: complete_account.status, msg: complete_account.msg });
            }
            else {
                res.status(Enums_1.StatusCode.UNAUTHORIZED).json({ status: false, msg: "Invalid sing up attempt" });
            }
        });
    }
    signUpWithProvide(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const header = req.headers['authorization'];
            const auth_id = req.body.auth_id;
            const token = utilHelper_1.default.getTokenFromHeader(header);
            if (token) {
                const save = yield this.UserAuthService.signUpProvideHelper(token, auth_id);
                res.status(save.statusCode).json({ status: save.status, msg: save.msg, data: save.data });
            }
            else {
                res.status(Enums_1.StatusCode.UNAUTHORIZED).json({ status: false, msg: "Invalid sing up attempt" });
            }
        });
    }
    signWithToken(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const user_id = (_a = req.context) === null || _a === void 0 ? void 0 : _a.user_id;
            if (user_id) {
                console.log(user_id);
                const findUser = yield this.UserAuthRepo.findUser(user_id, null, null);
                console.log("The user");
                console.log(findUser);
                if (findUser) {
                    const loginData = {
                        jwt: findUser['jwtToken'],
                        first_name: findUser['first_name'],
                        last_name: findUser['last_name'],
                        email: findUser['email'],
                        phone: findUser['phone_number'],
                        user_id: findUser['id'],
                        profile_id: findUser['user_id'],
                        blood_token: findUser['blood_token']
                    };
                    console.log(loginData);
                    res.status(Enums_1.StatusCode.OK).json({
                        status: true, msg: "Login attempt success", data: {
                            profile: loginData
                        }
                    });
                }
                else {
                    res.status(Enums_1.StatusCode.UNAUTHORIZED).json({
                        status: true, msg: "No user found"
                    });
                }
            }
            else {
                res.status(Enums_1.StatusCode.UNAUTHORIZED).json({
                    status: true, msg: "No user found"
                });
            }
        });
    }
    updateAuth(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const user_id = (_a = req.context) === null || _a === void 0 ? void 0 : _a.user_id;
            if (user_id) {
                const editData = {
                    blood_token: req.body.blood_token
                };
                console.log(user_id);
                console.log(editData);
                console.log(req.body);
                const updateUser = yield this.UserAuthRepo.updateUserById(user_id, editData);
                if (updateUser) {
                    res.status(Enums_1.StatusCode.OK).json({ status: true, msg: "Updated success" });
                }
                else {
                    res.status(Enums_1.StatusCode.BAD_REQUEST).json({ status: false, msg: "Updated failed" });
                }
            }
            else {
                res.status(Enums_1.StatusCode.UNAUTHORIZED).json({ status: false, msg: "Invalid authentication" });
            }
        });
    }
    signUpController(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const phone_number = req.body.phone_number;
                const email_address = req.body.email_address;
                const first_name = req.body.first_name;
                const last_name = req.body.last_name;
                const auth_id = '';
                const auth_provider = AUTH_PROVIDERS_DATA.CREDENTIAL;
                const { error, value } = validation_1.default.validate({
                    phone_number,
                    email_address,
                    auth_provider,
                    first_name,
                    last_name,
                });
                if (error) {
                    const response = {
                        status: false,
                        msg: error.details[0].message,
                    };
                    console.log("End");
                    console.log(response);
                    res.status(500).json({ response });
                    // console.log(error.details[0].message);
                }
                else {
                    console.log("Eneted");
                    const isUserExist = yield this.UserAuthRepo.findUser(null, email_address, Number(phone_number));
                    console.log(isUserExist);
                    if (isUserExist && isUserExist.account_started) {
                        const response = {
                            status: false,
                            msg: 'Email/Phone already exist',
                        };
                        res.status(400).json(response);
                    }
                    else {
                        this.UserAuthRepo.insertNewUser({
                            auth_id: auth_id,
                            first_name,
                            last_name,
                            auth_provider,
                            email: email_address,
                            phone_number
                        }).then((jwtData) => {
                            const successResponse = {
                                status: true,
                                msg: 'Account created success',
                                data: {
                                    token: jwtData.token
                                },
                            };
                            res.status(200).json(successResponse);
                        }).catch((err) => {
                            console.log(err);
                            const response = {
                                status: false,
                                msg: "Something went wrong"
                            };
                            res.status(500).json(response);
                        });
                    }
                }
            }
            catch (e) {
                console.log(e);
                const response = {
                    status: false,
                    msg: "Something went wrong"
                };
                res.status(500).json(response);
            }
        });
    }
    signInController(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const email = req.body.email;
            try {
                const userSign = yield this.UserAuthService.signInHelper(email);
                if (userSign.status && userSign.data) {
                    const response = {
                        status: true,
                        msg: 'OTP has been sent',
                        data: {
                            token: (_a = userSign.data) === null || _a === void 0 ? void 0 : _a.token,
                        }
                    };
                    res.status(userSign.statusCode).json(response);
                }
                else {
                    const response = {
                        status: false,
                        msg: userSign.msg
                    };
                    res.status(userSign.statusCode).json(response);
                }
            }
            catch (e) {
                console.log(e);
                const response = {
                    status: false,
                    msg: 'Something went wrong',
                };
                res.status(500).json(response);
            }
        });
    }
    AuthOTPSubmission(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const otp = req.body.otp_number;
            const email_id = (_a = req.context) === null || _a === void 0 ? void 0 : _a.email_id;
            const token = (_b = req.context) === null || _b === void 0 ? void 0 : _b.token;
            console.log("Before");
            console.log(otp);
            console.log(email_id, token);
            if (email_id && token) {
                try {
                    const otpVerification = yield this.UserAuthService.authOTPValidate(otp, email_id, token);
                    console.log("otp");
                    console.log(otpVerification);
                    if (otpVerification.status) {
                        const responseData = otpVerification.data;
                        console.log("Response data");
                        console.log(responseData);
                        console.log(otpVerification.data);
                        const otpResponse = {
                            jwt: responseData['jwt'],
                            first_name: responseData['first_name'],
                            last_name: responseData['last_name'],
                            email: responseData['email'],
                            phone: responseData['phone'],
                            user_id: responseData['user_id'],
                            profile_id: responseData['profile_id'],
                            blood_token: responseData['blood_token']
                        };
                        console.log(otpResponse);
                        res.status(200).json({
                            status: true,
                            msg: 'OTP Verification success',
                            data: otpResponse
                        });
                    }
                    else {
                        res.status(401).json({
                            status: false,
                            msg: otpVerification.msg,
                        });
                    }
                }
                catch (e) {
                    res.status(500).json({
                        status: false,
                        msg: 'Something went wrong',
                    });
                }
            }
            else {
                res.status(401).json({
                    status: false,
                    msg: 'Unauthorized access',
                });
            }
        });
    }
    editAuthPhoneNumber(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const newEmailID = req.body.email_id;
            const requestContext = req.context;
            if (requestContext && (requestContext === null || requestContext === void 0 ? void 0 : requestContext.email_id)) {
                const oldEmailId = requestContext.email_id;
                if (oldEmailId == newEmailID) {
                    res.status(400).json({
                        status: false,
                        msg: "Please enter diffrent email ID",
                    });
                }
                else {
                    try {
                        const editRequest = yield this.UserAuthService.editAuthEmailID(oldEmailId, newEmailID);
                        console.log("Worked here");
                        console.log(editRequest);
                        if (editRequest.status) {
                            const { token } = editRequest.data;
                            if (token) {
                                res.status(editRequest.statusCode).json({
                                    status: editRequest.status,
                                    data: {
                                        token: (_a = editRequest.data) === null || _a === void 0 ? void 0 : _a.token,
                                    },
                                    msg: editRequest.msg,
                                });
                            }
                            else {
                                res.status(500).json({
                                    status: false,
                                    msg: "Something went wrong",
                                });
                            }
                        }
                        else {
                            res.status(500).json({
                                status: false,
                                msg: editRequest.msg,
                            });
                        }
                    }
                    catch (e) {
                        console.log(e);
                        res.status(500).json({
                            status: false,
                            msg: 'Something went wrong',
                        });
                    }
                }
            }
            else {
                res.status(201).json({
                    status: false,
                    msg: "Invalid Token"
                });
            }
        });
    }
    resetOtpNumber(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const requestContext = req.context;
            if (requestContext && requestContext.email_id) {
                const tokenEmail = requestContext.email_id;
                if (tokenEmail) {
                    try {
                        const result = yield this.UserAuthService.resendOtpNumer(tokenEmail);
                        console.log(result);
                        console.log("The result");
                        if (result.data) {
                            const token = (_a = result.data) === null || _a === void 0 ? void 0 : _a.token;
                            if (token) {
                                res.status(result.statusCode).json({ msg: result.msg, status: result.status, token });
                            }
                            else {
                                res.status(400).json({ msg: "Email id not found", status: false });
                            }
                        }
                        else {
                            res.status(400).json({ msg: "Email id not found", status: false });
                        }
                    }
                    catch (e) {
                        res.status(500).json({
                            status: false,
                            msg: "Internal server error",
                        });
                    }
                }
                else {
                    res.status(401).json({
                        status: false,
                        msg: "Authentication failed",
                    });
                }
            }
            else {
                res.status(500).json({
                    status: true,
                    msg: 'Unauthorized request',
                });
            }
        });
    }
}
exports.default = UserAuthController;
