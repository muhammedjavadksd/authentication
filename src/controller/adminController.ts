import { Request, Response, NextFunction } from "express";
import { AdminJwtInterFace, ControllerResponseInterFace, CustomRequest, HelperFunctionResponse } from "../config/Datas/InterFace";
import AdminAuthService from "../services/AdminAuthService";
import utilHelper from "../helper/utilHelper";
import IAdminController from "../config/Interface/IController/iAdminController";
import OrganizationService from "../services/OrganizationService";
import { OrganizationStatus, StatusCode } from "../config/Datas/Enums";
import { ObjectId } from "mongoose";



class AdminController implements IAdminController {

    private AdminServices;
    private OrganizationServices;

    constructor() {
        this.signInController = this.signInController.bind(this)
        this.forgetPasswordController = this.forgetPasswordController.bind(this)
        this.adminPasswordReset = this.adminPasswordReset.bind(this)
        this.updateSettings = this.updateSettings.bind(this)
        this.verifyToken = this.verifyToken.bind(this)
        this.AdminServices = new AdminAuthService();
        this.OrganizationServices = new OrganizationService();
    }


    async verifyToken(req: CustomRequest, res: Response): Promise<void> {
        const token = req.headers['authorization'];
        if (token) {
            const emailEmail = await this.AdminServices.verifyToken(token)
            res.status(emailEmail.statusCode).json({ status: emailEmail.status, msg: emailEmail.msg, data: emailEmail.data })
        } else {
            res.status(StatusCode.UNAUTHORIZED).json({ status: false, msg: "Un authraized access" })
        }
    }

    async updateSettings(req: CustomRequest, res: Response): Promise<void> {
        const password = req.body.password;
        const email_id = req.body.email_id;
        const admin_email = req.context?.email_id;

        if (email_id || password) {
            const updatePassword = await this.AdminServices.updatePassword(password, email_id, admin_email)
            res.status(updatePassword.statusCode).json({ status: updatePassword.status, msg: updatePassword.msg, data: updatePassword.data })
        } else {
            res.status(StatusCode.UNAUTHORIZED).json({ status: false, msg: "Un authraized access" })
        }
    }

    async organizationSingleView(req: Request, res: Response, next: NextFunction): Promise<void> {
        const organization_id = req.params.organization_id as unknown as ObjectId
        const findOrganization = await this.OrganizationServices.findSingleOrganization(organization_id);
        res.status(findOrganization.statusCode).json({ status: findOrganization.status, msg: findOrganization.msg, data: findOrganization.data })
    }

    async organizationPaginationView(req: Request, res: Response, next: NextFunction): Promise<void> {
        // :limit/:skip/:per_page
        const limit: number = +(req.params.limit);
        const skip: number = +(req.params.skip);

        const findOrganization: HelperFunctionResponse = await this.OrganizationServices.organizationPaginationView(limit, skip);
        res.status(findOrganization.statusCode).json({ status: findOrganization.status, msg: findOrganization.msg, data: findOrganization.data })
    }

    async updateOrganizationStatus(req: Request, res: Response): Promise<void> {
        const organization_id: ObjectId = req.body.organization_id;
        const status: OrganizationStatus = req.body.status;
        const updateOrganization = await this.OrganizationServices.updateOrganizationStatus(organization_id, status);
        res.status(updateOrganization.statusCode).json({ status: updateOrganization.status, msg: updateOrganization.msg })
    }


    async signInController(req: Request, res: Response, next: NextFunction): Promise<void> {
        const email_address: string = req.body.email_address;
        const password: string = req.body.password;




        try {
            const adminAuthAttempt: HelperFunctionResponse = await this.AdminServices.signIn(email_address, password)

            if (adminAuthAttempt.status) {
                const helperData: AdminJwtInterFace | null | undefined = adminAuthAttempt.data;

                if (helperData) {
                    const response: ControllerResponseInterFace = {
                        status: adminAuthAttempt.status,
                        msg: adminAuthAttempt.msg,
                        data: {
                            email: helperData.email,
                            name: helperData.name,
                            token: helperData.token
                        }
                    }
                    res.status(adminAuthAttempt.statusCode).json(response)
                } else {
                    const response: ControllerResponseInterFace = {
                        status: adminAuthAttempt.status,
                        msg: adminAuthAttempt.msg,
                    }
                    console.log(adminAuthAttempt.msg);

                    res.status(adminAuthAttempt.statusCode).json(response)
                }
            } else {
                const response: ControllerResponseInterFace = {
                    status: false,
                    msg: adminAuthAttempt.msg,
                }
                res.status(adminAuthAttempt.statusCode).json(response)
            }
        } catch (e) {
            const response: ControllerResponseInterFace = {
                status: false,
                msg: "Internal server error",
            }
            res.status(500).json(response)
        }
    }

    async forgetPasswordController(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

            const email_id: string = req.body.email_id;
            const adminResetRequest: HelperFunctionResponse = await this.AdminServices.forgetPassword(email_id);
            res.status(adminResetRequest.statusCode).json({ status: true, msg: adminResetRequest.msg } as ControllerResponseInterFace)
        } catch (e) {
            console.log(e);
            res.status(500).json({ status: false, msg: "Internal Server Error" } as ControllerResponseInterFace)
        }
    }


    async adminPasswordReset(req: Request, res: Response): Promise<void> {

        try {


            const token: string = req.params.token //utilHelper.getTokenFromHeader(req['headers']['authorization']);
            const password: string = req.body.password;

            // console.log(token, password);


            if (password && token) {
                const resetPassword: HelperFunctionResponse = await this.AdminServices.resetPassword(token, password);
                res.status(resetPassword.statusCode).json({
                    status: resetPassword.status,
                    msg: resetPassword.msg,
                } as ControllerResponseInterFace)
            } else {
                res.status(401).json({
                    status: false,
                    msg: "Please provide a password",
                } as ControllerResponseInterFace)
            }
        } catch (e) {
            console.log(e);
            res.status(500).json({
                status: false,
                msg: "Internal Servor Error",
            } as ControllerResponseInterFace)
        }
    }

}


export default AdminController