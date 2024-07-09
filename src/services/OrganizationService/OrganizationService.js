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
const OrganizationRepo_1 = __importDefault(require("../../repositories/OrganizationRepo/OrganizationRepo"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const tokenHelper_1 = __importDefault(require("../../helper/token/tokenHelper"));
class OrganizationService {
    constructor() {
        this.signIn = this.signIn.bind(this);
        this.forgetPasswordHelper = this.forgetPasswordHelper.bind(this);
        this.resetPassword = this.resetPassword.bind(this);
        this.OrganizationRepos = new OrganizationRepo_1.default();
        this.tokenHelpers = new tokenHelper_1.default();
    }
    signIn(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const getData = yield this.OrganizationRepos.findOrganization(email);
                if (getData && getData.password) {
                    const dbPassword = getData.password;
                    const comparePassword = yield bcrypt_1.default.compare(password, dbPassword);
                    const organizationJwtPayload = {
                        name: getData.name,
                        email: email,
                        id: getData.id
                    };
                    const jwtToken = yield this.tokenHelpers.generateJWtToken(organizationJwtPayload, const_1.default.USERAUTH_EXPIRE_TIME.toString());
                    if (jwtToken) {
                        getData.token = jwtToken;
                        // await getData.save()
                        yield this.OrganizationRepos.updateOrganization(getData);
                        if (comparePassword) {
                            return { status: true, data: { token: jwtToken }, msg: "Sign in success", statusCode: 200 };
                        }
                        else {
                            return { status: false, msg: "Incorrect Password", statusCode: 401 };
                        }
                    }
                    else {
                        return { status: false, msg: "Internal server error", statusCode: 500 };
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
        });
    }
    forgetPasswordHelper(email_address) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const organization = yield this.OrganizationRepos.findOrganization(email_address); //OrganizationAuth.findOne({ email_address });
                const token = yield this.tokenHelpers.generateJWtToken({ email_id: email_address, type: const_1.default.OTP_TYPE.ORGANIZATION_FORGET_PASSWORD }, const_1.default.OTP_EXPIRE_TIME.toString());
                if (organization && token) {
                    organization.token = token;
                    this.OrganizationRepos.updateOrganization(organization);
                    const authNotificationProvider = new notification_service_1.default();
                    authNotificationProvider.organizationForgetPasswordEmail({
                        token: token,
                        email: email_address,
                        name: organization.name
                    });
                    return {
                        status: true,
                        statusCode: 200,
                        msg: "Reset email has been sent",
                        data: {
                            token
                        }
                    };
                }
                else {
                    return {
                        status: false,
                        statusCode: 500,
                        msg: "Organization not found"
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
        });
    }
    resetPassword(token, password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const organizationToken = yield this.tokenHelpers.checkTokenValidity(token);
                if (typeof organizationToken == "object") {
                    const email_address = organizationToken.email_id;
                    if (email_address) {
                        const organization = yield this.OrganizationRepos.findOrganization(email_address);
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
                                // await organization.save();
                                yield this.OrganizationRepos.updateOrganization(organization);
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
        });
    }
}
exports.default = OrganizationService;
