import { JwtPayload } from "jsonwebtoken";
import AuthNotificationProvider from "../../communication/Provider/notification/notification_service";
import { AdminJwtInterFace, HelperFunctionResponse } from "../../config/Datas/InterFace";
import constant_data from "../../config/const";
import tokenHelper from "../../helper/token/tokenHelper";
import AdminAuthenticationRepo from "../../repositories/AdminRepo/AdminAuthentication";
import bcrypt from 'bcrypt';
import IAdminAuthModel from "../../config/Interface/IModel/AdminAuthModel/IAdminAuthModel";
import TokenHelper from "../../helper/token/tokenHelper";
import { IAdminAuthService } from "../../config/Interface/Service/ServiceInterface";

class AdminAuthService implements IAdminAuthService {

    private AdminAuthRepo;
    private tokenHelpers;

    constructor() {
        this.AdminAuthRepo = new AdminAuthenticationRepo();
        this.tokenHelpers = new TokenHelper();
    }

    async signIn(email: string, password: string): Promise<HelperFunctionResponse> {

        try {
            const findAdmin: IAdminAuthModel | null = await this.AdminAuthRepo.findAdmin(email) //await AdminAuthModel.findOne({ email_address: email });
            if (findAdmin) {
                const adminPassword: string | null = findAdmin.password as string;
                if (adminPassword) {
                    const comparePassword: boolean = await bcrypt.compare(password, adminPassword);
                    const token: string | null = await this.tokenHelpers.generateJWtToken({ email: findAdmin.email_address, type: constant_data.JWT_FOR.ADMIN_AUTH }, constant_data.USERAUTH_EXPIRE_TIME.toString())

                    if (comparePassword && token) {
                        return {
                            statusCode: 200,
                            status: true,
                            msg: "Admin auth success",
                            data: {
                                email: email,
                                name: findAdmin.name,
                                token
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

                const authCommunicationProvider = new AuthNotificationProvider();
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