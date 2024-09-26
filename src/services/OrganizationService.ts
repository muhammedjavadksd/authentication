import { JwtPayload } from "jsonwebtoken";
import AuthNotificationProvider from "../communication/Provider/notification/notification_service";
import { HelperFunctionResponse, OrganizationJwtInteraFace } from "../config/Datas/InterFace";
import constant_data from "../config/const";
import OrganizationRepo from "../repositories/OrganizationRepo";
import bcrypt from 'bcrypt'
import { IOrganizationAuthService } from "../config/Interface/Service/ServiceInterface";
import IOrganizationAuthModel from "../config/Interface/IModel/IOrganizationModel";
import TokenHelper from "../helper/tokenHelper";
import { ObjectId } from "mongoose";
import { OrganizationStatus, StatusCode } from "../config/Datas/Enums";



class OrganizationService implements IOrganizationAuthService {

    private OrganizationRepos;
    private tokenHelpers;

    constructor() {
        this.signIn = this.signIn.bind(this)
        this.forgetPasswordHelper = this.forgetPasswordHelper.bind(this)
        this.resetPassword = this.resetPassword.bind(this)
        this.OrganizationRepos = new OrganizationRepo()
        this.tokenHelpers = new TokenHelper();
    }


    async organizationPaginationView(limit: number, skip: number): Promise<HelperFunctionResponse> {
        const findOrganization = await this.OrganizationRepos.organizationPaginatedView(limit, skip);
        if (findOrganization.length) {
            return {
                msg: "Organization has been fetched",
                status: true,
                statusCode: StatusCode.OK
            }
        } else {
            return {
                msg: "No Organization found",
                status: false,
                statusCode: StatusCode.NOT_FOUND
            }
        }
    }


    async findSingleOrganization(organization_id: ObjectId): Promise<HelperFunctionResponse> {
        const organization: IOrganizationAuthModel | null = await this.OrganizationRepos.findOrganizationById(organization_id);
        return {
            msg: organization ? "Data fetched" : "No data found",
            status: !!organization,
            statusCode: organization ? StatusCode.OK : StatusCode.NOT_FOUND,
            data: { organization }
        }
    }


    async updateOrganizationStatus(organization_id: ObjectId, status: OrganizationStatus): Promise<HelperFunctionResponse> {
        const findOrganization: IOrganizationAuthModel | null = await this.OrganizationRepos.findOrganizationById(organization_id);
        if (findOrganization) {
            const update = await this.OrganizationRepos.updateOrganizationById(organization_id, { status });
            if (update) {
                return {
                    msg: "Organization status updated",
                    status: true,
                    statusCode: StatusCode.OK
                }
            } else {
                return {
                    msg: "Organization update failed",
                    status: false,
                    statusCode: StatusCode.BAD_REQUEST
                }
            }
        } else {
            return {
                status: false,
                msg: "We couldn't locate the organization.",
                statusCode: StatusCode.NOT_FOUND
            }
        }
    }

    async signIn(email: string, password: string): Promise<HelperFunctionResponse> {
        try {

            const getData: IOrganizationAuthModel | null = await this.OrganizationRepos.findOrganization(email)

            if (getData && getData.password) {
                const dbPassword: string = getData.password as string;
                const comparePassword: boolean = await bcrypt.compare(password, dbPassword);

                const organizationJwtPayload: OrganizationJwtInteraFace = {
                    name: getData.name as string,
                    email: email,
                    id: getData.id
                }

                const jwtToken: string | null = await this.tokenHelpers.generateJWtToken(organizationJwtPayload, constant_data.USERAUTH_EXPIRE_TIME.toString());
                if (jwtToken) {
                    getData.token = jwtToken
                    // await getData.save()
                    await this.OrganizationRepos.updateOrganizationByModel(getData);
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

            const organization: IOrganizationAuthModel | null = await this.OrganizationRepos.findOrganization(email_address) //OrganizationAuth.findOne({ email_address });
            const token: string | null = await this.tokenHelpers.generateJWtToken({ email_id: email_address, type: constant_data.OTP_TYPE.ORGANIZATION_FORGET_PASSWORD }, constant_data.OTP_EXPIRE_TIME.toString())

            if (organization && token) {
                organization.token = token;
                this.OrganizationRepos.updateOrganizationByModel(organization);
                const authNotificationProvider = new AuthNotificationProvider(process.env.ORGANIZATION_FORGETPASSWORD_EMAIL as string);
                await authNotificationProvider._init_()
                authNotificationProvider.organizationForgetPasswordEmail({
                    token: token,
                    email: email_address,
                    name: organization.name
                })
                return {
                    status: true,
                    statusCode: 200,
                    msg: "Reset email has been sent",
                    data: {
                        token
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
            return {
                status: false,
                statusCode: 500,
                msg: "Internal server error"
            }
        }
    }

    async resetPassword(token: string, password: string): Promise<HelperFunctionResponse> {

        try {
            const organizationToken: boolean | JwtPayload | string = await this.tokenHelpers.checkTokenValidity(token);
            if (typeof organizationToken == "object") {
                const email_address: string = organizationToken.email_id;
                if (email_address) {
                    const organization: IOrganizationAuthModel | null = await this.OrganizationRepos.findOrganization(email_address)
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
                            await this.OrganizationRepos.updateOrganizationByModel(organization)
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