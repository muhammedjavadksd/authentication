import OrganizationAuth from "../db/models/organizationAuth";
import bcrypt from 'bcrypt'
import tokenHelper from "./tokenHelper";
import constant_data from "../config/const";
import COMMUNICATION_PROVIDER from "../communication/Provider/notification/notification_service";
import { HelperFunctionResponse, OrganizationJwtInteraFace } from "../config/Datas/InterFace";
import { JwtPayload } from "jsonwebtoken";


interface authOrganizationHelperInterFace {
    signUpHelper(name: string, phone_number: number, email_address: string, password: string, blood_service: string, fund_service: string, organization_type: string, pan_card_photo: string, logo_photo: string, office_photo: string, registration_photo: string, website_url: string): Promise<boolean>
    signInHelper(email_address: string, password: string): Promise<HelperFunctionResponse>
    forgetPasswordHelper(email_address: string): Promise<HelperFunctionResponse>
    resetPassword(token: string, password: string): Promise<HelperFunctionResponse>
}

const authOrganizationHelper: authOrganizationHelperInterFace = {


    signUpHelper: async (name: string, phone_number: number, email_address: string, password: string, blood_service: string, fund_service: string, organization_type: string, pan_card_photo: string, logo_photo: string, office_photo: string, registration_photo: string, website_url: string): Promise<boolean> => {
        try {

            password = await bcrypt.hash(password, Number(process.env.BCRYPT_SALTROUND))
            const newOrganization = new OrganizationAuth({ name, phone_number, email_address, password, blood_service, fund_service, organization_type, pan_card_photo, logo_photo, office_photo, registration_photo, website_url });
            await newOrganization.save()
            return true;
        } catch (e) {
            console.log(e);
            return false
        }
    },

    signInHelper: async (email_address: string, password: string): Promise<HelperFunctionResponse> => {

        try {

            const getData = await OrganizationAuth.findOne({ email_address });

            if (getData && getData.password) {
                const dbPassword: string = getData.password as string;
                const comparePassword: boolean = await bcrypt.compare(password, dbPassword);

                const organizationJwtPayload: OrganizationJwtInteraFace = {
                    name: getData.name as string,
                    email: email_address,
                    id: getData.id
                }

                const jwtToken: string | null = await tokenHelper.createJWTToken(organizationJwtPayload, constant_data.USERAUTH_EXPIRE_TIME.toString());
                if (jwtToken) {
                    getData.token = jwtToken
                    await getData.save()
                    if (comparePassword) {
                        return { status: true, data: { token: jwtToken }, msg: "Sign in success", statusCode: 200 }
                    } else {
                        return { status: false, msg: "Incorrect Password", statusCode: 401 }
                    }
                } else {
                    return { status: false, msg: "Internal server error", statusCode: 500 }
                }
            } else {
                return { status: false, msg: "Organization not found", statusCode: 401 }
            }
        } catch (e) {
            console.log(e);
            return { status: false, msg: "Internal server error", statusCode: 500 }
        }
    },


    forgetPasswordHelper: async (email_address: string): Promise<HelperFunctionResponse> => {

        try {

            const organization = await OrganizationAuth.findOne({ email_address });
            const token: string | null = await tokenHelper.createJWTToken({ email_id: email_address, type: constant_data.OTP_TYPE.ORGANIZATION_FORGET_PASSWORD }, constant_data.OTP_EXPIRE_TIME.toString())

            if (organization && token) {
                organization.token = token;
                await organization.save();
                COMMUNICATION_PROVIDER.organizationForgetPasswordEmail({
                    token: token,
                    email: email_address,
                    name: organization.name
                })
                return {
                    status: true,
                    statusCode: 200,
                    msg: "Reset email has been sent"
                }
            } else {
                return {
                    status: false,
                    statusCode: 500,
                    msg: "Something went wrong"
                }
            }
        } catch (e) {
            return {
                status: false,
                statusCode: 500,
                msg: "Internal server error"
            }
        }
    },

    resetPassword: async (token: string, password: string): Promise<HelperFunctionResponse> => {

        try {
            const organizationToken: boolean | JwtPayload | string = await tokenHelper.checkTokenValidity(token);
            if (typeof organizationToken == "object") {
                const email_address: string = organizationToken.email_id;
                if (email_address) {
                    const organization = await OrganizationAuth.findOne({ email_address, token });
                    if (organization) {

                        const newPassword: string = await bcrypt.hash(password, Number(process.env.BCRYPT_SALTROUND));
                        const comparePassword: boolean = await bcrypt.compare(password, organization.password as string);

                        if (comparePassword) {
                            return {
                                status: false,
                                statusCode: 400,
                                msg: "New password cannot be the same as the last used password."
                            }
                        }

                        if (newPassword) {
                            organization.password = newPassword;
                            organization.token = "";
                            await organization.save();
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
                            msg: "Organization not found"
                        }
                    }
                } else {
                    return {
                        status: false,
                        statusCode: 401,
                        msg: "Organization not found"
                    }
                }
            } else {
                return {
                    status: false,
                    statusCode: 401,
                    msg: "Organization not found"
                }
            }
        } catch (e) {
            console.log(e);
            return {
                status: false,
                statusCode: 500,
                msg: "Internal server error"
            }
        }
    }
}


// module.exports = authOrganizationHelper;
export default authOrganizationHelper