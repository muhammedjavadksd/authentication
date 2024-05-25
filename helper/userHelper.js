const userAuthModel = require("../db/models/userAuth");
const COMMUNICATION_PROVIDER = require("../communication/notification/notification_service");
const utilHelper = require("./utilHelper")
let jwt = require("jsonwebtoken");
const constant_data = require("../config/const");

let userHelper = {


    isUserExist: async function (email_id, phone_number) {
        console.log("Checking data");
        console.log(email_id, phone_number);
        try {
            let user = await userAuthModel.findOne({
                $or: [
                    { email: email_id },
                    { phone_number: phone_number }
                ]
            });


            console.log("The user", user)

            if (user) {
                if (user.account_started == true) return user;
                else return false;
            } else {
                return false;
            }


        } catch (e) {
            console.log(e);
            return null;
        }
    },

    insertNewUser: function (first_name, last_name, phone_number, email, auth_id, auth_provider, location) {


        return new Promise(async (resolve, reject) => {
            let otpNumber = utilHelper.generateAnOTP(6);
            let expireTime = constant_data.MINIMUM_OTP_TIMER;

            console.log(location);

            new userAuthModel({
                first_name, last_name, phone_number, email, auth_id, auth_provider, otp_timer: expireTime, otp: otpNumber, location
            }).save().then((data) => {
                resolve()

                let communicationData = {
                    otp: otpNumber,
                    recipientName: first_name + last_name,
                    recipientEmail: email
                }

                COMMUNICATION_PROVIDER.signUpOTPSender(communicationData)

            }).catch((err) => {
                reject(err)
            })
        })
    },

    signUpOTPValidate: async (otp, email_id) => {
        try {
            let userAuth = await userAuthModel.findOne({ email: email_id });
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
                    status: false,
                    msg: "User not found"
                }
            }

            if (!userAuth.account_started) {
                return {
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
                    full_name: userAuth.full_name
                })
                return {
                    status: true,
                    msg: "OTP Has been sent "
                }
            }
        } catch (e) {
            return {
                status: false,
                msg: "Something went wrong"
            }
        }
    }
}


module.exports = userHelper;