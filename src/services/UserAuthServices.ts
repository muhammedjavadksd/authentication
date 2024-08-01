import mongoose from "mongoose";
import AuthNotificationProvider from "../communication/Provider/notification/notification_service";
import { HelperFunctionResponse, UserJwtInterFace } from "../config/Datas/InterFace";
import IUserModelDocument from "../config/Interface/IModel/IUserAuthModel";
import constant_data from "../config/const";
import tokenHelper from "../helper/tokenHelper";
import utilHelper from "../helper/utilHelper";
import UserAuthenticationRepo from "../repositories/UserAuthentication";
import ProfileCommunicationProvider from "../communication/Provider/profile/profile_service";
import TokenHelper from "../helper/tokenHelper";
import { IUserAuthService } from "../config/Interface/Service/ServiceInterface";
// import { } from 'expres'


class UserAuthServices implements IUserAuthService {

    private UserAuthRepo;
    private TokenHelpers;

    constructor() {

        this.signInHelper = this.signInHelper.bind(this)
        this.authOTPValidate = this.authOTPValidate.bind(this)
        this.editAuthEmailID = this.editAuthEmailID.bind(this)
        this.resendOtpNumer = this.resendOtpNumer.bind(this)
        this._checkUserIDValidity = this._checkUserIDValidity.bind(this)
        this.generateUserID = this.generateUserID.bind(this)

        this.UserAuthRepo = new UserAuthenticationRepo()
        this.TokenHelpers = new TokenHelper();
    }

    async signInHelper(email: string): Promise<HelperFunctionResponse> {
        try {
            const userAuth: IUserModelDocument | false = await this.UserAuthRepo.findUser(null, email, null);
            if (userAuth) {

                if (!userAuth.account_started) {
                    return {
                        statusCode: 400,
                        status: false,
                        msg: "Email id not found",
                    }
                }

                const otpNumber: number = utilHelper.generateAnOTP(6);
                const otpExpireTime: number = constant_data.MINIMUM_OTP_TIMER();

                const token: string | null = await this.TokenHelpers.generateJWtToken({ email: userAuth['email'], type: constant_data.OTP_TYPE.SIGN_IN_OTP }, constant_data.OTP_EXPIRE_TIME.toString())
                if (token) {
                    userAuth.otp = otpNumber;
                    userAuth.otp_timer = otpExpireTime;
                    userAuth.jwtToken = token;

                    await this.UserAuthRepo.updateUser(userAuth);

                    // await userAuth.save()
                    const userAuthProvider = new AuthNotificationProvider(process.env.USER_SIGN_IN_NOTIFICATION as string);
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
            console.log(e);
            return {
                statusCode: 500,
                status: false,
                msg: "Something went wrong"
            }
        }
    }

    async authOTPValidate(otp: number, email_id: string, token: string): Promise<HelperFunctionResponse> {
        try {
            const getUser: IUserModelDocument | false = await this.UserAuthRepo.findUser(null, email_id, null);

            if (!getUser) {
                return {
                    status: false,
                    msg: "Email ID not found",
                    statusCode: 401
                }
            }

            console.log("Get user");

            console.log(getUser);

            const userJwtToken: string = getUser.jwtToken;
            if (userJwtToken != token) {
                return {
                    status: false,
                    msg: "Invalid Token",
                    statusCode: 401
                }
            }

            console.log("This also passed");

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

            const jwtToken: string | null = await this.TokenHelpers.generateJWtToken({ email: email_id, first_name: first_name, last_name: last_name, phone: phone_number, profile_id: getUser.user_id, user_id: getUser.id, } as UserJwtInterFace, constant_data.USERAUTH_EXPIRE_TIME.toString())
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
                console.log("Profile data transfer");

                profileCommunicationProvider.authDataTransfer({
                    email: getUser.email,
                    first_name: getUser.first_name,
                    last_name: getUser.last_name,
                    phone_number: getUser.phone_number,
                    location: getUser.location,
                    user_id: getUser.id,
                    profile_id: getUser.user_id
                })
            }

            // await getUser.save();
            await this.UserAuthRepo.updateUser(getUser)

            const userJwtData: UserJwtInterFace = {
                jwt: jwtToken,
                first_name: getUser.first_name,
                last_name: getUser.last_name,
                email: getUser.email,
                phone: getUser.phone_number,
                user_id: getUser.id,
                profile_id: getUser.user_id
            }

            return {
                status: true,
                msg: "OTP Verified Success",
                data: userJwtData,
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

        console.log("Entered here");
        const otpNumber: number = utilHelper.generateAnOTP(6);
        const otpExpireTime: number = constant_data.MINIMUM_OTP_TIMER();



        try {
            const getUser: IUserModelDocument | false = await this.UserAuthRepo.findUser(null, oldEmailId, null);



            if (getUser) {
                const newToken: string | null = await this.TokenHelpers.generateJWtToken({ email_id: newEmailID, type: constant_data.OTP_TYPE.SIGN_UP_OTP }, constant_data.OTP_EXPIRE_TIME.toString())
                if (newToken) {
                    getUser.email = newEmailID;
                    getUser.otp = otpNumber;
                    getUser.otp_timer = otpExpireTime;
                    getUser.jwtToken = newToken
                    // getUser.save()
                    await this.UserAuthRepo.updateUser(getUser);

                    const authNotificationProvider = new AuthNotificationProvider(process.env.USER_SIGN_IN_NOTIFICATION as string);
                    await authNotificationProvider._init_();
                    authNotificationProvider.signInOTPSender({
                        otp: otpNumber,
                        email: newEmailID,
                        full_name: getUser.first_name + getUser.last_name
                    })
                    console.log("Edit here");

                    console.log({
                        otp: otpNumber,
                        email: newEmailID,
                        full_name: getUser.first_name + getUser.last_name
                    });

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
            console.log(e);
            return {
                statusCode: 500,
                status: false,
                msg: "Something went wrong",
            }
        }
    }

    async resendOtpNumer(email_id: string): Promise<HelperFunctionResponse> {

        try {
            const getUser: IUserModelDocument | false = await this.UserAuthRepo.findUser(null, email_id, null);

            if (getUser) {
                const otpNumber: number = utilHelper.generateAnOTP(6);
                const otpExpireTime: number = constant_data.MINIMUM_OTP_TIMER();
                const newToken: string | null = await this.TokenHelpers.generateJWtToken({ email_id: getUser.email, type: constant_data.OTP_TYPE.SIGN_UP_OTP }, constant_data.OTP_EXPIRE_TIME.toString())
                if (newToken) {
                    getUser.otp = otpNumber;
                    getUser.otp_timer = otpExpireTime;
                    getUser.jwtToken = newToken;
                    await this.UserAuthRepo.updateUser(getUser)

                    const authCommunicationProvider = new AuthNotificationProvider(process.env.USER_SIGN_IN_NOTIFICATION as string);
                    await authCommunicationProvider._init_();

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


    private async _checkUserIDValidity(user_id: string): Promise<boolean> {
        try {
            const user: IUserModelDocument | null = await this.UserAuthRepo.findByUserId(user_id);
            if (!user) {
                return false
            } else {
                return true
            }
        } catch (e) {
            return false;
        }
    }

    async generateUserID(first_name: string): Promise<string | false> {
        try {
            const randomText: string = utilHelper.createRandomText(4);
            let count: number = 0;
            let userId: string;
            let isUserIDValid: boolean;

            do {
                userId = first_name + "@" + randomText + count
                isUserIDValid = await this._checkUserIDValidity(userId)
                count++;
            } while (isUserIDValid);
            return userId;
        } catch (e) {
            console.log(e);
            return false;
        }
    }


}

export default UserAuthServices