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
const organizationAuth_1 = __importDefault(require("../db/models/organizationAuth"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const tokenHelper_1 = __importDefault(require("./tokenHelper"));
const const_1 = __importDefault(require("../config/const"));
const notification_service_1 = __importDefault(require("../communication/Provider/notification/notification_service"));
const authOrganizationHelper = {
    signUpHelper: (name, phone_number, email_address, password, blood_service, fund_service, organization_type, pan_card_photo, logo_photo, office_photo, registration_photo, website_url) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            password = yield bcrypt_1.default.hash(password, Number(process.env.BCRYPT_SALTROUND));
            const newOrganization = new organizationAuth_1.default({ name, phone_number, email_address, password, blood_service, fund_service, organization_type, pan_card_photo, logo_photo, office_photo, registration_photo, website_url });
            yield newOrganization.save();
            return true;
        }
        catch (e) {
            console.log(e);
            return false;
        }
    }),
    signInHelper: (email_address, password) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const getData = yield organizationAuth_1.default.findOne({ email_address });
            if (getData && getData.password) {
                const dbPassword = getData.password;
                const comparePassword = yield bcrypt_1.default.compare(password, dbPassword);
                const organizationJwtPayload = {
                    name: getData.name,
                    email: email_address,
                    id: getData.id
                };
                const jwtToken = yield tokenHelper_1.default.createJWTToken(organizationJwtPayload, const_1.default.USERAUTH_EXPIRE_TIME.toString());
                getData.token = jwtToken;
                yield getData.save();
                if (comparePassword) {
                    return { status: true, data: { token: jwtToken }, msg: "Sign in success", statusCode: 200 };
                }
                else {
                    return { status: false, msg: "Incorrect Password", statusCode: 401 };
                }
            }
            else {
                return { status: false, msg: "Organization not found", statusCode: 401 };
            }
        }
        catch (e) {
            console.log(e);
            return { status: false, msg: "Internal server error", statusCode: 500 };
        }
    }),
    forgetPasswordHelper: (email_address) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const organization = yield organizationAuth_1.default.findOne({ email_address });
            const token = yield tokenHelper_1.default.createJWTToken({ email_id: email_address, type: const_1.default.OTP_TYPE.ORGANIZATION_FORGET_PASSWORD }, const_1.default.OTP_EXPIRE_TIME.toString());
            if (organization && token) {
                organization.token = token;
                yield organization.save();
                notification_service_1.default.organizationForgetPasswordEmail({
                    token: token,
                    email: email_address,
                    name: organization.name
                });
                return {
                    status: true,
                    statusCode: 200,
                    msg: "Reset email has been sent"
                };
            }
            else {
                return {
                    status: false,
                    statusCode: 500,
                    msg: "Something went wrong"
                };
            }
        }
        catch (e) {
            return {
                status: false,
                statusCode: 500,
                msg: "Internal server error"
            };
        }
    }),
    resetPassword: (token, password) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const organizationToken = yield tokenHelper_1.default.checkTokenValidity(token);
            if (typeof organizationToken == "object") {
                const email_address = organizationToken.email_id;
                if (email_address) {
                    const organization = yield organizationAuth_1.default.findOne({ email_address, token });
                    if (organization) {
                        const newPassword = yield bcrypt_1.default.hash(password, Number(process.env.BCRYPT_SALTROUND));
                        const comparePassword = yield bcrypt_1.default.compare(password, organization.password);
                        if (comparePassword) {
                            return {
                                status: false,
                                statusCode: 400,
                                msg: "New password cannot be the same as the last used password."
                            };
                        }
                        if (newPassword) {
                            organization.password = newPassword;
                            organization.token = "";
                            yield organization.save();
                            return {
                                status: true,
                                statusCode: 200,
                                msg: "Password has been updated"
                            };
                        }
                        else {
                            return {
                                status: false,
                                statusCode: 500,
                                msg: "Internal Server Error"
                            };
                        }
                    }
                    else {
                        return {
                            status: false,
                            statusCode: 401,
                            msg: "Organization not found"
                        };
                    }
                }
                else {
                    return {
                        status: false,
                        statusCode: 401,
                        msg: "Organization not found"
                    };
                }
            }
            else {
                return {
                    status: false,
                    statusCode: 401,
                    msg: "Organization not found"
                };
            }
        }
        catch (e) {
            console.log(e);
            return {
                status: false,
                statusCode: 500,
                msg: "Internal server error"
            };
        }
    })
};
// module.exports = authOrganizationHelper;
exports.default = authOrganizationHelper;
