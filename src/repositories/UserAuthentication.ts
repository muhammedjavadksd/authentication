import mongoose from "mongoose";
import AuthNotificationProvider from "../communication/Provider/notification/notification_service";
import IUserModelDocument from "../config/Interface/IModel/IUserAuthModel";
import UserModelDocument from "../config/Interface/IModel/IUserAuthModel";
import { IBaseUser } from "../config/Interface/Objects/IBaseUser";
import constant_data from "../config/const";
import userAuth from "../db/model/userAuth";
import tokenHelper from "../helper/tokenHelper";
import utilHelper from "../helper/utilHelper";
import TokenHelper from "../helper/tokenHelper";
import UserAuthServices from "../services/UserAuthServices";
import { IUserAuthenticationRepo } from "../config/Interface/Repos/RepositoriesInterface";




class UserAuthenticationRepo implements IUserAuthenticationRepo {

    private readonly UserAuthCollection;
    private readonly tokenHelpers;

    constructor() {
        this.findByUserId = this.findByUserId.bind(this)
        this.findUser = this.findUser.bind(this)
        this.insertNewUser = this.insertNewUser.bind(this)
        this.isUserExist = this.isUserExist.bind(this)
        this.updateUser = this.updateUser.bind(this)
        this.updateUserById = this.updateUserById.bind(this)
        this.UserAuthCollection = userAuth;
        this.tokenHelpers = new TokenHelper()
    }

    async findByUserId(user_id: string): Promise<UserModelDocument | null> {
        try {
            const user = this.UserAuthCollection.findOne<UserModelDocument>({ user_id });
            return user
        } catch (e) {
            console.log(e);
            return null
        }
    }


    async updateUserById(user_id: mongoose.Types.ObjectId, data: object): Promise<boolean> {
        const findUser = await this.UserAuthCollection.updateOne<UserModelDocument>({ _id: user_id }, { $set: data });
        return findUser.modifiedCount > 0
    }

    async updateUser(newAuthUser: IUserModelDocument): Promise<boolean> {
        try {
            await newAuthUser.save();
            return true
        } catch (e) {
            console.log(e);
            return false
        }
    }


    async insertUserWithAuth(baseUSER: IBaseUser, token: string): Promise<boolean> {

        const userService = new UserAuthServices();
        const userid = await userService.generateUserID(baseUSER['first_name']);

        if (userid) {
            const jwtToken = await this.tokenHelpers.generateJWtToken({ email: baseUSER['email'], type: constant_data.OTP_TYPE.SIGN_UP_OTP }, constant_data.USERAUTH_EXPIRE_TIME.toString())
            if (jwtToken) {

                const insert = await this.UserAuthCollection.updateOne({ email: baseUSER['email'] }, {
                    $set: {
                        first_name: baseUSER['first_name'],
                        last_name: baseUSER['last_name'],
                        phone_number: baseUSER['phone_number'],
                        email: baseUSER['email'],
                        auth_id: baseUSER['auth_id'],
                        auth_provider: 'GOOGLE',
                        jwtToken: jwtToken,
                        user_id: userid
                    }
                }, { upsert: true })

                if (insert) {
                    const communicationData = {
                        token,
                        recipientName: baseUSER['first_name'] + baseUSER['last_name'],
                        recipientEmail: baseUSER['email']
                    }
                    const authenticationCommunicationProvider = new AuthNotificationProvider(process.env.ACCOUNT_SETUP_NOTIFICATION as string);
                    await authenticationCommunicationProvider._init_();
                    authenticationCommunicationProvider.dataTransfer(communicationData)

                    return true
                } else {
                    return false
                }
            } else {
                return false
            }
        } else {
            return false
        }
    }

    async insertNewUser(baseUSER: IBaseUser): Promise<{ token: string }> {
        return new Promise(async (resolve, reject) => {

            const otpNumber = utilHelper.generateAnOTP(6);
            const expireTime = constant_data.MINIMUM_OTP_TIMER();
            const userService = new UserAuthServices();
            const userid = await userService.generateUserID(baseUSER['first_name']);

            if (userid) {
                const jwtToken = await this.tokenHelpers.generateJWtToken({ email: baseUSER['email'], type: constant_data.OTP_TYPE.SIGN_UP_OTP }, constant_data.USERAUTH_EXPIRE_TIME.toString())
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
                            jwtToken: jwtToken,
                            user_id: userid
                        }
                    }, { upsert: true }).then(async (data) => {
                        resolve({ token: jwtToken })



                        const communicationData = {
                            otp: otpNumber,
                            recipientName: baseUSER['first_name'] + baseUSER['last_name'],
                            recipientEmail: baseUSER['email']
                        }
                        const authenticationCommunicationProvider = new AuthNotificationProvider(process.env.USER_SIGN_UP_NOTIFICATION as string);
                        await authenticationCommunicationProvider._init_();
                        authenticationCommunicationProvider.signUpOTPSender(communicationData)


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



    async isUserExist(email_address: string, phone_number: number): Promise<boolean> {
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
                if (user.account_started == true) return true;
                else return false;
            } else {
                return false;
            }

        } catch (e) {
            console.log(e);
            return false;
        }
    }


    async findUser(id: string | null, email: string | null | undefined, phone: number | null | undefined): Promise<false | IUserModelDocument> {
        if (utilHelper.isFalsyValue(id) && utilHelper.isFalsyValue(email) && utilHelper.isFalsyValue(phone)) {
            throw new Error("Please provide any of arguments")
        }

        try {
            const user = await this.UserAuthCollection.findOne({
                $or: [
                    { email: email },
                    { phone_number: phone },
                    { _id: id }
                ]
            });
            if (user) {
                return user
            } else {
                return false
            }
        } catch (e) {
            console.log(e);
            return false
        }
    }

    // updateUser: ((newAuthUser: IUserModelDocument) => {}) | undefined




}

export default UserAuthenticationRepo