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
const const_1 = __importDefault(require("../../config/const"));
const validation_1 = __importDefault(require("../../config/validation/validation"));
const UserAuthentication_1 = __importDefault(require("../../repositories/UserRepo/UserAuthentication"));
const UserAuthServices_1 = __importDefault(require("../../services/UserAuthService/UserAuthServices"));
let { AUTH_PROVIDERS_DATA } = const_1.default;
class UserAuthController {
    constructor() {
        this.signUpController = this.signUpController.bind(this);
        this.signInController = this.signInController.bind(this);
        this.AuthOTPSubmission = this.AuthOTPSubmission.bind(this);
        this.editAuthPhoneNumber = this.editAuthPhoneNumber.bind(this);
        this.resetOtpNumber = this.resetOtpNumber.bind(this);
        this.UserAuthRepo = new UserAuthentication_1.default();
        this.UserAuthService = new UserAuthServices_1.default();
    }
    signUpController(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const phone_number = req.body.phone_number;
                const email_address = req.body.email_address;
                const first_name = req.body.first_name;
                const last_name = req.body.last_name;
                const location = req.body.location;
                const blood_group = req.body.blood_group;
                const auth_id = '';
                const auth_provider = AUTH_PROVIDERS_DATA.CREDENTIAL;
                const { error, value } = validation_1.default.validate({
                    phone_number,
                    email_address,
                    blood_group,
                    auth_provider,
                    first_name,
                    last_name,
                    location,
                });
                if (error) {
                    let response = {
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
                        let response = {
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
                            let response = {
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
                let response = {
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
            // console.log(email_id, token);
            if (email_id && token) {
                try {
                    const otpVerification = yield this.UserAuthService.authOTPValidate(otp, email_id, token);
                    console.log(otpVerification);
                    if (otpVerification.status) {
                        let responseData = otpVerification.data;
                        console.log(otpVerification.data);
                        const otpResponse = {
                            jwt: responseData['jwt'],
                            first_name: responseData['first_name'],
                            last_name: responseData['last_name'],
                            email: responseData['email'],
                            phone: responseData['phone'],
                            user_id: responseData['user_id'],
                            profile_id: responseData['profile_id']
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
                            let { token } = editRequest.data;
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
                            let token = (_a = result.data) === null || _a === void 0 ? void 0 : _a.token;
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
