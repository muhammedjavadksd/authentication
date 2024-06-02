const PROFILE_COMMUNICATION_PROVIDER = require("../../communication/Provider/profile/profile_service");
const { AUTH_PROVIDERS, AUTH_PROVIDERS_DATA } = require("../../config/const");
const { signUpUserValidation } = require("../../config/validation/validation");
const authHelper = require("../../helper/authUserHelper");
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
        let email = req.body.email

        console.log("Checking email id is  a : " + email);

        try {
            let userSign = await authHelper.userSignInHelper(email);


            if (userSign.status) {
                res.status(userSign.statusCode).json({
                    "status": true,
                    "msg": "OTP has been sent",
                    "token": userSign.token
                })
            } else {
                res.status(userSign.statusCode).json({
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
        let token = req.context.token;
        console.log("Requets OTP is");
        console.log(otp);
        console.log("Requested email is ");
        console.log(email_id);
        if (email_id) {
            try {
                let otpVerification = await authHelper.AuthOTPValidate(otp, email_id, token);
                console.log(otpVerification);
                console.log("The token is :");
                console.log(otpVerification.jwt);
                if (otpVerification.status) {
                    console.log("OTP Verified");
                    res.status(200).json({
                        status: true,
                        msg: "OTP Verification sucess",
                        jwt: otpVerification.jwt,
                        first_name: otpVerification.first_name,
                        last_name: otpVerification.last_name,
                        email: otpVerification.email,
                        phone: otpVerification.phone
                    })
                } else {
                    res.status(401).json({
                        status: false,
                        msg: otpVerification.msg
                    })
                }
            } catch (e) {
                res.status(500).json({
                    status: false,
                    msg: "Something went wrong"
                })
            }
        } else {
            res.status(401).json({
                status: false,
                msg: "Unauthorized access"
            })
        }
    },

    editAuthPhoneNumber: async (req, res) => {

        let newEmailID = req.body.email_id;
        let oldEmailId = req.context.email_id;

        try {
            let editRequest = await authHelper.editAuthPhoneNumber(oldEmailId, newEmailID)
            res.status(editRequest.status).json({
                status: editRequest.status,
                token: editRequest.token,
                msg: editRequest.msg
            })
        } catch (e) {
            console.log(e);
            res.status(500).json({
                status: false,
                msg: "Something went wrong"
            })
        }
    },

    resetOtpNumber: async (req, res) => {

        let tokenEmail = req.context.email_id;

        try {
            let result = await authHelper.resendOtpNumer(tokenEmail);
            return res.status(result.statusCode).json({ msg: result.msg, status: result.status, token: result.token });
        } catch (e) {
            res.status(500).json({
                status: true,
                msg: "Unauthorized request"
            })
        }
    }




}

module.exports = authController