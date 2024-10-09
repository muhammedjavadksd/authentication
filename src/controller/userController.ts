import { Request, Response, NextFunction } from 'express';
import const_data from '../config/const';
import signUpUserValidation from '../config/validation'
// import { ControllerResponseInterFace, CustomRequest, HelperFunctionResponse, UserJwtInterFace } from '../config/Datas/InterFace';
// import IUserAuthController from '../config/Datas/Interface/IController/IUserAuthController';
import UserAuthenticationRepo from '../repositories/UserAuthentication';
// import { IBaseUser } from '../config/Datas/Interface/Objects/IBaseUser';
// import UserAuthServices from '../services/UserAuthServices';
// import IUserModelDocument from '../config/Datas/Interface/IModel/IUserAuthModel';
import mongoose, { ObjectId } from 'mongoose';
import { StatusCode } from '../config/Datas/Enums';
import utilHelper from '../helper/utilHelper';
import { IUserAuthController } from '../config/Datas/Interface/MethodInterface';
import UserAuthServices from '../services/UserAuthServices';
import { ControllerResponseInterFace, CustomRequest, HelperFunctionResponse, IBaseUser, UserJwtInterFace } from '../config/Datas/Interface/UtilInterface';
import { IUserModelDocument } from '../config/Datas/Interface/DatabaseModel';


const { AUTH_PROVIDERS_DATA } = const_data;

class UserAuthController implements IUserAuthController {

    private readonly UserAuthRepo;
    private readonly UserAuthService

    constructor() {
        this.signUpController = this.signUpController.bind(this)
        this.signInController = this.signInController.bind(this)
        this.AuthOTPSubmission = this.AuthOTPSubmission.bind(this)
        this.editAuthPhoneNumber = this.editAuthPhoneNumber.bind(this)
        this.resetOtpNumber = this.resetOtpNumber.bind(this)
        this.updateAuth = this.updateAuth.bind(this)
        this.signWithToken = this.signWithToken.bind(this)
        this.refreshToken = this.refreshToken.bind(this);
        this.completeAccount = this.completeAccount.bind(this)
        this.signUpWithProvide = this.signUpWithProvide.bind(this)
        this.UserAuthRepo = new UserAuthenticationRepo();
        this.UserAuthService = new UserAuthServices();
    }

    async refreshToken(req: Request, res: Response): Promise<void> {
        const refreshToken: string | undefined = req.cookies['refresh_token'];
        if (refreshToken) {
            const refresh = await this.UserAuthService.refreshToken(refreshToken);
            res.status(refresh.statusCode).json({ status: refresh.status, msg: refresh.msg, data: refresh.data })
        } else {
            res.status(StatusCode.UNAUTHORIZED).json({ status: false, msg: "Un authraized access" })
        }
    }

    async completeAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
        const phoneNumber: number = req.body.phone_number;
        const header: string | undefined = req.headers['authorization'];
        const token: string | false = utilHelper.getTokenFromHeader(header)

        if (token) {
            const complete_account = await this.UserAuthService.accountCompleteHelper(token, phoneNumber);
            res.status(complete_account.statusCode).json({ status: complete_account.status, msg: complete_account.msg })
        } else {
            res.status(StatusCode.UNAUTHORIZED).json({ status: false, msg: "Invalid sing up attempt" })
        }
    }


    async signUpWithProvide(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        const header: string | undefined = req.headers['authorization'];
        const auth_id: string = req.body.auth_id
        const token: string | false = utilHelper.getTokenFromHeader(header)
        if (token) {
            const save = await this.UserAuthService.signUpProvideHelper(token, auth_id);
            res.status(save.statusCode).json({ status: save.status, msg: save.msg, data: save.data })
        } else {
            res.status(StatusCode.UNAUTHORIZED).json({ status: false, msg: "Invalid sing up attempt" })
        }
    }



    async signWithToken(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        const user_id: string | undefined = req.context?.user_id;
        if (user_id) {
            const findUser = await this.UserAuthRepo.findUser(user_id, null, null);
            if (findUser) {
                const loginData = {
                    jwt: findUser['jwtToken'],
                    first_name: findUser['first_name'],
                    last_name: findUser['last_name'],
                    email: findUser['email'],
                    phone: findUser['phone_number'],
                    user_id: findUser['id'],
                    profile_id: findUser['user_id'],
                    blood_token: findUser['blood_token']
                } as UserJwtInterFace
                res.status(StatusCode.OK).json({ status: true, msg: "Login attempt success", data: { profile: loginData } })
            } else {
                res.status(StatusCode.UNAUTHORIZED).json({
                    status: true, msg: "No user found"
                })
            }
        } else {
            res.status(StatusCode.UNAUTHORIZED).json({
                status: true, msg: "No user found"
            })
        }
    }


    async updateAuth(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        const user_id: mongoose.Types.ObjectId | undefined = req.context?.user_id;
        if (user_id) {
            const editData = {
                blood_token: req.body.blood_token
            }

            const updateUser = await this.UserAuthRepo.updateUserById(user_id, editData);
            if (updateUser) {
                res.status(StatusCode.OK).json({ status: true, msg: "Updated success" })
            } else {
                res.status(StatusCode.BAD_REQUEST).json({ status: false, msg: "Updated failed" })
            }
        } else {
            res.status(StatusCode.UNAUTHORIZED).json({ status: false, msg: "Invalid authentication" })
        }
    }

    async signUpController(req: Request, res: Response, next: NextFunction): Promise<void> {

        try {
            const phone_number: number = req.body.phone_number;
            const email_address: string = req.body.email_address;
            const first_name: string = req.body.first_name;
            const last_name: string = req.body.last_name;


            const auth_id = '';
            const auth_provider: string = AUTH_PROVIDERS_DATA.CREDENTIAL;

            const { error, value } = signUpUserValidation.validate({
                phone_number,
                email_address,
                auth_provider,
                first_name,
                last_name,
            });

            if (error) {
                const response: ControllerResponseInterFace = {
                    status: false,
                    msg: error.details[0].message,
                }

                res.status(StatusCode.SERVER_ERROR).json({ response });
            } else {
                const isUserExist: IUserModelDocument | false = await this.UserAuthRepo.findUser(null, email_address, Number(phone_number))

                if (isUserExist && isUserExist.account_started) {
                    const response: ControllerResponseInterFace = {
                        status: false,
                        msg: 'Email/Phone already exist',
                    }
                    res.status(StatusCode.CONFLICT).json(response);
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
                        res.status(StatusCode.OK).json(successResponse);
                    }).catch((err) => {
                        console.log(err);
                        const response: ControllerResponseInterFace = {
                            status: false,
                            msg: "Something went wrong"
                        }
                        res.status(StatusCode.SERVER_ERROR).json(response);
                    });
                }
            }
        } catch (e) {
            console.log(e);

            const response: ControllerResponseInterFace = {
                status: false,
                msg: "Something went wrong"
            }
            res.status(StatusCode.SERVER_ERROR).json(response);
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
            res.status(StatusCode.SERVER_ERROR).json(response);
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
                    const responseData: UserJwtInterFace = otpVerification.data;
                    const otpResponse = {
                        jwt: responseData['jwt'],
                        first_name: responseData['first_name'],
                        last_name: responseData['last_name'],
                        email: responseData['email'],
                        phone: responseData['phone'],
                        user_id: responseData['user_id'],
                        profile_id: responseData['profile_id'],
                        blood_token: responseData['blood_token'],
                        refresh_token: responseData['refresh_token']
                    } as UserJwtInterFace

                    res.status(StatusCode.OK).json({
                        status: true,
                        msg: 'OTP Verification success',
                        data: otpResponse
                    } as ControllerResponseInterFace);

                } else {
                    res.status(StatusCode.UNAUTHORIZED).json({
                        status: false,
                        msg: otpVerification.msg,
                    } as ControllerResponseInterFace);
                }
            } catch (e) {
                res.status(StatusCode.UNAUTHORIZED).json({
                    status: false,
                    msg: 'Something went wrong',
                } as ControllerResponseInterFace);
            }
        } else {
            res.status(StatusCode.UNAUTHORIZED).json({
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
            if (oldEmailId == newEmailID) {
                res.status(StatusCode.BAD_REQUEST).json({
                    status: false,
                    msg: "Please enter diffrent email ID",
                } as ControllerResponseInterFace);
            } else {

                try {
                    const editRequest: HelperFunctionResponse = await this.UserAuthService.editAuthEmailID(oldEmailId, newEmailID);
                    if (editRequest.status) {
                        const { token } = editRequest.data;
                        if (token) {
                            res.status(editRequest.statusCode).json({
                                status: editRequest.status,
                                data: {
                                    token: editRequest.data?.token,
                                },
                                msg: editRequest.msg,
                            } as ControllerResponseInterFace);
                        } else {
                            res.status(StatusCode.SERVER_ERROR).json({
                                status: false,
                                msg: "Something went wrong",
                            } as ControllerResponseInterFace);
                        }
                    } else {
                        res.status(StatusCode.SERVER_ERROR).json({
                            status: false,
                            msg: editRequest.msg,
                        } as ControllerResponseInterFace);
                    }
                } catch (e) {
                    console.log(e);
                    res.status(StatusCode.SERVER_ERROR).json({
                        status: false,
                        msg: 'Something went wrong',
                    } as ControllerResponseInterFace);
                }
            }
        } else {
            res.status(StatusCode.BAD_REQUEST).json({
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
                    console.log(result);
                    console.log("The result");


                    if (result.data) {
                        const token: string = result.data?.token;
                        if (token) {
                            res.status(result.statusCode).json({ msg: result.msg, status: result.status, token } as ControllerResponseInterFace);
                        } else {
                            res.status(StatusCode.BAD_REQUEST).json({ msg: "Email id not found", status: false } as ControllerResponseInterFace);
                        }
                    } else {
                        res.status(StatusCode.BAD_REQUEST).json({ msg: "Email id not found", status: false } as ControllerResponseInterFace);
                    }
                } catch (e) {
                    res.status(StatusCode.SERVER_ERROR).json({
                        status: false,
                        msg: "Internal server error",
                    } as ControllerResponseInterFace);
                }
            } else {
                res.status(StatusCode.UNAUTHORIZED).json({
                    status: false,
                    msg: "Authentication failed",
                } as ControllerResponseInterFace);
            }
        } else {
            res.status(StatusCode.UNAUTHORIZED).json({
                status: true,
                msg: 'Unauthorized request',
            } as ControllerResponseInterFace);
        }
    }

}



export default UserAuthController;

