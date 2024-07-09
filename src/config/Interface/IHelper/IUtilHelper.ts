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

export { IUtilHelper, IOTPValidationResponse }