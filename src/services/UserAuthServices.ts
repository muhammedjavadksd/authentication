import mongoose from "mongoose";
import AuthNotificationProvider from "../communication/Provider/notification/notification_service";
import { HelperFunctionResponse, UserJwtInterFace } from "../config/Datas/InterFace";
import IUserModelDocument from "../config/Interface/IModel/IUserAuthModel";
import constant_data from "../config/const";
import tokenHelper from "../helper/tokenHelper";
import utilHelper from "../helper/utilHelper";
import UserAuthenticationRepo from "../repositories/UserAuthentication";
import ProfileCommunicationProvider from "../communication/Provider/profile/profile_service";


interface IUserAuthServices {

}

class UserAuthServices implements IUserAuthServices {

    private UserAuthRepo;

    constructor() {
        this.UserAuthRepo = new UserAuthenticationRepo()
    }

    async signInHelper(email: string): Promise<HelperFunctionResponse> {
        try {
            const userAuth: IUserModelDocument | false = await this.UserAuthRepo.findUser(null, email, null);
            if (userAuth) {

                const otpNumber: number = utilHelper.generateAnOTP(6);
                const otpExpireTime: number = constant_data.MINIMUM_OTP_TIMER();

                const token: string | null = await tokenHelper.createJWTToken({ email_id: userAuth['email'], type: constant_data.OTP_TYPE.SIGN_IN_OTP }, constant_data.OTP_EXPIRE_TIME.toString())
                if (token) {
                    userAuth.otp = otpNumber;
                    userAuth.otp_timer = otpExpireTime;
                    userAuth.jwtToken = token;

                    await this.UserAuthRepo.updateUser(userAuth);

                    // await userAuth.save()
                    const userAuthProvider = new AuthNotificationProvider();
                    await userAuthProvider._init_();
                    userAuthProvider.signInOTPSender({
                        otp: otpNumber,
                        email: userAuth.email,
                        full_name: userAuth.first_name + userAuth.last_name
                    })
                    return {
                        statusCode: 200,
                        status: true,
                        msg: "OTP Has been sent ",
                        data: {
                            token
                        }
                    }
                } else {
                    return {
                        statusCode: 401,
                        status: false,
                        msg: "Provide valid token"
                    }
                }
            } else {
                return {
                    statusCode: 401,
                    status: false,
                    msg: "User not found"
                }
            }
        } catch (e) {
            return {
                statusCode: 500,
                status: false,
                msg: "Something went wrong"
            }
        }
    }

    async authOTPValidate(otp: number, email_id: string, token: string): Promise<HelperFunctionResponse> {
        try {
            const getUser = await this.UserAuthRepo.findUser(null, email_id, null);

            if (!getUser) {
                return {
                    status: false,
                    msg: "Email ID not found",
                    statusCode: 401
                }
            }

            const userJwtToken: string = getUser.jwtToken;
            if (userJwtToken != token) {
                return {
                    status: false,
                    msg: "Invalid Token",
                    statusCode: 401
                }
            }

            const otpExpireTimer: number = getUser.otp_timer;
            const validateOtp = utilHelper.OTPValidator(otp, getUser.otp, otpExpireTimer);


            if (!validateOtp.status) {
                return {
                    status: false,
                    msg: validateOtp.msg ?? "Incorrect OTP or OTP has been expired",
                    statusCode: 400
                }
            }

            const first_name: string = getUser.first_name;
            const last_name: string = getUser.last_name;
            const _id: mongoose.Types.ObjectId = getUser._id;
            const phone_number: number = getUser.phone_number;

            const jwtToken: string | null = await tokenHelper.createJWTToken({ email: email_id, first_name: first_name, last_name: last_name, phone: phone_number } as UserJwtInterFace, constant_data.USERAUTH_EXPIRE_TIME.toString())
            if (!jwtToken) {
                return {
                    status: false,
                    msg: "Internal server error",
                    statusCode: 500
                }
            }

            getUser.jwtToken = jwtToken;


            if (!getUser.account_started) {
                getUser.account_started = true
                const profileCommunicationProvider = new ProfileCommunicationProvider();
                await profileCommunicationProvider._init_();
                profileCommunicationProvider.authDataTransfer({ email: getUser.email, first_name: getUser.first_name, last_name: getUser.last_name, phone_number: getUser.phone_number, auth_id: getUser.auth_id ?? "", auth_provider: getUser.auth_provider ?? "" })
            }

            // await getUser.save();
            await this.UserAuthRepo.updateUser(getUser)

            const userJwtData: UserJwtInterFace = {
                jwt: jwtToken,
                first_name: getUser.first_name,
                last_name: getUser.last_name,
                email: getUser.email,
                phone: getUser.phone_number,
            }

            return {
                status: true,
                msg: "OTP Verified Success",
                data: { UserJwtInterFace: userJwtData },
                statusCode: 200
            }

        } catch (e) {
            return {
                status: false,
                msg: "Something went wront",
                statusCode: 500
            }
        }
    }

    async editAuthEmailID(oldEmailId: string, newEmailID: string): Promise<HelperFunctionResponse> {

        const otpNumber: number = utilHelper.generateAnOTP(6);
        const otpExpireTime: number = constant_data.MINIMUM_OTP_TIMER();

        try {
            const getUser: IUserModelDocument | false = await this.UserAuthRepo.findUser(null, newEmailID, null);
            if (getUser && !getUser.account_started) {
                const newToken: string | null = await tokenHelper.createJWTToken({ email_id: newEmailID, type: constant_data.OTP_TYPE.SIGN_UP_OTP }, constant_data.OTP_EXPIRE_TIME.toString())
                if (newToken) {
                    getUser.email = newEmailID;
                    getUser.otp = otpNumber;
                    getUser.otp_timer = otpExpireTime;
                    getUser.jwtToken = newToken
                    // getUser.save()
                    await this.UserAuthRepo.updateUser(getUser);

                    const authNotificationProvider = new AuthNotificationProvider();
                    authNotificationProvider._init_();
                    authNotificationProvider.signInOTPSender({
                        otp: otpNumber,
                        email: newEmailID,
                        full_name: getUser.first_name + getUser.last_name
                    })
                    return {
                        status: true,
                        msg: "Email id has been updated",
                        statusCode: 200,
                        data: {
                            token: newToken
                        }
                    }
                } else {
                    return {
                        status: false,
                        msg: "Something went wrong",
                        statusCode: 400,
                    }
                }
            } else {
                return {
                    statusCode: 401,
                    status: false,
                    msg: "The email address you entered does not exist",
                }
            }
        } catch (e) {
            return {
                statusCode: 500,
                status: false,
                msg: "Something went wrong",
            }
        }
    }

    async resendOtpNumer(email_id: string): Promise<HelperFunctionResponse> {

        try {
            const getUser = await this.UserAuthRepo.findUser(null, email_id, null);

            if (getUser) {
                const otpNumber: number = utilHelper.generateAnOTP(6);
                const otpExpireTime: number = constant_data.MINIMUM_OTP_TIMER();
                const newToken: string | null = await tokenHelper.createJWTToken({ email_id: getUser.email, type: constant_data.OTP_TYPE.SIGN_UP_OTP }, constant_data.OTP_EXPIRE_TIME.toString())
                if (newToken) {
                    getUser.otp = otpNumber;
                    getUser.otp_timer = otpExpireTime;
                    getUser.jwtToken = newToken;
                    await this.UserAuthRepo.updateUser(getUser)

                    const authCommunicationProvider = new AuthNotificationProvider();
                    authCommunicationProvider._init_();
                    authCommunicationProvider.signInOTPSender({
                        otp: otpNumber,
                        email: email_id,
                        full_name: getUser.first_name + " " + getUser.last_name
                    })
                    return {
                        statusCode: 200,
                        status: true,
                        data: {
                            token: newToken,
                        },
                        msg: "OTP Has been sent "
                    }
                } else {
                    return {
                        statusCode: 500,
                        status: false,
                        msg: "Something went wrong"
                    }
                }
            } else {
                return {
                    statusCode: 401,
                    status: false,
                    msg: "Unauthorized request"
                }
            }
        } catch (e) {
            return {
                statusCode: 500,
                status: false,
                msg: "Something went wrong"
            }
        }
    }
}

export default UserAuthServices