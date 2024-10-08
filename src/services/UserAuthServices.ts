import AuthNotificationProvider from "../communication/Provider/notification/notification_service";
import constant_data from "../config/const";
import utilHelper from "../helper/utilHelper";
import UserAuthenticationRepo from "../repositories/UserAuthentication";
import ProfileCommunicationProvider from "../communication/Provider/profile/profile_service";
import TokenHelper from "../helper/tokenHelper";
import axios from "axios";
import { JwtTimer, StatusCode } from "../config/Datas/Enums";
import { IUserAuthService } from "../config/Datas/Interface/MethodInterface";
import { HelperFunctionResponse, IBaseUser, ITokenResponse, IUserJwt, RefershTokenResponse, UserJwtInterFace } from "../config/Datas/Interface/UtilInterface";
import { IUserModelDocument } from "../config/Datas/Interface/DatabaseModel";


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
        this.refreshToken = this.refreshToken.bind(this)

        this.UserAuthRepo = new UserAuthenticationRepo()
        this.TokenHelpers = new TokenHelper();
    }


    async refreshToken(token: string): Promise<RefershTokenResponse> {
        const tokenVerify = await this.TokenHelpers.checkTokenValidity(token);
        if (tokenVerify && typeof tokenVerify == "object") {
            const checkRefreshToken = tokenVerify.exp;
            const newAccessToken = await this.TokenHelpers.generateJWtToken(tokenVerify, JwtTimer.AccessTokenExpiresInMinutes);

            if (newAccessToken) {
                const responseData: ITokenResponse = {
                    access_token: newAccessToken,
                    refresh_token: undefined
                }

                if (checkRefreshToken) {
                    const currentTime = Date.now();
                    const maxAge = 1000 * 60 * 60;
                    const diff = checkRefreshToken - currentTime;

                    if (diff < maxAge) {
                        const newRefreshToken = await this.TokenHelpers.generateJWtToken(tokenVerify, JwtTimer.RefreshTokenExpiresInDays);
                        if (newRefreshToken) {
                            responseData.refresh_token = newRefreshToken;
                        }
                    }
                }

                return {
                    msg: "New access token created",
                    status: true,
                    statusCode: StatusCode.OK,
                    data: responseData
                }
            } else {
                return {
                    msg: "Something went wrong",
                    status: false,
                    statusCode: StatusCode.SERVER_ERROR,
                }
            }
        } else {
            return {
                msg: "Un authraized access",
                status: false,
                statusCode: StatusCode.UNAUTHORIZED,
            }
        }
    }

    async accountCompleteHelper(token: string, phone: number): Promise<HelperFunctionResponse> {
        const endPoint = `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`
        const { data } = await axios.get(endPoint);
        if (!data.error && data.email) {
            const email = data.email
            const findUser = await this.UserAuthRepo.findUser(null, email, null);
            if (findUser && !findUser.account_started) {
                const updateData = {
                    phone_number: phone,
                    account_started: true
                }
                const updateUser = await this.UserAuthRepo.updateUserById(findUser.id, updateData);
                if (updateUser) {
                    return {
                        status: true,
                        msg: "Account completion done",
                        statusCode: StatusCode.OK
                    }
                } else {
                    return {
                        status: false,
                        msg: "Account completion failed",
                        statusCode: StatusCode.BAD_REQUEST
                    }
                }
            } else {
                return {
                    status: false,
                    msg: "Account already verified",
                    statusCode: StatusCode.BAD_REQUEST
                }
            }
        } else {
            return {
                status: false,
                msg: "Account not found",
                statusCode: StatusCode.UNAUTHORIZED
            }
        }
    }


    async signUpProvideHelper(token: string, auth_id: string): Promise<HelperFunctionResponse> {
        const endPoint = `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`
        const { data } = await axios.get(endPoint);
        if (!data.error && data.email) {
            const emailId = data.email;
            const fullName = data.name.split(" ");
            const firstName = fullName[0]
            const lastName = fullName[1] ?? "";

            const findUser = await this.UserAuthRepo.findUser(null, emailId, null);
            if (findUser && findUser.account_started) {

                const jwtToken: string | null = await this.TokenHelpers.generateJWtToken({ email: emailId, first_name: findUser.first_name, last_name: findUser.last_name, phone: findUser.phone_number, profile_id: findUser.user_id, user_id: findUser.id, } as UserJwtInterFace, JwtTimer.AccessTokenExpiresInMinutes)

                if (findUser.phone_number && jwtToken) {
                    const userJwtData: UserJwtInterFace = {
                        jwt: jwtToken,
                        first_name: findUser.first_name,
                        last_name: findUser.last_name,
                        email: findUser.email,
                        phone: findUser.phone_number,
                        user_id: findUser.id,
                        profile_id: findUser.user_id,
                        blood_token: findUser?.blood_token
                    }

                    return {
                        status: true,
                        msg: "OTP Verified Success",
                        data: userJwtData,
                        statusCode: 200
                    }
                } else {
                    return {
                        status: false,
                        msg: "Account need to be verified",
                        statusCode: StatusCode.FORBIDDEN
                    }
                }
            } else {
                const userDetails: IBaseUser = {
                    auth_id: auth_id,
                    auth_provider: "google",
                    email: emailId,
                    first_name: firstName,
                    last_name: lastName,
                }
                const insertNewUser = await this.UserAuthRepo.insertUserWithAuth(userDetails, token);
                if (insertNewUser) {
                    return {
                        msg: "User created success",
                        status: true,
                        statusCode: StatusCode.CREATED
                    }
                } else {
                    return {
                        msg: "Internal server error",
                        status: false,
                        statusCode: StatusCode.SERVER_ERROR
                    }
                }
            }
        } else {
            return {
                msg: "Invalid sign up attempt",
                status: false,
                statusCode: StatusCode.BAD_REQUEST
            }
        }

    }



    async signInHelper(email: string): Promise<HelperFunctionResponse> {
        try {
            const userAuth: IUserModelDocument | false = await this.UserAuthRepo.findUser(null, email, null);
            if (userAuth) {

                if (!userAuth.account_started) {
                    return {
                        statusCode: StatusCode.NOT_FOUND,
                        status: false,
                        msg: "Email id not found",
                    }
                }

                const otpNumber: number = utilHelper.generateAnOTP(6);
                const otpExpireTime: number = constant_data.MINIMUM_OTP_TIMER();

                const token: string | null = await this.TokenHelpers.generateJWtToken({ email: userAuth['email'], type: constant_data.OTP_TYPE.SIGN_IN_OTP }, JwtTimer.AccessTokenExpiresInMinutes)
                if (token) {
                    userAuth.otp = otpNumber;
                    userAuth.otp_timer = otpExpireTime;
                    userAuth.jwtToken = token;

                    await this.UserAuthRepo.updateUser(userAuth);

                    const userAuthProvider = new AuthNotificationProvider(process.env.USER_SIGN_IN_NOTIFICATION as string);
                    await userAuthProvider._init_();
                    userAuthProvider.signInOTPSender({
                        otp: otpNumber,
                        email: userAuth.email,
                        full_name: userAuth.first_name + userAuth.last_name
                    })
                    return {
                        statusCode: StatusCode.OK,
                        status: true,
                        msg: "OTP Has been sent ",
                        data: {
                            token
                        }
                    }
                } else {
                    return {
                        statusCode: StatusCode.UNAUTHORIZED,
                        status: false,
                        msg: "Provide valid token"
                    }
                }
            } else {
                return {
                    statusCode: StatusCode.NOT_FOUND,
                    status: false,
                    msg: "User not found"
                }
            }
        } catch (e) {
            console.log(e);
            return {
                statusCode: StatusCode.SERVER_ERROR,
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
                    statusCode: StatusCode.NOT_FOUND
                }
            }

            const userJwtToken: string = getUser.jwtToken;
            if (userJwtToken != token) {
                return {
                    status: false,
                    msg: "Invalid Token",
                    statusCode: StatusCode.UNAUTHORIZED
                }
            }

            const otpExpireTimer: number = getUser.otp_timer;
            const validateOtp = utilHelper.OTPValidator(otp, getUser.otp, otpExpireTimer);


            if (!validateOtp.status) {
                return {
                    status: false,
                    msg: validateOtp.msg ?? "Incorrect OTP or OTP has been expired",
                    statusCode: StatusCode.BAD_REQUEST
                }
            }

            const first_name: string = getUser.first_name;
            const last_name: string = getUser.last_name;
            const phone_number: number | undefined = getUser.phone_number;


            const userAuth: IUserJwt = {
                email: email_id,
                first_name: first_name,
                last_name: last_name,
                phone: phone_number,
                profile_id: getUser.user_id,
                user_id: getUser.id,
            }

            const refreshToken: string | null = await this.TokenHelpers.generateJWtToken(userAuth, JwtTimer.AccessTokenExpiresInMinutes)
            const jwtToken: string | null = await this.TokenHelpers.generateJWtToken(userAuth, JwtTimer.RefreshTokenExpiresInDays)
            if (!jwtToken || !refreshToken) {
                return {
                    status: false,
                    msg: "Internal server error",
                    statusCode: StatusCode.SERVER_ERROR
                }
            }

            getUser.jwtToken = jwtToken;


            if (getUser.phone_number) {
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
                    profile_id: getUser.user_id,
                    blood_token: getUser?.blood_token,
                    refresh_token: refreshToken
                }

                return {
                    status: true,
                    msg: "OTP Verified Success",
                    data: userJwtData,
                    statusCode: StatusCode.OK
                }
            } else {
                return {
                    status: false,
                    msg: "Account need verification",
                    statusCode: StatusCode.FORBIDDEN
                }
            }

        } catch (e) {
            return {
                status: false,
                msg: "Something went wront",
                statusCode: StatusCode.UNAUTHORIZED
            }
        }
    }

    async editAuthEmailID(oldEmailId: string, newEmailID: string): Promise<HelperFunctionResponse> {

        const otpNumber: number = utilHelper.generateAnOTP(6);
        const otpExpireTime: number = constant_data.MINIMUM_OTP_TIMER();


        try {



            const checkExist: IUserModelDocument | false = await this.UserAuthRepo.findUser(null, newEmailID, null);
            if (!checkExist) {

                const getUser: IUserModelDocument | false = await this.UserAuthRepo.findUser(null, oldEmailId, null);
                if (getUser) {
                    const newToken: string | null = await this.TokenHelpers.generateJWtToken({ email: newEmailID, type: constant_data.OTP_TYPE.SIGN_UP_OTP }, JwtTimer.OtpTimer)
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
                        return {
                            status: true,
                            msg: "Email id has been updated",
                            statusCode: StatusCode.OK,
                            data: {
                                token: newToken
                            }
                        }
                    } else {
                        return {
                            status: false,
                            msg: "Something went wrong",
                            statusCode: StatusCode.BAD_REQUEST,
                        }
                    }
                } else {
                    return {
                        statusCode: StatusCode.NOT_FOUND,
                        status: false,
                        msg: "The email address you entered does not exist",
                    }
                }
            } else {
                return {
                    status: false,
                    msg: "The email address already exist",
                    statusCode: StatusCode.CONFLICT
                }
            }
        } catch (e) {
            console.log(e);
            return {
                statusCode: StatusCode.SERVER_ERROR,
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
                const newToken: string | null = await this.TokenHelpers.generateJWtToken({ email: getUser.email, type: constant_data.OTP_TYPE.SIGN_UP_OTP }, JwtTimer.OtpTimer)
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
                        statusCode: StatusCode.OK,
                        status: true,
                        data: {
                            token: newToken,
                        },
                        msg: "OTP Has been sent "
                    }
                } else {
                    return {
                        statusCode: StatusCode.SERVER_ERROR,
                        status: false,
                        msg: "Something went wrong"
                    }
                }
            } else {
                return {
                    statusCode: StatusCode.UNAUTHORIZED,
                    status: false,
                    msg: "Unauthorized request"
                }
            }
        } catch (e) {
            return {
                statusCode: StatusCode.SERVER_ERROR,
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
                userId = first_name + "_" + randomText + count
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