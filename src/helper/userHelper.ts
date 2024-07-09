import { Model, Document } from 'mongoose';
import jwt from 'jsonwebtoken';
// import { COMMUNICATION_PROVIDER } from '../communication/Provider/notification/notification_service';
import COMMUNICATION_PROVIDER from '../communication/Provider/notification/notification_service';
// import { constant_data } from '../config/const';
import constant_data from '../config/const';
import tokenHelper from './tokenHelper';
import utilHelper from './utilHelper';

interface UserAuth extends Document {
    email: string;
    phone_number: string;
    account_started: boolean;
    first_name: string;
    last_name: string;
    auth_id: string;
    auth_provider: string;
    otp_timer: number;
    otp: number;
    location: string;
    jwtToken: string;
    user_id: string;
}

const userAuthModel: Model<UserAuth> = require("../db/models/userAuth");

interface UserHelper {
    isUserExist(email_id?: string, phone_number?: string): Promise<UserAuth | false | null>;
    insertNewUser(first_name: string, last_name: string, phone_number: string, email: string, auth_id?: string | null, auth_provider?: string, location?: string): Promise<{ token: string }>;
    _checkUserIDValidity(user_id: string): Promise<boolean>;
    generateUserID(first_name: string): Promise<string | false>;
}

const userHelper: UserHelper = {
    isUserExist: async function (email_id: string, phone_number: string): Promise<UserAuth | false | null> {
        if ((email_id == null || email_id == "") && (phone_number == null && phone_number == "")) {
            return false
        }
        console.log("Checking data");
        console.log(email_id, phone_number);
        try {
            const user = await userAuthModel.findOne({
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

    insertNewUser: function (first_name: string, last_name: string, phone_number: string, email: string, auth_id: string, auth_provider: string, location: string): Promise<{ token: string }> {
        return new Promise(async (resolve, reject) => {
            const otpNumber = utilHelper.generateAnOTP(6);
            const expireTime = constant_data.MINIMUM_OTP_TIMER();
            const userid = await userHelper.generateUserID(first_name)

            console.log("The user id : " + userid);

            if (userid) {
                const jwtToken = await tokenHelper.createJWTToken({ email_id: email, type: constant_data.OTP_TYPE.SIGN_UP_OTP }, constant_data.USERAUTH_EXPIRE_TIME.toString())
                if (jwtToken) {
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
            } else {
                reject("Something went wrong")
            }
        })
    },

    _checkUserIDValidity: async (user_id: string): Promise<boolean> => {
        try {
            const user = await userAuthModel.findOne({ user_id });
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

    generateUserID: async function (first_name: string): Promise<string | false> {
        try {
            const randomText = utilHelper.createRandomText(4);
            let count = 0;
            let userId: string;
            let isUserIDValid: boolean;

            do {
                userId = first_name + "@" + randomText + count
                isUserIDValid = await this._checkUserIDValidity(userId)
                count++;
            } while (isUserIDValid);

            console.log("The user id is : " + userId);
            return userId;

        } catch (e) {
            console.log(e);
            return false;
        }
    }
}

export default userHelper;


