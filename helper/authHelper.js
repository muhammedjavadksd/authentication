const { OTP_TYPE } = require("../../notification/config/const_data");
const COMMUNICATION_PROVIDER = require("../communication/notification/notification_service");
const constant_data = require("../config/const");
const userAuth = require("../db/models/userAuth");
const tokenHelper = require("./tokenHelper");
const utilHelper = require("./utilHelper");


let authHelper = {


    signUpOTPValidate: async (otp, email_id) => {
        try {
            let userAuth = await userAuthModel.findOne({ email: email_id }).sort({ id: -1 })
            if (userAuth) {
                let { full_name, phone_number, email } = userAuth;
                console.log(userAuth);
                console.log(otp, email_id);
                console.log("The auth is");
                if (userAuth.otp == otp) {
                    let otpExpireTimer = userAuth.otp_timer;
                    let currentTime = new Date().getUTCMilliseconds()
                    if (currentTime > otpExpireTimer) {
                        return {
                            status: false,
                            msg: "OTP TIME Expired"
                        }
                    } else {


                        let jwtToken = await jwt.sign({
                            full_name, phone_number, email
                        }, process.env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '1d' })

                        userAuth.jwtToken = jwtToken;

                        if (!userAuth.account_started) {
                            userAuth.account_started = true
                        }

                        console.log("Updated user");
                        console.log(userAuth);

                        await userAuth.save()

                        return {
                            status: true,
                            msg: "OTP Verified Success",
                            jwt: jwtToken
                        }
                    }
                } else {
                    return {
                        status: false,
                        msg: "Incorrect OTP"
                    }
                }
            } else {
                return {
                    status: false,
                    msg: "Email ID not found"
                }
            }
        } catch (e) {
            console.log(e)
            return {
                status: false,
                msg: "Something went wront"
            }
        }
    },

    userSignInHelper: async function (phone) {
        try {

            let userAuth = await userHelper.isUserExist(null, phone)

            if (!userAuth) {
                return {
                    statusCode: 401,
                    status: false,
                    msg: "User not found"
                }
            }

            if (!userAuth.account_started) {
                return {
                    statusCode: 401,
                    status: false,
                    msg: "User not found"
                }
            } else {
                let otpNumber = utilHelper.generateAnOTP(6);
                let otpExpireTime = constant_data.MINIMUM_OTP_TIMER;

                userAuth.otp = otpNumber;
                userAuth.otp_timer = otpExpireTime;
                await userAuth.save()
                COMMUNICATION_PROVIDER.signInOTPSender({
                    otp: otpNumber,
                    email: userAuth.email,
                    full_name: userAuth.first_name + userAuth.last_name
                })
                return {
                    statusCode: 200,
                    status: true,
                    msg: "OTP Has been sent "
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

    // editAuthPhoneNumber: async (newNumber, oldNumber) => {
    //     try {

    //         let fetchUser = await userAuth.findOne({ email: oldNumber });
    //         if (fetchUser) {
    //             if (!fetchUser.account_started) {

    //             }
    //         }
    //     } catch (e) {

    //     }
    // }

    resendOtpNumer: async function (email_id) {

        try {
            let getUser = await userAuth.findOne({ email: email_id });
            if (getUser) {
                let otpNumber = utilHelper.generateAnOTP(6);
                let otpExpireTime = constant_data.MINIMUM_OTP_TIMER;

                console.log("User ID : " + getUser.id);
                let updateToken = await this.resetToken(getUser.id)
                console.log("D : " + updateToken);
                if (updateToken) {
                    getUser.otp = otpNumber;
                    getUser.otp_timer = otpExpireTime;
                    await getUser.save()
                    COMMUNICATION_PROVIDER.signInOTPSender({
                        otp: otpNumber,
                        email: email_id,
                        full_name: getUser.first_name + " " + getUser.last_name
                    })
                    return {
                        statusCode: 200,
                        status: true,
                        token: updateToken,
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

    editAuthPhoneNumber: async function (oldEmailId, newEmailID) {

        console.log("The old email id is : " + oldEmailId);

        let otpNumber = utilHelper.generateAnOTP(6);
        let otpExpireTime = constant_data.MINIMUM_OTP_TIMER;

        try {
            let getUser = await userAuth.findOne({ email: oldEmailId });
            if (getUser && !getUser.account_started) {
                let newToken = await tokenHelper.createJWTToken({ email_id: newEmailID, type: OTP_TYPE.SIGN_UP_OTP })
                getUser.email = newEmailID;
                getUser.otp = otpNumber;
                getUser.otp_timer = otpExpireTime;
                getUser.jwtToken = newToken
                getUser.save()


                console.log("OTP will send to new email id" + newEmailID);

                COMMUNICATION_PROVIDER.signInOTPSender({
                    otp: otpNumber,
                    email: newEmailID,
                    full_name: getUser.first_name + getUser.last_name
                })


                return {
                    status: 200,
                    msg: "Email id has been updated",
                    token: newToken
                }
            } else {
                return {
                    status: 401,
                    msg: "The email address you entered does not exist",
                }
            }

        } catch (e) {
            console.log(e);
            return {
                status: 500,
                msg: "Something went wrong",
            }
        }
    },

    resetToken: async (userId) => {

        try {
            let findUser = await userAuth.findById(userId)
            if (findUser) {
                let newToken = await tokenHelper.createJWTToken({ email_id: findUser.email, type: OTP_TYPE.SIGN_UP_OTP })
                findUser.jwtToken = newToken;
                await findUser.save()
                return newToken
            } else {
                console.log("Do not found the user");
                return null;
            }
        } catch (e) {
            console.log(e);
            return null;
        }
    }
}

module.exports = authHelper;