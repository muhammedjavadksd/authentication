import bcrypt from 'bcrypt';
import AdminAuthModel from '../db/models/adminAuth';
import COMMUNICATION_PROVIDER from '../communication/Provider/notification/notification_service';
import tokenHelper from './tokenHelper';
import constant_data from '../config/const';
import { AdminJwtInterFace, HelperFunctionResponse } from '../config/Datas/InterFace';
import { JwtPayload } from 'jsonwebtoken';
import { Request } from 'express';


interface authAdminHelper {
    signInHelper(email: string, password: string): Promise<HelperFunctionResponse>,
    forgetPasswordHelpers(email: string): Promise<HelperFunctionResponse>,
    resetPassword(token: string, password: string): Promise<HelperFunctionResponse>,
    getTokenFromHeader(headers: Request['headers']['authorization']): string | false
}

let authAdminHelper: authAdminHelper = {

    signInHelper: async (email: string, password: string): Promise<HelperFunctionResponse> => {

        try {
            const findAdmin = await AdminAuthModel.findOne({ email_address: email });
            if (findAdmin) {
                const adminPassword: string | null = findAdmin.password as string;
                if (adminPassword) {
                    const comparePassword: boolean = await bcrypt.compare(password, adminPassword);
                    const token: string | null = await tokenHelper.createJWTToken({ email: findAdmin.email_address, type: constant_data.JWT_FOR.ADMIN_AUTH }, constant_data.USERAUTH_EXPIRE_TIME.toString())

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
    },

    forgetPasswordHelpers: async (email: string): Promise<HelperFunctionResponse> => {

        try {
            const findAdmin = await AdminAuthModel.findOne({ email_address: email });
            const token: string | null = await tokenHelper.createJWTToken({ email, type: constant_data.MAIL_TYPE.ADMIN_PASSWORD_REST }, constant_data.OTP_EXPIRE_TIME.toString())

            if (findAdmin && token) {
                findAdmin.token = token;
                await findAdmin.save();
                COMMUNICATION_PROVIDER.adminForgetPasswordEmail({
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
    },


    resetPassword: async (token: string, password: string): Promise<HelperFunctionResponse> => {
        const isTokenValid: string | boolean | JwtPayload = await tokenHelper.checkTokenValidity(token)

        if (isTokenValid) {
            if (typeof isTokenValid == "object") {
                const email_id: string = isTokenValid.email
                const findAdmin = await AdminAuthModel.findOne({ email_address: email_id })

                if (findAdmin && findAdmin.pasword) {
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
                            await findAdmin.save();
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
    },

    getTokenFromHeader: (headers: Request['headers']['authorization']): string | false => {
        const splitAuth = headers?.split(" ");
        if (splitAuth && splitAuth[0] == "Bearer") {
            const token: string | undefined = splitAuth[0];
            if (token) {
                return token
            }
        }
        return false
    }
}

// module.exports = authAdminHelper
export default authAdminHelper