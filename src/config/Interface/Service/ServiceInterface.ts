import { ObjectId } from "mongoose"
import { HelperFunctionResponse } from "../../Datas/InterFace"
import { OrganizationStatus } from "../../Datas/Enums"


interface IAdminAuthService {
    signIn(email: string, password: string): Promise<HelperFunctionResponse>
    forgetPassword(email: string): Promise<HelperFunctionResponse>
    resetPassword(token: string, password: string): Promise<HelperFunctionResponse>
    updatePassword(password: string, email_id: string, admin_email: string): Promise<HelperFunctionResponse>
    // updateOrganizationStatus(organization_id: ObjectId, password: string): Promise<HelperFunctionResponse>
}

interface IUserAuthService {
    accountCompleteHelper(token: string, phone: number): Promise<HelperFunctionResponse>
    signUpProvideHelper(token: string, phone: string, auth_id: string): Promise<HelperFunctionResponse>
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
    updateOrganizationStatus(organization_id: ObjectId, status: OrganizationStatus): Promise<HelperFunctionResponse>
    findSingleOrganization(organization_id: ObjectId): Promise<HelperFunctionResponse>
    organizationPaginationView(limit: number, skip: number): Promise<HelperFunctionResponse>
}

export { IAdminAuthService, IUserAuthService, IOrganizationAuthService }