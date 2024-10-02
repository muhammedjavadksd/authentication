import { JwtPayload } from "jsonwebtoken";
import AuthNotificationProvider from "../communication/Provider/notification/notification_service";
import { AdminJwtInterFace, HelperFunctionResponse } from "../config/Datas/InterFace";
import constant_data from "../config/const";
import AdminAuthenticationRepo from "../repositories/AdminAuthentication";
import bcrypt from 'bcrypt';
import IAdminAuthModel from "../config/Interface/IModel/IAdminAuthModel";
import { IAdminAuthService } from "../config/Interface/Service/ServiceInterface";
import TokenHelper from "../helper/tokenHelper";
import { OrganizationStatus, StatusCode } from "../config/Datas/Enums";
import IOrganizationAuthModel from "../config/Interface/IModel/IOrganizationModel";
import OrganizationRepo from "../repositories/OrganizationRepo";
import { ObjectId } from "mongoose";

class AdminAuthService implements IAdminAuthService {

    private AdminAuthRepo;
    private OrganizationRepo;
    private tokenHelpers;

    constructor() {
        this.signIn = this.signIn.bind(this)
        this.forgetPassword = this.forgetPassword.bind(this)
        this.resetPassword = this.resetPassword.bind(this)
        this.updatePassword = this.updatePassword.bind(this)
        this.AdminAuthRepo = new AdminAuthenticationRepo();
        this.OrganizationRepo = new OrganizationRepo();
        this.tokenHelpers = new TokenHelper();
    }


    async updatePassword(password: string, email_id: string, admin_email: string): Promise<HelperFunctionResponse> {
        const findAdmin = await this.AdminAuthRepo.findAdmin(admin_email);
        if (findAdmin) {
            const decodePassword = password ? await bcrypt.hash(password, Number(process.env.BCRYPT_SALTROUND)) : findAdmin.password;
            if (decodePassword == findAdmin.password && password) {
                return {
                    status: false,
                    msg: "Use a diffrent password",
                    statusCode: StatusCode.BAD_REQUEST
                }
            } else {
                findAdmin.password = decodePassword
                findAdmin.email_address = email_id
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
            const findAdmin: IAdminAuthModel | null = await this.AdminAuthRepo.findAdmin(email) //await AdminAuthModel.findOne({ email_address: email });
            if (findAdmin) {
                const adminPassword: string | null = findAdmin.password as string;
                if (adminPassword) {
                    const comparePassword: boolean = await bcrypt.compare(password, adminPassword);
                    const token: string | null = await this.tokenHelpers.generateJWtToken({ email: findAdmin.email_address, type: constant_data.JWT_FOR.ADMIN_AUTH, role: "admin", profile_id: "admin_profile", user_id: findAdmin._id }, constant_data.USERAUTH_EXPIRE_TIME.toString())
                    if (comparePassword && token) {
                        findAdmin.token = token ?? "";
                        await this.AdminAuthRepo.updateAdmin(findAdmin)
                        return {
                            statusCode: 200,
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
                        console.log("Creditial is wrong");
                        return {
                            statusCode: 401,
                            status: false,
                            msg: "Incorrect Password",
                        }
                    }
                } else {
                    return {
                        statusCode: 400,
                        status: false,
                        msg: "Please provide valid password",
                    }
                }
            } else {
                return {
                    statusCode: 401,
                    status: false,
                    msg: "Email id is not found",
                }
            }
        } catch (e) {
            console.log(e);
            return {
                statusCode: 500,
                status: false,
                msg: "Internal Server Error",
            }
        }
    }


    async forgetPassword(email: string): Promise<HelperFunctionResponse> {

        try {
            const findAdmin: IAdminAuthModel | null = await this.AdminAuthRepo.findAdmin(email)
            const token: string | null = await this.tokenHelpers.generateJWtToken({ email, type: constant_data.MAIL_TYPE.ADMIN_PASSWORD_REST }, constant_data.OTP_EXPIRE_TIME.toString())

            if (findAdmin && token) {
                findAdmin.token = token;
                await this.AdminAuthRepo.updateAdmin(findAdmin);

                console.log(findAdmin);

                const authCommunicationProvider = new AuthNotificationProvider(process.env.ADMIN_FORGETPASSWORD_EMAIL as string);
                await authCommunicationProvider._init_()
                authCommunicationProvider.adminForgetPasswordEmail({
                    token: token,
                    email,
                    name: findAdmin.name
                })
                return {
                    status: true,
                    statusCode: 200,
                    msg: "Reset email has been sent"
                }
            } else {
                return {
                    status: false,
                    statusCode: 401,
                    msg: "We couldn't locate the admin you're looking for."
                }
            }
        } catch (e) {
            console.log(e);
            return {
                status: false,
                statusCode: 500,
                msg: "Internal Server Error"
            }
        }
    }

    async resetPassword(token: string, password: string): Promise<HelperFunctionResponse> {
        const isTokenValid: string | boolean | JwtPayload = await this.tokenHelpers.checkTokenValidity(token)

        if (isTokenValid) {
            if (typeof isTokenValid == "object") {
                const email_id: string = isTokenValid.email
                const findAdmin: IAdminAuthModel | null = await this.AdminAuthRepo.findAdmin(email_id) //AdminAuthModel.findOne({ email_address: email_id })

                if (findAdmin && findAdmin.password) {
                    console.log(token);
                    console.log(findAdmin.token);


                    if (findAdmin.token == token) {

                        const newPassword: string = await bcrypt.hash(password, Number(process.env.BCRYPT_SALTROUND));
                        const comparePassword: boolean = await bcrypt.compare(password, findAdmin.password as string)

                        if (comparePassword) {
                            return {
                                status: false,
                                statusCode: 400,
                                msg: "New password cannot be the same as the last used password."
                            }
                        }

                        if (newPassword) {
                            findAdmin.password = newPassword;
                            findAdmin.token = "";
                            // await findAdmin.save();
                            this.AdminAuthRepo.updateAdmin(findAdmin)
                            return {
                                status: true,
                                statusCode: 200,
                                msg: "Password has been updated"
                            }
                        } else {
                            return {
                                status: false,
                                statusCode: 500,
                                msg: "Internal Server Error"
                            }
                        }
                    } else {
                        return {
                            status: false,
                            statusCode: 401,
                            msg: "Invalid Token"
                        }
                    }
                } else {
                    return {
                        status: false,
                        statusCode: 401,
                        msg: "Invalid Token ID"
                    }
                }
            } else {
                return {
                    status: false,
                    statusCode: 401,
                    msg: "Invalid Token ID"
                }
            }
        } else {
            return {
                status: false,
                statusCode: 401,
                msg: "Token time has been expired"
            }
        }
    }


}

export default AdminAuthService