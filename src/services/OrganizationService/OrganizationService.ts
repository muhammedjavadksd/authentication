import { JwtPayload } from "jsonwebtoken";
import AuthNotificationProvider from "../../communication/Provider/notification/notification_service";
import { HelperFunctionResponse, OrganizationJwtInteraFace } from "../../config/Datas/InterFace";
import constant_data from "../../config/const";
import tokenHelper from "../../helper/tokenHelper";
import OrganizationRepo from "../../repositories/OrganizationRepo/OrganizationRepo";
import bcrypt from 'bcrypt'

interface IOrganizationService {
    forgetPasswordHelper(email_address: string): Promise<HelperFunctionResponse>
}

class OrganizationService implements IOrganizationService {

    private OrganizationRepos;

    constructor() {
        this.OrganizationRepos = new OrganizationRepo()
    }


    async signIn(email: string, password: string) {
        try {

            const getData = await this.OrganizationRepos.findOrganization(email) //await OrganizationAuth.findOne({ email_address });

            if (getData && getData.password) {
                const dbPassword: string = getData.password as string;
                const comparePassword: boolean = await bcrypt.compare(password, dbPassword);

                const organizationJwtPayload: OrganizationJwtInteraFace = {
                    name: getData.name as string,
                    email: email,
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
    }

    async forgetPasswordHelper(email_address: string): Promise<HelperFunctionResponse> {

        try {

            const organization = await this.OrganizationRepos.findOrganization(email_address) //OrganizationAuth.findOne({ email_address });
            const token: string | null = await tokenHelper.createJWTToken({ email_id: email_address, type: constant_data.OTP_TYPE.ORGANIZATION_FORGET_PASSWORD }, constant_data.OTP_EXPIRE_TIME.toString())

            if (organization && token) {
                organization.token = token;
                this.OrganizationRepos.updateOrganization(organization);
                const authNotificationProvider = new AuthNotificationProvider();
                authNotificationProvider.organizationForgetPasswordEmail({
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
    }

    async resetPassword(token: string, password: string): Promise<HelperFunctionResponse> {

        try {
            const organizationToken: boolean | JwtPayload | string = await tokenHelper.checkTokenValidity(token);
            if (typeof organizationToken == "object") {
                const email_address: string = organizationToken.email_id;
                if (email_address) {
                    const organization = await this.OrganizationRepos.findOrganization(email_address)
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
                            // await organization.save();
                            await this.OrganizationRepos.updateOrganization(organization)
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

export default OrganizationService;