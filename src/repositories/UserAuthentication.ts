import IBaseUser from "../config/Interface/Objects/IBaseUser";
import constant_data from "../config/const";
import userAuth from "../db/models/userAuth";
import tokenHelper from "../helper/tokenHelper";
import userHelper from "../helper/userHelper";
import utilHelper from "../helper/utilHelper";

interface IUserAuthenticationRepo {

}



class UserAuthenticationRepo implements IUserAuthenticationRepo {

    private readonly UserAuthCollection;

    constructor() {
        this.UserAuthCollection = userAuth;
    }


    async insertNewUser(baseUSER: IBaseUser) {
        return new Promise(async (resolve, reject) => {

            const otpNumber = utilHelper.generateAnOTP(6);
            const expireTime = constant_data.MINIMUM_OTP_TIMER();
            const userid = await userHelper.generateUserID(baseUSER['first_name'])


            if (userid) {
                const jwtToken = await tokenHelper.createJWTToken({ email_id: baseUSER['email'], type: constant_data.OTP_TYPE.SIGN_UP_OTP }, constant_data.USERAUTH_EXPIRE_TIME.toString())
                if (jwtToken) {

                    this.UserAuthCollection.updateOne({ email: baseUSER['email'] }, {
                        $set: {
                            first_name: baseUSER['first_name'],
                            last_name: baseUSER['last_name'],
                            phone_number: baseUSER['phone_number'],
                            email: baseUSER['email'],
                            auth_id: baseUSER['auth_id'],
                            auth_provider: baseUSER['auth_provider'],
                            otp_timer: expireTime,
                            otp: otpNumber,
                            location,
                            jwtToken: jwtToken,
                            user_id: userid
                        }
                    }, { upsert: true }).then((data) => {
                        resolve({ token: jwtToken })

                        let communicationData = {
                            otp: otpNumber,
                            recipientName: baseUSER['first_name'] + baseUSER['last_name'],
                            recipientEmail: baseUSER['email']
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
    }



    async isUserExist(email_address: string, phone_number: number) {
        if ((email_address == null || email_address == "") && (phone_number == null && phone_number == "")) {
            return false
        }

        try {
            const user = await this.UserAuthCollection.findOne({
                $or: [
                    { email: email_address },
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
    }




}

export default UserAuthenticationRepo