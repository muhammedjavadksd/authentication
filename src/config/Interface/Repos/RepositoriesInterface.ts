import mongoose, { ObjectId } from "mongoose"
import IUserModelDocument from "../IModel/IUserAuthModel"
import { IBaseUser } from "../Objects/IBaseUser"
import IOrganizationAuthModel, { IOrganizationEditable } from "../IModel/IOrganizationModel"
import IAdminAuthModel from "../IModel/IAdminAuthModel"


interface IUserAuthenticationRepo {
    findByUserId(user_id: string): Promise<IUserModelDocument | null>
    updateUserById(user_id: mongoose.Types.ObjectId, data: object): Promise<boolean>
    updateUser(newAuthUser: IUserModelDocument): Promise<boolean>
    insertNewUser(baseUSER: IBaseUser): Promise<{ token: string }>
    isUserExist(email_address: string, phone_number: number): Promise<boolean>
    findUser(id: string | null, email: string | null | undefined, phone: number | null | undefined): Promise<boolean | IUserModelDocument>
}

interface IOrganizationRepo {
    findOrganization(email_address: string): Promise<IOrganizationAuthModel | null>
    updateOrganizationByModel(organization: IOrganizationAuthModel): Promise<boolean>
    updateOrganizationById(organization_id: ObjectId, data: IOrganizationEditable): Promise<boolean>
    findOrganization(email_address: string): Promise<IOrganizationAuthModel | null>
    findOrganizationById(organization_id: ObjectId): Promise<IOrganizationAuthModel | null>
}

interface IAdminRepo {
    findAdmin(email: string): Promise<IAdminAuthModel | null>
    updateAdmin(admin: IAdminAuthModel): Promise<boolean>
}


export { IUserAuthenticationRepo, IOrganizationRepo, IAdminRepo }