
import constant_data from "../config/const";
import COMMUNICATION_PROVIDER from "../communication/Provider/notification/notification_service";
import PROFILE_COMMUNICATION_PROVIDER from "../communication/Provider/profile/profile_service";
import userAuth from "../db/models/userAuth";
import tokenHelper from "./tokenHelper";
import userHelper from "./userHelper";
import utilHelper from "./utilHelper";
import { HelperFunctionResponse, UserJwtInterFace } from "../config/Datas/InterFace";
import mongoose from "mongoose";

interface authHelperInterFace {
    AuthOTPValidate(otp: number, email_id: string, token: string): Promise<HelperFunctionResponse>
    userSignInHelper(email: string): Promise<HelperFunctionResponse>
    resendOtpNumer(email_id: string): Promise<HelperFunctionResponse>
    editAuthPhoneNumber(oldEmailId: string, newEmailID: string): Promise<HelperFunctionResponse>
    resetToken(userId: string): Promise<string | null>
    updateUserProfile(data: any, user_id: string): Promise<HelperFunctionResponse>
}


let authHelper: authHelperInterFace = {

    AuthOTPValidate: async (otp: number, email_id: string, token: string): Promise<HelperFunctionResponse> => {
        try {

            const getUser = await userAuth.findOne({ email: email_id }).sort({ id: -1 }).exec();



            if (getUser) {
                if (getUser.jwtToken != token) {
                    return {
                        status: false,
                        msg: "Invalid Token",
                        statusCode: 401
                    }
                } else {

                    const first_name: string = getUser.first_name;
                    const last_name: string = getUser.last_name;
                    const _id: mongoose.Types.ObjectId = getUser._id;
                    const phone_number: number = getUser.phone_number;


                    if (getUser.otp == otp) {
                        const otpExpireTimer: number = getUser.otp_timer;
                        const currentTime: number = new Date().getUTCMilliseconds()
                        if (currentTime > otpExpireTimer) {
                            return {
                                status: false,
                                msg: "OTP TIME Expired",
                                statusCode: 400
                            }
                        } else {

                            const jwtToken: string | null = await tokenHelper.createJWTToken({
                                email: email_id,
                                first_name: first_name,
                                last_name: last_name,
                                phone: phone_number
                            } as UserJwtInterFace, constant_data.USERAUTH_EXPIRE_TIME.toString())

                            if (jwtToken) {
                                getUser.jwtToken = jwtToken;

                                if (!getUser.account_started) {
                                    getUser.account_started = true
                                    //Uncommend if not clean architech
                                    // PROFILE_COMMUNICATION_PROVIDER.authDataTransfer(getUser.first_name, getUser.last_name, getUser.email, getUser.location, getUser.phone_number, getUser.id, getUser.user_id)
                                }

                                await getUser.save();

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
                            } else {
                                return {
                                    status: false,
                                    msg: "Internal server error",
                                    statusCode: 500
                                }
                            }
                        }
                    } else {
                        return {
                            status: false,
                            msg: "Incorrect OTP",
                            statusCode: 401
                        }
                    }
                }
            } else {
                return {
                    status: false,
                    msg: "Email ID not found",
                    statusCode: 401
                }
            }
        } catch (e) {
            return {
                status: false,
                msg: "Something went wront",
                statusCode: 500
            }
        }
    },

    userSignInHelper: async function (email: string): Promise<HelperFunctionResponse> {
        try {
            const userAuth = await userHelper.isUserExist(email)

            if (!userAuth) {
                return {
                    statusCode: 401,
                    status: false,
                    msg: "User not found"
                }
            }

            const otpNumber: number = utilHelper.generateAnOTP(6);
            const otpExpireTime: number = constant_data.MINIMUM_OTP_TIMER();

            const token: string | null = await tokenHelper.createJWTToken({ email_id: userAuth.email, type: constant_data.OTP_TYPE.SIGN_IN_OTP }, constant_data.OTP_EXPIRE_TIME.toString())
            if (token) {
                userAuth.otp = otpNumber;
                userAuth.otp_timer = otpExpireTime;
                userAuth.jwtToken = token;

                await userAuth.save()
                COMMUNICATION_PROVIDER.signInOTPSender({
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

        } catch (e) {
            return {
                statusCode: 500,
                status: false,
                msg: "Something went wrong"
            }
        }
    },


    resendOtpNumer: async function (email_id: string): Promise<HelperFunctionResponse> {

        try {
            const getUser = await userAuth.findOne({ email: email_id });
            if (getUser) {

                const otpNumber: number = utilHelper.generateAnOTP(6);
                const otpExpireTime: number = constant_data.MINIMUM_OTP_TIMER();
                const updateToken = await this.resetToken(getUser.id)

                if (updateToken) {
                    getUser.otp = otpNumber;
                    getUser.otp_timer = otpExpireTime;
                    await getUser.save()
                    //Uncommend if not clean architech

                    // COMMUNICATION_PROVIDER.signInOTPSender({
                    //     otp: otpNumber,
                    //     email: email_id,
                    //     full_name: getUser.first_name + " " + getUser.last_name
                    // })
                    return {
                        statusCode: 200,
                        status: true,
                        data: {
                            token: updateToken,
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
            console.log(e);
            return {
                statusCode: 500,
                status: false,
                msg: "Something went wrong"
            }
        }

    },

    editAuthPhoneNumber: async function (oldEmailId: string, newEmailID: string): Promise<HelperFunctionResponse> {

        console.log("The old email id is : " + oldEmailId);

        const otpNumber: number = utilHelper.generateAnOTP(6);
        const otpExpireTime: number = constant_data.MINIMUM_OTP_TIMER();

        try {
            const getUser = await userAuth.findOne({ email: oldEmailId });
            if (getUser && !getUser.account_started) {
                const newToken: string | null = await tokenHelper.createJWTToken({ email_id: newEmailID, type: constant_data.OTP_TYPE.SIGN_UP_OTP }, constant_data.OTP_EXPIRE_TIME.toString())
                if (newToken) {
                    getUser.email = newEmailID;
                    getUser.otp = otpNumber;
                    getUser.otp_timer = otpExpireTime;
                    getUser.jwtToken = newToken
                    getUser.save()

                    COMMUNICATION_PROVIDER.signInOTPSender({
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
    },

    resetToken: async (userId: string): Promise<string | null> => {

        try {
            const findUser = await userAuth.findById(userId)
            if (findUser) {
                const newToken: string | null = await tokenHelper.createJWTToken({ email_id: findUser.email, type: constant_data.OTP_TYPE.SIGN_UP_OTP }, constant_data.OTP_EXPIRE_TIME.toString())
                if (newToken) {
                    findUser.jwtToken = newToken;
                    await findUser.save()
                    return newToken
                } else {
                    return null;
                }
            } else {
                return null;
            }
        } catch (e) {
            console.log(e);
            return null;
        }
    },


    updateUserProfile: async (data: any, user_id: string): Promise<HelperFunctionResponse> => {
        try {
            const findUser = await userAuth.findById(user_id);
            if (findUser) {

                const mergedData = { ...findUser.toObject(), ...data }

                Object.assign(findUser, mergedData);
                findUser.save();
                return {
                    statusCode: 200,
                    status: true,
                    msg: "User updated success"
                }
            } else {
                return {
                    statusCode: 401,
                    status: false,
                    msg: "Authentication failed"
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

export default authHelper;


