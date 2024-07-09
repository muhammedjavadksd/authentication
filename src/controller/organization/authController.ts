
import { Request, Response, NextFunction } from "express";
import { AdminJwtInterFace, ControllerResponseInterFace, HelperFunctionResponse } from "../../config/Datas/InterFace";
import OrganizationService from "../../services/OrganizationService/OrganizationService";


interface IOrganizationControllerInterface {
    signUpController(req: Request, res: Response, next: NextFunction): void,
    signInController(req: Request, res: Response, next: NextFunction): void
    forgetPasswordController(req: Request, res: Response, next: NextFunction): void
    resetPasswordController(req: Request, res: Response, next: NextFunction): void
}


class OrganizationController implements IOrganizationControllerInterface {


    private organizationService;

    constructor() {
        this.organizationService = new OrganizationService()
    }


    signUpController(req: Request, res: Response, next: NextFunction): void {

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

// let authController: OrganizationControllerInterface = {

//     signUpController: (req: Request, res: Response, next: NextFunction) => {

//         const name: string = req.body.name;
//         const phone_number: number = req.body.phone_number;
//         const email_address: string = req.body.email_address;
//         const password: string = req.body.password;
//         const blood_service: string = req.body.blood_service;
//         const fund_service: string = req.body.fund_service;
//         const organization_type: string = req.body.organization_type;
//         const websiteurl: string = req.body.website_url;

//         // if (req.files?.length) {

//         //     const files: Array<Express.Multer.File> = req.files



//         //     const logo_photo = organizationFileName(req.files.logo_photo, "logo")
//         //     const office_photo = organizationFileName(req.files.office_photo, "kyc_")
//         //     const registration_photo = organizationFileName(req.files.registration_photo, "kyc_")

//         //     authOrganizationHelper.signUpHelper(name, phone_number, email_address, password, blood_service, fund_service, organization_type, pan_card_photo, logo_photo, office_photo, registration_photo, websiteurl).then(() => {
//         //         res.status(201).json({ status: true })
//         //     }).catch((err) => {
//         //         res.status(500).json({ status: false, msg: "Something went wrong" })
//         //     })
//         // }
//     },

//     signInController: (req, res, next): void => {

//         const email_address: string = req.body.email_address;
//         const password: string = req.body.password;

//         try {

//             authOrganizationHelper.signInHelper(email_address, password).then((data: HelperFunctionResponse) => {
//                 if (data.status) {
//                     const responseData: AdminJwtInterFace = data.data;
//                     if (responseData.token) {
//                         const token: string = responseData.token;
//                         if (token) {
//                             res.status(200).json({ status: true, data: { token }, name: responseData.name, msg: "Login success" } as ControllerResponseInterFace)
//                         } else {
//                             res.status(500).json({ status: false, msg: "Internal server error" } as ControllerResponseInterFace)
//                         }
//                     } else {
//                         res.status(401).json({ status: false, msg: data?.msg ?? "Something went wrong" } as ControllerResponseInterFace)
//                     }
//                 } else {
//                     res.status(401).json({ status: false, msg: data?.msg ?? "Something went wrong" } as ControllerResponseInterFace)
//                 }
//             }).catch((err) => {
//                 console.log(err);
//                 res.status(500).json({ status: false, msg: "Internal server error" } as ControllerResponseInterFace)
//             })
//         } catch (e) {
//             console.log(e);
//             res.status(500).json({ status: false, msg: "Internal server error" } as ControllerResponseInterFace)
//         }

//     },

//     forgetPasswordController: (req: Request, res: Response, next: NextFunction): void => {

//         const email_address: string = req.body.email_address;

//         authOrganizationHelper.forgetPasswordHelper(email_address).then((data: HelperFunctionResponse) => {
//             if (data.status) {
//                 res.status(200).json({ status: true })
//             } else {
//                 res.status(data.statusCode).json({ status: false, msg: data.msg })
//             }
//         }).catch((err) => {
//             console.log(err);
//             res.status(500).json({ status: false, msg: "Internal server error" })
//         })
//     },

//     resetPasswordController: (req: Request, res: Response, next: NextFunction): void => {

//         try {

//             const password: string = req.body.password;
//             const token: string = req.params.token;

//             authOrganizationHelper.resetPassword(token, password).then((data: HelperFunctionResponse) => {
//                 if (data.status) {
//                     res.status(200).json({ status: true })
//                 } else {
//                     res.status(data.statusCode).json({ status: false, msg: data.msg })
//                 }
//             }).catch((err: any) => {
//                 console.log(err);
//                 res.status(500).json({ status: false, msg: "Internal server error" })
//             })
//         } catch (e) {
//             console.log(e);
//             res.status(200).json({ status: false, msg: "Internal server error" })
//         }
//     }
// }

// module.exports = authController
export default OrganizationController