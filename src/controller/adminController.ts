import { Request, Response, NextFunction } from "express";
import AdminAuthService from "../services/AdminAuthService";
import { StatusCode } from "../config/Datas/Enums";
import utilHelper from "../helper/utilHelper";
import { IAdminController } from "../config/Datas/Interface/MethodInterface";
import { AdminJwtInterFace, ControllerResponseInterFace, CustomRequest, HelperFunctionResponse } from "../config/Datas/Interface/UtilInterface";

class AdminController implements IAdminController {

    private AdminServices;

    constructor() {
        this.signInController = this.signInController.bind(this)
        this.forgetPasswordController = this.forgetPasswordController.bind(this)
        this.adminPasswordReset = this.adminPasswordReset.bind(this)
        this.updateSettings = this.updateSettings.bind(this)
        this.verifyToken = this.verifyToken.bind(this)
        this.AdminServices = new AdminAuthService();
    }


    async verifyToken(req: CustomRequest, res: Response): Promise<void> {
        const authToken = req.headers['authorization']
        const token: string | false = utilHelper.getTokenFromHeader(authToken)
        if (token) {
            const emailEmail = await this.AdminServices.verifyToken(token)
            res.status(emailEmail.statusCode).json({ status: emailEmail.status, msg: emailEmail.msg, data: emailEmail.data })
        } else {
            res.status(StatusCode.UNAUTHORIZED).json({ status: false, msg: "Un authraized access" })
        }
    }

    async updateSettings(req: CustomRequest, res: Response): Promise<void> {
        const password: string = req.body.password;
        const email_id: string = req.body.email_id;
        const admin_email: string = req.context?.email_id;

        if (email_id || password) {
            const updatePassword = await this.AdminServices.updatePassword(password, email_id, admin_email)
            res.status(updatePassword.statusCode).json({ status: updatePassword.status, msg: updatePassword.msg, data: updatePassword.data })
        } else {
            res.status(StatusCode.UNAUTHORIZED).json({ status: false, msg: "Un authraized access" })
        }
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
            res.status(StatusCode.SERVER_ERROR).json(response)
        }
    }

    async forgetPasswordController(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const email_id: string = req.body.email_id;
            const adminResetRequest: HelperFunctionResponse = await this.AdminServices.forgetPassword(email_id);
            res.status(adminResetRequest.statusCode).json({ status: true, msg: adminResetRequest.msg } as ControllerResponseInterFace)
        } catch (e) {
            res.status(StatusCode.SERVER_ERROR).json({ status: false, msg: "Internal Server Error" } as ControllerResponseInterFace)
        }
    }


    async adminPasswordReset(req: Request, res: Response): Promise<void> {

        try {

            const token: string = req.params.token
            const password: string = req.body.password;

            if (password && token) {
                const resetPassword: HelperFunctionResponse = await this.AdminServices.resetPassword(token, password);
                res.status(resetPassword.statusCode).json({
                    status: resetPassword.status,
                    msg: resetPassword.msg,
                } as ControllerResponseInterFace)
            } else {
                res.status(StatusCode.UNAUTHORIZED).json({
                    status: false,
                    msg: "Please provide a password",
                } as ControllerResponseInterFace)
            }
        } catch (e) {
            console.log(e);
            res.status(StatusCode.SERVER_ERROR).json({
                status: false,
                msg: "Internal Servor Error",
            } as ControllerResponseInterFace)
        }
    }

}


export default AdminController