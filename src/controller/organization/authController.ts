
import { Request, Response, NextFunction } from "express";
import { AdminJwtInterFace, ControllerResponseInterFace, HelperFunctionResponse } from "../../config/Datas/InterFace";
import OrganizationService from "../../services/OrganizationService/OrganizationService";
import IOrganizationControllerInterface from "../../config/Interface/IController/IOrganizationController";





class OrganizationController implements IOrganizationControllerInterface {


    private organizationService;

    constructor() {
        this.organizationService = new OrganizationService()
    }


    signUpController(req: Request, res: Response, next: NextFunction): void {
        return;
    }

    async signInController(req: Request, res: Response, next: NextFunction): Promise<void> {
        const email_address: string = req.body.email_address;
        const password: string = req.body.password;

        try {

            let signInService: HelperFunctionResponse = await this.organizationService.signIn(email_address, password);
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
                res.status(200).json({ status: true })
            } else {
                res.status(organizationForgetPassword.statusCode).json({ status: false, msg: organizationForgetPassword.msg ?? "Something went wrong" })
            }
        } catch (e) {
            res.status(500).json({ status: false, msg: "Internal server error" })
        }
    }

    async resetPasswordController(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const password: string = req.body.password;
            const token: string = req.params.token;

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
    }

}

export default OrganizationController