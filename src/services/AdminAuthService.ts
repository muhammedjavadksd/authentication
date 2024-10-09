import { JwtPayload } from "jsonwebtoken";
import AuthNotificationProvider from "../communication/Provider/notification/notification_service";
import constant_data from "../config/const";
import AdminAuthenticationRepo from "../repositories/AdminAuthentication";
import bcrypt from 'bcrypt';
import TokenHelper from "../helper/tokenHelper";
import { JwtTimer, StatusCode } from "../config/Datas/Enums";
import { IAdminAuthService } from "../config/Datas/Interface/MethodInterface";
import { AdminJwtInterFace, HelperFunctionResponse, IAdminEmailVerify } from "../config/Datas/Interface/UtilInterface";
import { IAdminAuthModel } from "../config/Datas/Interface/DatabaseModel";

class AdminAuthService implements IAdminAuthService {

    private AdminAuthRepo;
    private tokenHelpers;

    constructor() {
        this.signIn = this.signIn.bind(this)
        this.forgetPassword = this.forgetPassword.bind(this)
        this.resetPassword = this.resetPassword.bind(this)
        this.updatePassword = this.updatePassword.bind(this)
        this.verifyToken = this.verifyToken.bind(this)
        this.AdminAuthRepo = new AdminAuthenticationRepo();
        this.tokenHelpers = new TokenHelper();
    }


    async verifyToken(token: string): Promise<HelperFunctionResponse> {

        const decodeToken = await this.tokenHelpers.checkTokenValidity(token) as Record<string, any>;
        if (decodeToken && typeof decodeToken == "object") {
            const email_id: string | undefined = decodeToken['email_id'];
            const adminEmail: string | undefined = decodeToken['admin_email'];
            if (email_id && adminEmail) {
                const findAdmin = await this.AdminAuthRepo.findAdmin(adminEmail);
                if (findAdmin) {
                    findAdmin.email_address = email_id;
                    const updateEmailId = await this.AdminAuthRepo.updateAdmin(findAdmin);

                    if (updateEmailId) {
                        return {
                            msg: "Email id has been updated",
                            status: true,
                            statusCode: StatusCode.OK
                        }
                    }
                }
            }
        }
        return {
            msg: "Admin not found",
            status: false,
            statusCode: StatusCode.BAD_REQUEST
        }
    }

    async updatePassword(password: string, email_id: string, admin_email: string): Promise<HelperFunctionResponse> {
        const findAdmin = await this.AdminAuthRepo.findAdmin(admin_email);
        if (findAdmin) {
            const decodePassword: string = password ? await bcrypt.hash(password, Number(process.env.BCRYPT_SALTROUND)) : findAdmin.password;
            if (decodePassword == findAdmin.password && password) {
                return {
                    status: false,
                    msg: "Use a diffrent password",
                    statusCode: StatusCode.BAD_REQUEST
                }
            } else {
                if (admin_email != email_id) {
                    const verifyPayload: IAdminEmailVerify = {
                        email_id,
                        admin_email
                    }
                    const verifyToken = await this.tokenHelpers.generateJWtToken(verifyPayload, JwtTimer.OtpTimer);
                    if (verifyPayload) {
                        const provider = new AuthNotificationProvider(process.env.ADMIN_UPDATE_VERIFY || "");
                        await provider._init_()
                        provider.dataTransfer({ token: verifyToken, email_id: admin_email });
                    }
                }
                findAdmin.password = decodePassword
                const updatePassword = await this.AdminAuthRepo.updateAdmin(findAdmin);
                if (updatePassword) {
                    return {
                        status: true,
                        msg: "Password update success",
                        statusCode: StatusCode.OK
                    }
                } else {
                    return {
                        status: false,
                        msg: "Password update failed",
                        statusCode: StatusCode.BAD_REQUEST
                    }
                }
            }
        } else {
            return {
                msg: "We couldn't find the admin",
                status: false,
                statusCode: StatusCode.UNAUTHORIZED
            }
        }
    }



    async signIn(email: string, password: string): Promise<HelperFunctionResponse> {

        try {
            const findAdmin: IAdminAuthModel | null = await this.AdminAuthRepo.findAdmin(email)
            if (findAdmin) {
                const adminPassword: string | null = findAdmin.password as string;
                if (adminPassword) {
                    const comparePassword: boolean = await bcrypt.compare(password, adminPassword);
                    const token: string | null = await this.tokenHelpers.generateJWtToken({ email: findAdmin.email_address, type: constant_data.JWT_FOR.ADMIN_AUTH, role: "admin", profile_id: "admin_profile", user_id: findAdmin._id }, JwtTimer.RefreshTokenExpiresInDays)
                    if (comparePassword && token) {
                        findAdmin.token = token ?? "";
                        await this.AdminAuthRepo.updateAdmin(findAdmin)
                        return {
                            statusCode: StatusCode.OK,
                            status: true,
                            msg: "Admin auth success",
                            data: {
                                email: email,
                                name: findAdmin.name,
                                token,
                                role: "admin"
                            } as AdminJwtInterFace
                        }
                    } else {
                        return {
                            statusCode: StatusCode.UNAUTHORIZED,
                            status: false,
                            msg: "Incorrect Password",
                        }
                    }
                } else {
                    return {
                        statusCode: StatusCode.BAD_REQUEST,
                        status: false,
                        msg: "Please provide valid password",
                    }
                }
            } else {
                return {
                    statusCode: StatusCode.BAD_REQUEST,
                    status: false,
                    msg: "Email id is not found",
                }
            }
        } catch (e) {
            console.log(e);
            return {
                statusCode: StatusCode.SERVER_ERROR,
                status: false,
                msg: "Internal Server Error",
            }
        }
    }


    async forgetPassword(email: string): Promise<HelperFunctionResponse> {

        try {
            const findAdmin: IAdminAuthModel | null = await this.AdminAuthRepo.findAdmin(email)
            const token: string | null = await this.tokenHelpers.generateJWtToken({ email, type: constant_data.MAIL_TYPE.ADMIN_PASSWORD_REST }, JwtTimer.OtpTimer)

            if (findAdmin && token) {
                findAdmin.token = token;
                await this.AdminAuthRepo.updateAdmin(findAdmin);
                const authCommunicationProvider = new AuthNotificationProvider(process.env.ADMIN_FORGETPASSWORD_EMAIL as string);
                await authCommunicationProvider._init_()
                authCommunicationProvider.adminForgetPasswordEmail({
                    token: token,
                    email,
                    name: findAdmin.name
                })
                return {
                    status: true,
                    statusCode: StatusCode.OK,
                    msg: "Reset email has been sent"
                }
            } else {
                return {
                    status: false,
                    statusCode: StatusCode.OK,
                    msg: "We couldn't locate the admin you're looking for."
                }
            }
        } catch (e) {
            return {
                status: false,
                statusCode: StatusCode.SERVER_ERROR,
                msg: "Internal Server Error"
            }
        }
    }

    async resetPassword(token: string, password: string): Promise<HelperFunctionResponse> {
        const isTokenValid: string | boolean | JwtPayload = await this.tokenHelpers.checkTokenValidity(token)

        if (isTokenValid && typeof isTokenValid == "object") {
            const email_id: string | undefined = isTokenValid.email
            if (email_id) {
                const findAdmin: IAdminAuthModel | null = await this.AdminAuthRepo.findAdmin(email_id) //AdminAuthModel.findOne({ email_address: email_id })
                if (findAdmin && findAdmin.password) {
                    if (findAdmin.token == token) {
                        const newPassword: string = await bcrypt.hash(password, Number(process.env.BCRYPT_SALTROUND));
                        const comparePassword: boolean = await bcrypt.compare(password, findAdmin.password as string)
                        if (comparePassword) {
                            return {
                                status: false,
                                statusCode: StatusCode.BAD_REQUEST,
                                msg: "New password cannot be the same as the last used password."
                            }
                        }

                        if (newPassword) {
                            findAdmin.password = newPassword;
                            findAdmin.token = "";
                            this.AdminAuthRepo.updateAdmin(findAdmin)
                            return {
                                status: true,
                                statusCode: StatusCode.OK,
                                msg: "Password has been updated"
                            }
                        } else {
                            return {
                                status: false,
                                statusCode: StatusCode.SERVER_ERROR,
                                msg: "Internal Server Error"
                            }
                        }
                    }
                }
            }
        }
        return {
            status: false,
            statusCode: StatusCode.UNAUTHORIZED,
            msg: "Invalid Token ID"
        }
    }


}

export default AdminAuthService