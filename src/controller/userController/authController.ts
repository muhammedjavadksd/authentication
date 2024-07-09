import { Request, Response, NextFunction } from 'express';
import const_data from '../../config/const';
import signUpUserValidation from '../../config/validation/validation'
import { ControllerResponseInterFace, CustomRequest, HelperFunctionResponse, UserJwtInterFace } from '../../config/Datas/InterFace';
import IUserAuthController from '../../config/Interface/IController/IUserAuthController';
import UserAuthenticationRepo from '../../repositories/UserRepo/UserAuthentication';
import IBaseUser from '../../config/Interface/Objects/IBaseUser';
import UserAuthServices from '../../services/UserAuthService/UserAuthServices';
import IUserModelDocument from '../../config/Interface/IModel/UserAuthModel/IUserAuthModel';


let { AUTH_PROVIDERS_DATA } = const_data;

class UserAuthController implements IUserAuthController {

    private readonly UserAuthRepo;
    private readonly UserAuthService

    constructor() {
        this.signUpController = this.signUpController.bind(this)
        this.signInController = this.signInController.bind(this)
        this.AuthOTPSubmission = this.AuthOTPSubmission.bind(this)
        this.editAuthPhoneNumber = this.editAuthPhoneNumber.bind(this)
        this.resetOtpNumber = this.resetOtpNumber.bind(this)

        this.UserAuthRepo = new UserAuthenticationRepo();
        this.UserAuthService = new UserAuthServices();
    }

    async signUpController(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const phone_number: number = req.body.phone_number;
            const email_address: string = req.body.email_address;
            const first_name: string = req.body.first_name;
            const last_name: string = req.body.last_name;
            const location: string = req.body.location;
            const blood_group: string = req.body.blood_group;

            const auth_id = '';
            const auth_provider: string = AUTH_PROVIDERS_DATA.CREDENTIAL;

            const { error, value } = signUpUserValidation.validate({
                phone_number,
                email_address,
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
                console.log(this);
                const isUserExist: IUserModelDocument | false = await this.UserAuthRepo.findUser(null, email_address, Number(phone_number))
                if (isUserExist && isUserExist.account_started) {
                    let response: ControllerResponseInterFace = {
                        status: false,
                        msg: 'Email/Phone already exist',
                    }
                    res.status(401).json(response);
                } else {
                    this.UserAuthRepo.insertNewUser({
                        auth_id: auth_id,
                        first_name,
                        last_name,
                        auth_provider,
                        email: email_address,
                        phone_number
                    } as IBaseUser
                    ).then((jwtData) => {
                        const successResponse: ControllerResponseInterFace = {
                            status: true,
                            msg: 'Account created success',
                            data: {
                                token: jwtData.token
                            },
                        };
                        res.status(200).json(successResponse);
                    }).catch((err) => {
                        console.log(err);
                        let response: ControllerResponseInterFace = {
                            status: false,
                            msg: "Something went wrong"
                        }
                        res.status(500).json(response);
                    });
                }
            }
        } catch (e) {
            console.log(e);

            let response: ControllerResponseInterFace = {
                status: false,
                msg: "Something went wrong"
            }
            res.status(500).json(response);
        }
    }

    async signInController(req: Request, res: Response, next: NextFunction): Promise<void> {
        const email: string = req.body.email;

        try {
            const userSign: HelperFunctionResponse = await this.UserAuthService.signInHelper(email)

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
            console.log(e);
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
                const otpVerification: HelperFunctionResponse = await this.UserAuthService.authOTPValidate(otp, email_id, token)

                if (otpVerification.status) {
                    let responseData: UserJwtInterFace = otpVerification.data;
                    console.log(otpVerification.data);

                    const otpResponse = {
                        jwt: responseData['jwt'],
                        first_name: responseData['first_name'],
                        last_name: responseData['last_name'],
                        email: responseData['email'],
                        phone: responseData['phone'],
                    } as UserJwtInterFace

                    console.log(otpResponse);

                    res.status(200).json({
                        status: true,
                        msg: 'OTP Verification success',
                        data: otpResponse
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
                const editRequest: HelperFunctionResponse = await this.UserAuthService.editAuthEmailID(oldEmailId, newEmailID);
                if (editRequest.status) {
                    let { token } = editRequest.data;
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
                } else {
                    res.status(500).json({
                        status: false,
                        msg: editRequest.msg,
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
                    const result: HelperFunctionResponse = await this.UserAuthService.resendOtpNumer(tokenEmail)
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



export default UserAuthController;

