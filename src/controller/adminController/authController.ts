import { Request, Response, NextFunction } from "express";
import authAdminHelper from "../../helper/authAdminHelper";
import { AdminAuthController, AdminJwtInterFace, ControllerResponseInterFace, HelperFunctionResponse } from "../../config/Datas/InterFace";


let authController: AdminAuthController = {

    signInController: async (req: Request, res: Response, next: NextFunction): Promise<void> => {

        const email_address: string = req.body.email_address;
        const password: string = req.body.password;

        try {
            const adminAuthAttempt: HelperFunctionResponse = await authAdminHelper.signInHelper(email_address, password)
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
                res.status(adminAuthAttempt.statusCode).json(response)
            }
        } catch (e) {
            const response: ControllerResponseInterFace = {
                status: false,
                msg: "Internal server error",
            }
            res.status(500).json(response)
        }
    },

    forgetPasswordController: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {

            let email_id: string = req.body.email_id;
            let adminResetRequest: HelperFunctionResponse = await authAdminHelper.forgetPasswordHelpers(email_id)
            res.status(adminResetRequest.statusCode).json({ status: true, msg: adminResetRequest.msg } as ControllerResponseInterFace)
        } catch (e) {
            console.log(e);
            res.status(500).json({ status: false, msg: "Internal Server Error" } as ControllerResponseInterFace)
        }
    },


    adminPasswordReset: async (req: Request, res: Response): Promise<void> => {

        try {


            let token: string | false = authAdminHelper.getTokenFromHeader(req['headers']['authorization']);
            let password: string = req.body.password;

            if (password && token) {
                const resetPassword: HelperFunctionResponse = await authAdminHelper.resetPassword(token, password);
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

export default authController