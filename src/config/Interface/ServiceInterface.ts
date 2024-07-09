import { HelperFunctionResponse } from "../Datas/InterFace"


interface IAdminAuthService {
    signIn(email: string, password: string): Promise<HelperFunctionResponse>
    forgetPassword(email: string): Promise<HelperFunctionResponse>
    resetPassword(token: string, password: string): Promise<HelperFunctionResponse>
}

interface IUserAuthService {
    signInHelper(email: string): Promise<HelperFunctionResponse>
    authOTPValidate(otp: number, email_id: string, token: string): Promise<HelperFunctionResponse>
    editAuthEmailID(oldEmailId: string, newEmailID: string): Promise<HelperFunctionResponse>
    resendOtpNumer(email_id: string): Promise<HelperFunctionResponse>
    generateUserID(first_name: string): Promise<string | false>
}

interface IOrganizationAuthService {
    signIn(email: string, password: string): Promise<HelperFunctionResponse>
    forgetPasswordHelper(email_address: string): Promise<HelperFunctionResponse>
    resetPassword(token: string, password: string): Promise<HelperFunctionResponse>
}

export { IAdminAuthService, IUserAuthService, IOrganizationAuthService }