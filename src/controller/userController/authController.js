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
// import PROFILE_COMMUNICATION_PROVIDER from '../../communication/Provider/profile/profile_service'
// import PROFILE_COMMUNICATION_PROVIDER from '../../communication/Provider/profile/profile_service';
const const_1 = __importDefault(require("../../config/const"));
// import { signUpUserValidation } from '../../config/validation/validation';
// import { SignCallback } from 'jsonwebtoken';
// import { signUpUserValidation } from '../../config/validation/validation'
const validation_1 = __importDefault(require("../../config/validation/validation"));
const authUserHelper_1 = __importDefault(require("../../helper/authUserHelper"));
const userHelper_1 = __importDefault(require("../../helper/userHelper"));
let { AUTH_PROVIDERS, AUTH_PROVIDERS_DATA } = const_1.default;
const authController = {
    signUpController: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const phone_number = req.body.phone_number;
            const email_address = req.body.email_address;
            const first_name = req.body.first_name;
            const last_name = req.body.last_name;
            const location = req.body.location;
            const blood_group = req.body.blood_group;
            const auth_id = null;
            const auth_provider = AUTH_PROVIDERS_DATA.CREDENTIAL;
            const { error, value } = validation_1.default.validate({
                phone_number,
                email_address,
                auth_id,
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
                res.status(500).json({ response });
            }
            else {
                const isUserExist = yield userHelper_1.default.isUserExist(email_address, phone_number.toString());
                if (isUserExist) {
                    let response = {
                        status: false,
                        msg: 'Email/Phone already exist',
                    };
                    res.status(401).json(response);
                }
                else {
                    userHelper_1.default.insertNewUser(first_name, last_name, phone_number.toString(), email_address, auth_id, auth_provider, location).then((jwtData) => {
                        console.log('The token is :');
                        console.log(jwtData.token);
                        const successResponse = {
                            status: true,
                            msg: 'Account created success',
                            data: {
                                token: jwtData.token
                            },
                        };
                        console.log('The response is : ');
                        console.log(successResponse);
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
            let response = {
                status: false,
                msg: "Something went wrong"
            };
            res.status(500).json(response);
        }
    }),
    signInController: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const email = req.body.email;
        console.log('Checking email id is  a : ' + email);
        try {
            const userSign = yield authUserHelper_1.default.userSignInHelper(email);
            if (userSign.status && userSign.data) {
                let response = {
                    status: true,
                    msg: 'OTP has been sent',
                    data: {
                        token: (_a = userSign.data) === null || _a === void 0 ? void 0 : _a.token,
                    }
                };
                res.status(userSign.statusCode).json(response);
            }
            else {
                let response = {
                    status: false,
                    msg: userSign.msg
                };
                res.status(userSign.statusCode).json(response);
            }
        }
        catch (e) {
            let response = {
                status: false,
                msg: 'Something went wrong',
            };
            res.status(500).json(response);
        }
    }),
    AuthOTPSubmission: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const otp = req.body.otp_number;
        const email_id = (_a = req.context) === null || _a === void 0 ? void 0 : _a.email_id;
        const token = (_b = req.context) === null || _b === void 0 ? void 0 : _b.token;
        if (email_id && token) {
            try {
                const otpVerification = yield authUserHelper_1.default.AuthOTPValidate(otp, email_id, token);
                if (otpVerification.status) {
                    let responseData = otpVerification.data;
                    res.status(200).json({
                        status: true,
                        msg: 'OTP Verification sucess',
                        data: {
                            jwt: responseData.jwt,
                            first_name: responseData.first_name,
                            last_name: responseData.last_name,
                            email: responseData.email,
                            phone: responseData.phone,
                        }
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
    }),
    editAuthPhoneNumber: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const newEmailID = req.body.email_id;
        const requestContext = req.context;
        if (requestContext && (requestContext === null || requestContext === void 0 ? void 0 : requestContext.email_id)) {
            const oldEmailId = requestContext.email_id;
            try {
                const editRequest = yield authUserHelper_1.default.editAuthPhoneNumber(oldEmailId, newEmailID);
                const token = (_a = editRequest === null || editRequest === void 0 ? void 0 : editRequest.data) === null || _a === void 0 ? void 0 : _a.token;
                if (token) {
                    res.status(editRequest.statusCode).json({
                        status: editRequest.status,
                        data: {
                            token: (_b = editRequest.data) === null || _b === void 0 ? void 0 : _b.token,
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
            catch (e) {
                console.log(e);
                res.status(500).json({
                    status: false,
                    msg: 'Something went wrong',
                });
            }
        }
        else {
            res.status(201).json({
                status: false,
                msg: "Invalid Token"
            });
        }
    }),
    resetOtpNumber: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        let requestContext = req.context;
        if (requestContext && requestContext.email_id) {
            const tokenEmail = requestContext.email_id;
            if (tokenEmail) {
                try {
                    const result = yield authUserHelper_1.default.resendOtpNumer(tokenEmail);
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
    }),
};
exports.default = authController;
