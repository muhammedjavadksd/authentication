const userAuthModel = require("../db/models/userAuth");
const COMMUNICATION_PROVIDER = require("../communication/notification/notification_service");
const utilHelper = require("./utilHelper")
let jwt = require("jsonwebtoken");
const constant_data = require("../config/const");
const tokenHelper = require("./tokenHelper");
// const { OTP_TYPE } = require("../../notification/config/const_data");

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

            console.log("The user is : ");
            console.log(user);



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
            let userid = await userHelper.generateUserID(first_name)

            console.log("The user id : " + userid);

            if (userid) {

                let jwtToken = await tokenHelper.createJWTToken({ email_id: email, type: constant_data.OTP_TYPE.SIGN_UP_OTP }, constant_data.OTP_EXPIRE_TIME)

                userAuthModel.updateOne({
                    email
                }, {
                    first_name,
                    last_name,
                    phone_number,
                    email,
                    auth_id,
                    auth_provider,
                    otp_timer: expireTime,
                    otp: otpNumber,
                    location,
                    jwtToken: jwtToken,
                    user_id: userid
                }, {
                    upsert: true
                }).then((data) => {
                    resolve({ token: jwtToken })

                    let communicationData = {
                        otp: otpNumber,
                        recipientName: first_name + last_name,
                        recipientEmail: email
                    }

                    COMMUNICATION_PROVIDER.signUpOTPSender(communicationData)

                }).catch((err) => {
                    reject(err)
                })
            } else {
                reject("Something went wrong")
            }
        })
    },

    _checkUserIDValidity: async (user_id) => {
        console.log("Demy userid : " + user_id);
        try {
            let user = await userAuthModel.findOne({ user_id });
            if (!user) {
                return false
            } else {
                return true
            }
        } catch (e) {
            console.log(e);
            return false;
        }
    },

    generateUserID: async function (first_name) {
        try {

            let randomText = utilHelper.createRandomText(4);
            let count = 0;
            let userId;;
            let isUserIDValid;

            do {
                userId = first_name + "@" + randomText + count
                isUserIDValid = await this._checkUserIDValidity(userId)
            }
            while (isUserIDValid) {
                count++;
            }

            console.log("The user id is : " + userId);
            return userId;


        } catch (e) {
            console.log(e);
            return false;
        }
    }




}


module.exports = userHelper;