"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utilHelper = {
    generateAnOTP: (length) => {
        const min = Math.pow(10, length - 1);
        const max = Math.pow(10, length) - 1;
        const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
        return randomNumber;
    },
    createRandomText: (length) => {
        const characters = 'abcdefghijklmnopqrstuvwxyz';
        let result = '';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    },
    organizationFileName: (file_name, type) => {
        return type + file_name;
    },
    isFalsyValue: (data) => {
        return data == "" || data == null || data == undefined;
    },
    OTPValidator: (otp_number, db_otp_number, expire_time) => {
        if (otp_number == db_otp_number) {
            let currentTime = Date.now();
            if (currentTime > expire_time) {
                return { status: true, msg: "OTP verified" };
            }
            else {
                return { status: false, msg: "OTP has been expired" };
            }
        }
        else {
            return { status: false, msg: "Incorrect OTP Number" };
        }
    },
    getTokenFromHeader: (headers) => {
        const splitAuth = headers === null || headers === void 0 ? void 0 : headers.split(" ");
        if (splitAuth && splitAuth[0] == "Bearer") {
            const token = splitAuth[0];
            if (token) {
                return token;
            }
        }
        return false;
    }
};
exports.default = utilHelper;
