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
const notification_service_1 = __importDefault(require("../../communication/Provider/notification/notification_service"));
const const_1 = __importDefault(require("../../config/const"));
const userAuth_1 = __importDefault(require("../../db/models/userAuth"));
const tokenHelper_1 = __importDefault(require("../../helper/tokenHelper"));
const userHelper_1 = __importDefault(require("../../helper/userHelper"));
const utilHelper_1 = __importDefault(require("../../helper/utilHelper"));
class UserAuthenticationRepo {
    constructor() {
        this.UserAuthCollection = userAuth_1.default;
    }
    updateUser(newAuthUser) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield newAuthUser.save();
                return true;
            }
            catch (e) {
                console.log(e);
                return false;
            }
        });
    }
    insertNewUser(baseUSER) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                const otpNumber = utilHelper_1.default.generateAnOTP(6);
                const expireTime = const_1.default.MINIMUM_OTP_TIMER();
                const userid = yield userHelper_1.default.generateUserID(baseUSER['first_name']);
                if (userid) {
                    const jwtToken = yield tokenHelper_1.default.createJWTToken({ email_id: baseUSER['email'], type: const_1.default.OTP_TYPE.SIGN_UP_OTP }, const_1.default.USERAUTH_EXPIRE_TIME.toString());
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
                        }, { upsert: true }).then((data) => __awaiter(this, void 0, void 0, function* () {
                            resolve({ token: jwtToken });
                            let communicationData = {
                                otp: otpNumber,
                                recipientName: baseUSER['first_name'] + baseUSER['last_name'],
                                recipientEmail: baseUSER['email']
                            };
                            const authenticationCommunicationProvider = new notification_service_1.default();
                            yield authenticationCommunicationProvider._init_();
                            authenticationCommunicationProvider.signUpOTPSender(communicationData);
                            // COMMUNICATION_PROVIDER.signUpOTPSender(communicationData)
                        })).catch((err) => {
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
        });
    }
    isUserExist(email_address, phone_number) {
        return __awaiter(this, void 0, void 0, function* () {
            if ((email_address == null || email_address == "") && (phone_number == null && phone_number == "")) {
                return false;
            }
            try {
                const user = yield this.UserAuthCollection.findOne({
                    $or: [
                        { email: email_address },
                        { phone_number: phone_number }
                    ]
                });
                if (user) {
                    if (user.account_started == true)
                        return true;
                    else
                        return false;
                }
                else {
                    return false;
                }
            }
            catch (e) {
                console.log(e);
                return false;
            }
        });
    }
    findUser(id, email, phone) {
        return __awaiter(this, void 0, void 0, function* () {
            if (utilHelper_1.default.isFalsyValue(id) && utilHelper_1.default.isFalsyValue(email) && utilHelper_1.default.isFalsyValue(phone)) {
                throw new Error("Please provide any of arguments");
            }
            try {
                const user = yield this.UserAuthCollection.findOne({
                    $or: [
                        { email: email },
                        { phone_number: phone },
                        { _id: id }
                    ]
                });
                if (user) {
                    return user;
                }
                else {
                    return false;
                }
            }
            catch (e) {
                console.log(e);
                return false;
            }
        });
    }
}
exports.default = UserAuthenticationRepo;
