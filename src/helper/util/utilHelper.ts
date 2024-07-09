import { Request } from "express";

interface IUtilHelper {
    generateAnOTP: (length: number) => number;
    createRandomText: (length: number) => string;
    organizationFileName: (file_name: string, type: string) => string;
    isFalsyValue: (data: any) => boolean
    OTPValidator: (otp_number: number, db_otp_number: number, expire_time: number) => IOTPValidationResponse
    getTokenFromHeader: (headers: Request['headers']['authorization']) => string | false
}

interface IOTPValidationResponse {
    status: boolean
    msg?: string
}

const utilHelper: IUtilHelper = {
    generateAnOTP: (length: number): number => {
        const min = Math.pow(10, length - 1);
        const max = Math.pow(10, length) - 1;
        const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
        return randomNumber;
    },

    createRandomText: (length: number): string => {
        const characters = 'abcdefghijklmnopqrstuvwxyz';

        let result = '';
        const charactersLength = characters.length;

        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        return result;
    },

    organizationFileName: (file_name: string, type: string): string => {
        return type + file_name;
    },

    isFalsyValue: (data: any) => {
        return data == "" || data == null || data == undefined
    },


    OTPValidator: (otp_number: number, db_otp_number: number, expire_time: number): IOTPValidationResponse => {
        if (otp_number == db_otp_number) {
            let currentTime = Date.now();
            if (currentTime > expire_time) {
                return { status: true, msg: "OTP verified" }
            } else {
                return { status: false, msg: "OTP has been expired" }
            }
        } else {
            return { status: false, msg: "Incorrect OTP Number" }
        }
    },

    getTokenFromHeader: (headers: Request['headers']['authorization']): string | false => {
        const splitAuth = headers?.split(" ");
        if (splitAuth && splitAuth[0] == "Bearer") {
            const token: string | undefined = splitAuth[0];
            if (token) {
                return token
            }
        }
        return false
    }
};

export default utilHelper;


