import { Request, Response, NextFunction } from 'express';
import const_data from '../../config/const';
import signUpUserValidation from '../../config/validation/validation'
import authHelper from '../../helper/authUserHelper';
import userHelper from '../../helper/userHelper';
import { AuthController, ControllerResponseInterFace, CustomRequest, HelperFunctionResponse, UserJwtInterFace } from '../../config/Datas/InterFace';
import IUserAuthController from '../../config/Interface/IController/IUserAuthController';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import UserAuthenticationRepo from '../../repositories/UserAuthentication';


let { AUTH_PROVIDERS_DATA } = const_data;

class UserAuthController implements IUserAuthController {

    private readonly UserAuthRepo;

    constructor() {
        this.UserAuthRepo = new UserAuthenticationRepo();
    }

    async signUpController(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const phone_number: number = req.body.phone_number;
            const email_address: string = req.body.email_address;
            const first_name: string = req.body.first_name;
            const last_name: string = req.body.last_name;
            const location: string = req.body.location;
            const blood_group: string = req.body.blood_group;

            const auth_id = null;
            const auth_provider: string = AUTH_PROVIDERS_DATA.CREDENTIAL;

            const { error, value } = signUpUserValidation.validate({
                phone_number,
                email_address,
                auth_id,
                blood_group,
                auth_provider,
                first_name,
                last_name,
                location,
            });

            if (error) {
                let response: ControllerResponseInterFace = {
                    status: false,
                    msg: error.details[0].message,
                }
                res.status(500).json({ response });
            } else {
                const isUserExist = await this.UserAuthRepo.isUserExist(email_address, phone_number) //await userHelper.isUserExist(email_address, phone_number.toString());
                if (isUserExist) {
                    let response: ControllerResponseInterFace = {
                        status: false,
                        msg: 'Email/Phone already exist',
                    }
                    res.status(401).json(response);
                } else {
                    userHelper.insertNewUser(first_name, last_name, phone_number.toString(), email_address, auth_id, auth_provider, location).then((jwtData) => {

                        const successResponse: ControllerResponseInterFace = {
                            status: true,
                            msg: 'Account created success',
                            data: {
                                token: jwtData.token
                            },
                        };
                        res.status(200).json(successResponse);
                    }).catch((err) => {
                        let response: ControllerResponseInterFace = {
                            status: false,
                            msg: "Something went wrong"
                        }
                        res.status(500).json(response);
                    });
                }
            }
        } catch (e) {
            let response: ControllerResponseInterFace = {
                status: false,
                msg: "Something went wrong"
            }
            res.status(500).json(response);
        }
    }

    async signInController(req: Request, res: Response, next: NextFunction): Promise<void> {
        const email: string = req.body.email;

        console.log('Checking email id is  a : ' + email);

        try {
            const userSign: HelperFunctionResponse = await authHelper.userSignInHelper(email);

            if (userSign.status && userSign.data) {
                const response: ControllerResponseInterFace = {
                    status: true,
                    msg: 'OTP has been sent',
                    data: {
                        token: userSign.data?.token,
                    }
                }
                res.status(userSign.statusCode).json(response);
            } else {
                const response: ControllerResponseInterFace = {
                    status: false,
                    msg: userSign.msg
                }
                res.status(userSign.statusCode).json(response);
            }
        } catch (e) {
            const response: ControllerResponseInterFace = {
                status: false,
                msg: 'Something went wrong',
            }
            res.status(500).json(response);
        }
    }

    async AuthOTPSubmission(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        const otp: number = req.body.otp_number;
        const email_id: string = req.context?.email_id;
        const token: string = req.context?.token;

        if (email_id && token) {
            try {
                const otpVerification: HelperFunctionResponse = await authHelper.AuthOTPValidate(otp, email_id, token);

                if (otpVerification.status) {
                    let responseData: UserJwtInterFace = otpVerification.data;
                    res.status(200).json({
                        status: true,
                        msg: 'OTP Verification sucess',
                        data: {
                            jwt: responseData.jwt,
                            first_name: responseData.first_name,
                            last_name: responseData.last_name,
                            email: responseData.email,
                            phone: responseData.phone,
                        } as UserJwtInterFace
                    } as ControllerResponseInterFace);
                } else {
                    res.status(401).json({
                        status: false,
                        msg: otpVerification.msg,
                    } as ControllerResponseInterFace);
                }
            } catch (e) {
                res.status(500).json({
                    status: false,
                    msg: 'Something went wrong',
                } as ControllerResponseInterFace);
            }
        } else {
            res.status(401).json({
                status: false,
                msg: 'Unauthorized access',
            } as ControllerResponseInterFace);
        }
    }

    async editAuthPhoneNumber(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        const newEmailID: string = req.body.email_id;
        const requestContext = req.context;

        if (requestContext && requestContext?.email_id) {

            const oldEmailId: string = requestContext.email_id;

            try {
                const editRequest: HelperFunctionResponse = await authHelper.editAuthPhoneNumber(oldEmailId, newEmailID);
                const token: string = editRequest?.data?.token;
                if (token) {
                    res.status(editRequest.statusCode).json({
                        status: editRequest.status,
                        data: {
                            token: editRequest.data?.token,
                        },
                        msg: editRequest.msg,
                    } as ControllerResponseInterFace);
                } else {
                    res.status(500).json({
                        status: false,
                        msg: "Something went wrong",
                    } as ControllerResponseInterFace);
                }
            } catch (e) {
                console.log(e);
                res.status(500).json({
                    status: false,
                    msg: 'Something went wrong',
                } as ControllerResponseInterFace);
            }
        } else {
            res.status(201).json({
                status: false,
                msg: "Invalid Token"
            } as ControllerResponseInterFace);
        }
    }

    async resetOtpNumber(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {

        const requestContext = req.context;
        if (requestContext && requestContext.email_id) {
            const tokenEmail: string = requestContext.email_id;
            if (tokenEmail) {
                try {
                    const result: HelperFunctionResponse = await authHelper.resendOtpNumer(tokenEmail);
                    if (result.data) {
                        let token: string = result.data?.token;
                        if (token) {
                            res.status(result.statusCode).json({ msg: result.msg, status: result.status, token } as ControllerResponseInterFace);
                        } else {
                            res.status(400).json({ msg: "Email id not found", status: false } as ControllerResponseInterFace);
                        }
                    } else {
                        res.status(400).json({ msg: "Email id not found", status: false } as ControllerResponseInterFace);
                    }
                } catch (e) {
                    res.status(500).json({
                        status: false,
                        msg: "Internal server error",
                    } as ControllerResponseInterFace);
                }
            } else {
                res.status(401).json({
                    status: false,
                    msg: "Authentication failed",
                } as ControllerResponseInterFace);
            }
        } else {
            res.status(500).json({
                status: true,
                msg: 'Unauthorized request',
            } as ControllerResponseInterFace);
        }
    }

}



// const authController: AuthController = {
//     signUpController: async (req: Request, res: Response): Promise<void> => {
//         try {
//             const phone_number: number = req.body.phone_number;
//             const email_address: string = req.body.email_address;
//             const first_name: string = req.body.first_name;
//             const last_name: string = req.body.last_name;
//             const location: string = req.body.location;
//             const blood_group: string = req.body.blood_group;

//             const auth_id = null;
//             const auth_provider: string = AUTH_PROVIDERS_DATA.CREDENTIAL;

//             const { error, value } = signUpUserValidation.validate({
//                 phone_number,
//                 email_address,
//                 auth_id,
//                 blood_group,
//                 auth_provider,
//                 first_name,
//                 last_name,
//                 location,
//             });

//             if (error) {
//                 let response: ControllerResponseInterFace = {
//                     status: false,
//                     msg: error.details[0].message,
//                 }
//                 res.status(500).json({ response });
//             } else {
//                 const isUserExist = await userHelper.isUserExist(email_address, phone_number.toString());
//                 if (isUserExist) {
//                     let response: ControllerResponseInterFace = {
//                         status: false,
//                         msg: 'Email/Phone already exist',
//                     }
//                     res.status(401).json(response);
//                 } else {
//                     userHelper.insertNewUser(first_name, last_name, phone_number.toString(), email_address, auth_id, auth_provider, location).then((jwtData) => {

//                         const successResponse: ControllerResponseInterFace = {
//                             status: true,
//                             msg: 'Account created success',
//                             data: {
//                                 token: jwtData.token
//                             },
//                         };
//                         res.status(200).json(successResponse);
//                     }).catch((err) => {
//                         let response: ControllerResponseInterFace = {
//                             status: false,
//                             msg: "Something went wrong"
//                         }
//                         res.status(500).json(response);
//                     });
//                 }
//             }
//         } catch (e) {
//             let response: ControllerResponseInterFace = {
//                 status: false,
//                 msg: "Something went wrong"
//             }
//             res.status(500).json(response);
//         }
//     },

//     signInController: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//         const email: string = req.body.email;

//         console.log('Checking email id is  a : ' + email);

//         try {
//             const userSign: HelperFunctionResponse = await authHelper.userSignInHelper(email);

//             if (userSign.status && userSign.data) {
//                 const response: ControllerResponseInterFace = {
//                     status: true,
//                     msg: 'OTP has been sent',
//                     data: {
//                         token: userSign.data?.token,
//                     }
//                 }
//                 res.status(userSign.statusCode).json(response);
//             } else {
//                 const response: ControllerResponseInterFace = {
//                     status: false,
//                     msg: userSign.msg
//                 }
//                 res.status(userSign.statusCode).json(response);
//             }
//         } catch (e) {
//             const response: ControllerResponseInterFace = {
//                 status: false,
//                 msg: 'Something went wrong',
//             }
//             res.status(500).json(response);
//         }
//     },

//     AuthOTPSubmission: async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
//         const otp: number = req.body.otp_number;
//         const email_id: string = req.context?.email_id;
//         const token: string = req.context?.token;

//         if (email_id && token) {
//             try {
//                 const otpVerification: HelperFunctionResponse = await authHelper.AuthOTPValidate(otp, email_id, token);

//                 if (otpVerification.status) {
//                     let responseData: UserJwtInterFace = otpVerification.data;
//                     res.status(200).json({
//                         status: true,
//                         msg: 'OTP Verification sucess',
//                         data: {
//                             jwt: responseData.jwt,
//                             first_name: responseData.first_name,
//                             last_name: responseData.last_name,
//                             email: responseData.email,
//                             phone: responseData.phone,
//                         } as UserJwtInterFace
//                     } as ControllerResponseInterFace);
//                 } else {
//                     res.status(401).json({
//                         status: false,
//                         msg: otpVerification.msg,
//                     } as ControllerResponseInterFace);
//                 }
//             } catch (e) {
//                 res.status(500).json({
//                     status: false,
//                     msg: 'Something went wrong',
//                 } as ControllerResponseInterFace);
//             }
//         } else {
//             res.status(401).json({
//                 status: false,
//                 msg: 'Unauthorized access',
//             } as ControllerResponseInterFace);
//         }
//     },

//     editAuthPhoneNumber: async (req: CustomRequest, res: Response): Promise<void> => {
//         const newEmailID: string = req.body.email_id;
//         const requestContext = req.context;

//         if (requestContext && requestContext?.email_id) {

//             const oldEmailId: string = requestContext.email_id;

//             try {
//                 const editRequest: HelperFunctionResponse = await authHelper.editAuthPhoneNumber(oldEmailId, newEmailID);
//                 const token: string = editRequest?.data?.token;
//                 if (token) {
//                     res.status(editRequest.statusCode).json({
//                         status: editRequest.status,
//                         data: {
//                             token: editRequest.data?.token,
//                         },
//                         msg: editRequest.msg,
//                     } as ControllerResponseInterFace);
//                 } else {
//                     res.status(500).json({
//                         status: false,
//                         msg: "Something went wrong",
//                     } as ControllerResponseInterFace);
//                 }
//             } catch (e) {
//                 console.log(e);
//                 res.status(500).json({
//                     status: false,
//                     msg: 'Something went wrong',
//                 } as ControllerResponseInterFace);
//             }
//         } else {
//             res.status(201).json({
//                 status: false,
//                 msg: "Invalid Token"
//             } as ControllerResponseInterFace);
//         }
//     },

//     resetOtpNumber: async (req: CustomRequest, res: Response): Promise<void> => {

//         const requestContext = req.context;
//         if (requestContext && requestContext.email_id) {
//             const tokenEmail: string = requestContext.email_id;
//             if (tokenEmail) {
//                 try {
//                     const result: HelperFunctionResponse = await authHelper.resendOtpNumer(tokenEmail);
//                     if (result.data) {
//                         let token: string = result.data?.token;
//                         if (token) {
//                             res.status(result.statusCode).json({ msg: result.msg, status: result.status, token } as ControllerResponseInterFace);
//                         } else {
//                             res.status(400).json({ msg: "Email id not found", status: false } as ControllerResponseInterFace);
//                         }
//                     } else {
//                         res.status(400).json({ msg: "Email id not found", status: false } as ControllerResponseInterFace);
//                     }
//                 } catch (e) {
//                     res.status(500).json({
//                         status: false,
//                         msg: "Internal server error",
//                     } as ControllerResponseInterFace);
//                 }
//             } else {
//                 res.status(401).json({
//                     status: false,
//                     msg: "Authentication failed",
//                 } as ControllerResponseInterFace);
//             }
//         } else {
//             res.status(500).json({
//                 status: true,
//                 msg: 'Unauthorized request',
//             } as ControllerResponseInterFace);
//         }
//     },
// };


export default UserAuthController;

