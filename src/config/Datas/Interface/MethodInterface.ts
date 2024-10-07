import mongoose from "mongoose"
import { NextFunction, Request, Response } from "express"
import { JwtTimer } from "../Enums"
import * as Jwt from "jsonwebtoken";
import { IAdminAuthModel, IUserModelDocument } from "./DatabaseModel";
import { CustomRequest, HelperFunctionResponse, IBaseUser, RefershTokenResponse } from "./UtilInterface";

interface IOTPValidationResponse {
    status: boolean
    msg?: string
}

interface IAdminAuthService {
    signIn(email: string, password: string): Promise<HelperFunctionResponse>
    forgetPassword(email: string): Promise<HelperFunctionResponse>
    resetPassword(token: string, password: string): Promise<HelperFunctionResponse>
    updatePassword(password: string, email_id: string, admin_email: string): Promise<HelperFunctionResponse>
    verifyToken(token: string): Promise<HelperFunctionResponse>
}

interface IUserAuthService {
    refreshToken(token: string): Promise<RefershTokenResponse>
    accountCompleteHelper(token: string, phone: number): Promise<HelperFunctionResponse>
    signUpProvideHelper(token: string, phone: string, auth_id: string): Promise<HelperFunctionResponse>
    signInHelper(email: string): Promise<HelperFunctionResponse>
    authOTPValidate(otp: number, email_id: string, token: string): Promise<HelperFunctionResponse>
    editAuthEmailID(oldEmailId: string, newEmailID: string): Promise<HelperFunctionResponse>
    resendOtpNumer(email_id: string): Promise<HelperFunctionResponse>
    generateUserID(first_name: string): Promise<string | false>
}

interface IUserAuthenticationRepo {
    findByUserId(user_id: string): Promise<IUserModelDocument | null>
    updateUserById(user_id: mongoose.Types.ObjectId, data: object): Promise<boolean>
    updateUser(newAuthUser: IUserModelDocument): Promise<boolean>
    insertNewUser(baseUSER: IBaseUser): Promise<{ token: string }>
    isUserExist(email_address: string, phone_number: number): Promise<boolean>
    findUser(id: string | null, email: string | null | undefined, phone: number | null | undefined): Promise<boolean | IUserModelDocument>
}

interface IAdminRepo {
    findAdmin(email: string): Promise<IAdminAuthModel | null>
    updateAdmin(admin: IAdminAuthModel): Promise<boolean>
}

interface IAuthMiddleware {
    isValidSignUpAttempt(req: CustomRequest, res: Response, next: NextFunction): void
    isUserLogged(req: Request, res: Response, next: NextFunction): void
    isAdminLogged(req: Request, res: Response, next: NextFunction): void
}

interface IUtilHelper {
    generateAnOTP: (length: number) => number;
    createRandomText: (length: number) => string;
    organizationFileName: (file_name: string, type: string) => string;
    isFalsyValue: (data: any) => boolean
    OTPValidator: (otp_number: number, db_otp_number: number, expire_time: number) => IOTPValidationResponse
    getTokenFromHeader: (headers: Request['headers']['authorization']) => string | false
}

interface ITokenHelper {
    generateJWtToken: (payload: object, timer: JwtTimer) => Promise<string | null>;
    decodeJWTToken: (jwttoken: string) => Promise<Jwt.Jwt | null>;
    checkTokenValidity: (token: string) => Promise<Jwt.JwtPayload | boolean | string>;
}

interface IAdminController {
    signInController(req: Request, res: Response, next: NextFunction): Promise<void>
    forgetPasswordController(req: Request, res: Response, next: NextFunction): Promise<void>
    adminPasswordReset(req: Request, res: Response): Promise<void>
    updateSettings(req: Request, res: Response): Promise<void>
    verifyToken(req: CustomRequest, res: Response): Promise<void>
}

interface IUserAuthController {
    refreshToken(req: Request, res: Response, next: NextFunction): Promise<void>
    completeAccount(req: Request, res: Response, next: NextFunction): Promise<void>
    signUpWithProvide(req: Request, res: Response, next: NextFunction): Promise<void>
    signUpController(req: Request, res: Response, next: NextFunction): Promise<void>
    signInController(req: Request, res: Response, next: NextFunction): Promise<void>
    signWithToken(req: Request, res: Response, next: NextFunction): Promise<void>
    AuthOTPSubmission(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    editAuthPhoneNumber(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    resetOtpNumber(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    updateAuth(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
}

export { IUserAuthController }
export { IAdminController }
export { ITokenHelper }
export { IUtilHelper, IOTPValidationResponse }
export { IAuthMiddleware }
export { IUserAuthenticationRepo, IAdminRepo }
export { IAdminAuthService, IUserAuthService }
