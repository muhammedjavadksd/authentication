const userAuth = require("../db/models/userAuth");


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
                    full_name: userAuth.full_name
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

    //         let fetchUser = await userAuth.findOne({ phone_number: oldNumber });
    //         if (fetchUser) {
    //             if (!fetchUser.account_started) {

    //             }
    //         }
    //     } catch (e) {

    //     }
    // }
}

module.exports = authHelper;