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




}


module.exports = userHelper;