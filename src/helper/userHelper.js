"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import { COMMUNICATION_PROVIDER } from '../communication/Provider/notification/notification_service';
const notification_service_1 = __importDefault(require("../communication/Provider/notification/notification_service"));
// import { constant_data } from '../config/const';
const const_1 = __importDefault(require("../config/const"));
const tokenHelper_1 = __importDefault(require("./tokenHelper"));
const utilHelper_1 = __importDefault(require("./utilHelper"));
const userAuthModel = require("../db/models/userAuth");
const userHelper = {
    isUserExist: function (email_id, phone_number) {
        return __awaiter(this, void 0, void 0, function* () {
            if ((email_id == null || email_id == "") && (phone_number == null && phone_number == "")) {
                return false;
            }
            console.log("Checking data");
            console.log(email_id, phone_number);
            try {
                const user = yield userAuthModel.findOne({
                    $or: [
                        { email: email_id },
                        { phone_number: phone_number }
                    ]
                });
                if (user) {
                    if (user.account_started == true)
                        return user;
                    else
                        return false;
                }
                else {
                    return false;
                }
            }
            catch (e) {
                console.log(e);
                return null;
            }
        });
    },
    insertNewUser: function (first_name, last_name, phone_number, email, auth_id, auth_provider, location) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const otpNumber = utilHelper_1.default.generateAnOTP(6);
            const expireTime = const_1.default.MINIMUM_OTP_TIMER();
            const userid = yield userHelper.generateUserID(first_name);
            console.log("The user id : " + userid);
            if (userid) {
                const jwtToken = yield tokenHelper_1.default.createJWTToken({ email_id: email, type: const_1.default.OTP_TYPE.SIGN_UP_OTP }, const_1.default.USERAUTH_EXPIRE_TIME.toString());
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
                        resolve({ token: jwtToken });
                        let communicationData = {
                            otp: otpNumber,
                            recipientName: first_name + last_name,
                            recipientEmail: email
                        };
                        notification_service_1.default.signUpOTPSender(communicationData);
                    }).catch((err) => {
                        reject(err);
                    });
                }
                else {
                    reject("Something went wrong");
                }
            }
            else {
                reject("Something went wrong");
            }
        }));
    },
    _checkUserIDValidity: (user_id) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = yield userAuthModel.findOne({ user_id });
            if (!user) {
                return false;
            }
            else {
                return true;
            }
        }
        catch (e) {
            console.log(e);
            return false;
        }
    }),
    generateUserID: function (first_name) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const randomText = utilHelper_1.default.createRandomText(4);
                let count = 0;
                let userId;
                let isUserIDValid;
                do {
                    userId = first_name + "@" + randomText + count;
                    isUserIDValid = yield this._checkUserIDValidity(userId);
                    count++;
                } while (isUserIDValid);
                console.log("The user id is : " + userId);
                return userId;
            }
            catch (e) {
                console.log(e);
                return false;
            }
        });
    }
};
exports.default = userHelper;
