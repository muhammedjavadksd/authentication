const { AUTH_PROVIDERS, AUTH_PROVIDERS_DATA } = require("../../config/const");
const { signUpUserValidation } = require("../../config/validation/validation");
const userHelper = require("../../helper/userHelper");


let authController = {

    signUpController: async (req, res) => {



        try {
            // let { phone_number, email_address, auth_id, auth_provider, first_name, last_name } = req.body;

            let { phone_number, email_address, first_name, last_name, location, blood_group } = req.body;
            let auth_id = null;
            let auth_provider = AUTH_PROVIDERS_DATA.CREDENTIAL

            let { validationError, data } = signUpUserValidation.validate({ phone_number, email_address, auth_id, blood_group, auth_provider, first_name, last_name, location })

            if (validationError) {
                res.status(500).json({
                    "status": false,
                    "msg": error.details[0].message
                })
            } else {

                let isUserExist = await userHelper.isUserExist(email_address, phone_number)
                console.log("User exist : " + isUserExist);
                if (isUserExist) {
                    res.status(401).json({
                        "status": false,
                        "msg": "Email/Phone already exist",
                    })
                } else {
                    userHelper.insertNewUser(first_name, last_name, phone_number, email_address, auth_id, auth_provider, location).then((jwtData) => {
                        console.log("The token is :");
                        console.log(jwtData.token);
                        let successResponse = {
                            "status": true,
                            "msg": "Account created success",
                            "token": jwtData.token
                        }
                        console.log("The response is : ");
                        console.log(successResponse);
                        res.status(200).json(successResponse)
                    }).catch((err) => {
                        console.log(err)
                        res.status(500).json({
                            "status": false,
                            "msg": "Something went wrong"
                        })
                    })
                }
            }
        } catch (e) {
            console.log(e);
            res.status(500).json({
                "status": false,
                "msg": "Internal Server Error"
            })
        }

    },

    signInController: async (req, res, next) => {
        let phone = req.body.phone

        try {
            let userSign = await userHelper.userSignInHelper(phone);


            if (userSign.status) {
                res.status(200).json({
                    "status": true,
                    "msg": "OTP has been sent"
                })
            } else {
                res.status(500).json({
                    "status": false,
                    "msg": userSign.msg
                })
            }
        } catch (e) {
            res.status(500).json({
                "status": false,
                "msg": "Something went wrong"
            })
        }
    },

    AuthOTPSubmission: async (req, res, next) => {

        let otp = req.body.otp_number;
        // let email_id = req.body.email_id;

        console.log("The context is");
        console.log(req.context);
        let email_id = req.context?.email_id;
        if (email_id) {
            try {
                let otpVerification = await userHelper.signUpOTPValidate(otp, email_id);
                console.log(otpVerification);
                if (otpVerification.status) {
                    console.log("OTP Verified");
                    res.status(200).json({
                        status: true,
                        msg: "OTP Verification sucess",
                        jwt: otpVerification.jwt

                    })
                } else {
                    res.status(401).json({
                        status: false,
                        msg: otpVerification.msg
                    })
                }
            } catch (e) {
                res.status(500).json({
                    status: true,
                    msg: "Something went wrong"
                })
            }
        } else {
            res.status(401).json({
                status: true,
                msg: "Unauthorized access"
            })
        }
    },

    editAuthPhoneNumber: (req, res) => {

        let newPhoneNumber = req.body.phone_number;
        let oldNumber = req.body.old_number;

        // try {

        // }
    }

}

module.exports = authController