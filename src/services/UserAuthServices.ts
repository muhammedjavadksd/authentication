import AuthNotificationProvider from "../communication/Provider/notification/notification_service";
import { HelperFunctionResponse } from "../config/Datas/InterFace";
import IUserModelDocument from "../config/Interface/IModel/IUserAuthModel";
import constant_data from "../config/const";
import tokenHelper from "../helper/tokenHelper";
import utilHelper from "../helper/utilHelper";
import UserAuthenticationRepo from "../repositories/UserAuthentication";


interface IUserAuthServices {

}

class UserAuthServices implements IUserAuthServices {

    private UserAuthRepo;

    constructor() {
        this.UserAuthRepo = new UserAuthenticationRepo()
    }

    async signInHelper(email: string): Promise<HelperFunctionResponse> {
        try {
            const userAuth: IUserModelDocument | false = await this.UserAuthRepo.findUser(null, email, null);
            if (userAuth) {

                const otpNumber: number = utilHelper.generateAnOTP(6);
                const otpExpireTime: number = constant_data.MINIMUM_OTP_TIMER();

                const token: string | null = await tokenHelper.createJWTToken({ email_id: userAuth['email'], type: constant_data.OTP_TYPE.SIGN_IN_OTP }, constant_data.OTP_EXPIRE_TIME.toString())
                if (token) {
                    userAuth.otp = otpNumber;
                    userAuth.otp_timer = otpExpireTime;
                    userAuth.jwtToken = token;

                    await this.UserAuthRepo.updateUser(userAuth);

                    // await userAuth.save()
                    const userAuthProvider = new AuthNotificationProvider();
                    await userAuthProvider._init_();
                    userAuthProvider.signInOTPSender({
                        otp: otpNumber,
                        email: userAuth.email,
                        full_name: userAuth.first_name + userAuth.last_name
                    })
                    return {
                        statusCode: 200,
                        status: true,
                        msg: "OTP Has been sent ",
                        data: {
                            token
                        }
                    }
                } else {
                    return {
                        statusCode: 401,
                        status: false,
                        msg: "Provide valid token"
                    }
                }
            } else {
                return {
                    statusCode: 401,
                    status: false,
                    msg: "User not found"
                }
            }
        } catch (e) {
            return {
                statusCode: 500,
                status: false,
                msg: "Something went wrong"
            }
        }
    }
}

export default UserAuthServices