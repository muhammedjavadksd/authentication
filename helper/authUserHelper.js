// const { OTP_TYPE } = require("../../notification/config/const_data");
const COMMUNICATION_PROVIDER = require("../communication/Provider/notification/notification_service");
const PROFILE_COMMUNICATION_PROVIDER = require("../communication/Provider/profile/profile_service");
const constant_data = require("../config/const");
const userAuth = require("../db/models/userAuth");
// const userAuth = require("../db/models/userAuth");
const tokenHelper = require("./tokenHelper");
const userHelper = require("./userHelper");
const utilHelper = require("./utilHelper");


let authHelper = {


    AuthOTPValidate: async (otp, email_id, token) => {
        try {
            let getUser = await userAuth.findOne({ email: email_id }).sort({ id: -1 })
            console.log("The token is : " + token);
            console.log("User token is : " + getUser.jwtToken);
            if (getUser) {
                if (getUser.jwtToken != token) {
                    return {
                        status: false,
                        msg: "Invalid Token"
                    }
                } else {
                    let { first_name, last_name, id, phone_number, email } = getUser;
                    console.log(getUser);
                    console.log(otp, email_id);
                    console.log("The auth is");
                    if (getUser.otp == otp) {
                        let otpExpireTimer = getUser.otp_timer;
                        let currentTime = new Date().getUTCMilliseconds()
                        if (currentTime > otpExpireTimer) {
                            return {
                                status: false,
                                msg: "OTP TIME Expired"
                            }
                        } else {

                            let jwtToken = await tokenHelper.createJWTToken({
                                phone_number, email, first_name, last_name, id
                            }, constant_data.USERAUTH_EXPIRE_TIME)

                            // let jwtToken = await jwt.sign(, process.env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '1d' })

                            getUser.jwtToken = jwtToken;

                            if (!getUser.account_started) {
                                getUser.account_started = true
                            }

                            console.log("Updated user");
                            console.log(getUser);

                            PROFILE_COMMUNICATION_PROVIDER.authDataTransfer(getUser.first_name, getUser.last_name, getUser.email, getUser.location, getUser.phone_number, getUser.id)


                            await getUser.save()

                            return {
                                status: true,
                                msg: "OTP Verified Success",
                                jwt: jwtToken,
                                first_name: getUser.first_name,
                                last_name: getUser.last_name,
                                email: getUser.email,
                                phone: getUser.phone_number,
                            }
                        }
                    } else {
                        return {
                            status: false,
                            msg: "Incorrect OTP"
                        }
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

    userSignInHelper: async function (email) {
        try {

            console.log("Reached here");

            let userAuth = await userHelper.isUserExist(email, null)

            if (!userAuth) {
                return {
                    statusCode: 401,
                    status: false,
                    msg: "User not found"
                }
            }

            let otpNumber = utilHelper.generateAnOTP(6);
            let otpExpireTime = constant_data.MINIMUM_OTP_TIMER;

            let token = await tokenHelper.createJWTToken({ email_id: userAuth.email, type: constant_data.OTP_TYPE.SIGN_IN_OTP }, constant_data.OTP_EXPIRE_TIME)

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
                token
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
                let newToken = await tokenHelper.createJWTToken({ email_id: newEmailID, type: constant_data.OTP_TYPE.SIGN_UP_OTP }, constant_data.OTP_EXPIRE_TIME)
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
                let newToken = await tokenHelper.createJWTToken({ email_id: findUser.email, type: constant_data.OTP_TYPE.SIGN_UP_OTP }, constant_data.OTP_EXPIRE_TIME)
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
    },


    updateUserProfile: async (data, user_id) => {
        console.log("Work here");
        try {

            let findUser = await userAuth.findById(user_id);
            if (findUser) {
                let mergedData = { ...findUser.toObject(), ...data }

                console.log("New data is");
                console.log(mergedData);

                Object.assign(findUser, mergedData);
                findUser.save();
                return {
                    status: true,
                    msg: "User updated success"
                }
            } else {
                return {
                    status: false,
                    msg: "Authentication failed"
                }
            }
        } catch (e) {
            console.log(e);
            return {
                status: false,
                msg: "Something went wrong"
            }
        }
    }
}

module.exports = authHelper;