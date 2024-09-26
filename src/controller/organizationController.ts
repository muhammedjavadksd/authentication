
import { Request, Response, NextFunction } from "express";
import { AdminJwtInterFace, ControllerResponseInterFace, CustomRequest, HelperFunctionResponse } from "../config/Datas/InterFace";
import OrganizationService from "../services/OrganizationService";
import IOrganizationControllerInterface from "../config/Interface/IController/IOrganizationController";





class OrganizationController implements IOrganizationControllerInterface {


    private organizationService;

    constructor() {
        this.signInController = this.signInController.bind(this)
        this.signUpController = this.signUpController.bind(this)
        this.forgetPasswordController = this.forgetPasswordController.bind(this)
        this.resetPasswordController = this.resetPasswordController.bind(this)
        this.organizationService = new OrganizationService()
    }


    signUpController(req: Request, res: Response, next: NextFunction): void {
        return;
    }

    async signInController(req: Request, res: Response, next: NextFunction): Promise<void> {
        const email_address: string = req.body.email_address;
        const password: string = req.body.password;

        try {

            const signInService: HelperFunctionResponse = await this.organizationService.signIn(email_address, password);
            console.log(signInService);

            if (signInService.status) {
                const responseData: AdminJwtInterFace = signInService.data;
                const token: string = responseData.token;
                if (token) {
                    res.status(200).json({ status: true, data: { token }, name: responseData.name, msg: "Login success" } as ControllerResponseInterFace)
                } else {
                    res.status(401).json({ status: false, msg: "Something went wrong" } as ControllerResponseInterFace)
                }
            } else {
                res.status(401).json({ status: false, msg: signInService?.msg ?? "Something went wrong" } as ControllerResponseInterFace)
            }
        } catch (e) {
            console.log(e);
            res.status(500).json({ status: false, msg: "Internal server error" } as ControllerResponseInterFace)
        }
    }

    async forgetPasswordController(req: Request, res: Response, next: NextFunction): Promise<void> {
        const email_address: string = req.body.email_address;



        try {

            const organizationForgetPassword: HelperFunctionResponse = await this.organizationService.forgetPasswordHelper(email_address);
            if (organizationForgetPassword.status) {
                res.status(200).json({ status: true, data: { token: organizationForgetPassword.data.token } })
            } else {
                res.status(organizationForgetPassword.statusCode).json({ status: false, msg: organizationForgetPassword.msg ?? "Something went wrong" })
            }
        } catch (e) {
            console.log(e);
            res.status(500).json({ status: false, msg: "Internal server error" })
        }
    }

    async resetPasswordController(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {


        const context = req.context;
        console.log(context);

        if (context && context.email_id && context.email_id) {
            try {
                const password: string = req.body.password;
                const token: string = context.token;

                const resetPassword: HelperFunctionResponse = await this.organizationService.resetPassword(token, password);
                if (resetPassword.status) {
                    res.status(200).json({ status: true })
                } else {
                    res.status(resetPassword.statusCode).json({ status: false, msg: resetPassword.msg })
                }
            } catch (e) {
                console.log(e);
                res.status(500).json({ status: false, msg: "Internal server error" })
            }
        } else {
            res.status(401).json({ status: false, msg: "Invalid authentication" })
        }
    }

}

export default OrganizationController