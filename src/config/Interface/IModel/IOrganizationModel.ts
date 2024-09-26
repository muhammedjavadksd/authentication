import { Document } from "mongoose";
import { OrganizationStatus } from "../../Datas/Enums";


interface IOrganizationEditable {
    name?: string
    email_address?: string
    phone_number?: number
    blood_service?: string,
    fund_service?: string,
    organization_type?: string,
    pan_card_photo?: string,
    logo_photo?: string,
    office_photo?: string,
    registration_photo?: string,
    password?: string,
    website_url?: string,
    last_logged?: string,
    token?: string
    status: OrganizationStatus
}



interface IOrganizationAuthModel extends Document {
    name: string
    email_address: string
    phone_number: number
    blood_service: string,
    fund_service: string,
    organization_type: string,
    pan_card_photo: string,
    logo_photo: string,
    office_photo: string,
    registration_photo: string,
    password: string,
    website_url: string,
    last_logged: string,
    token: string
    status: OrganizationStatus
}


export { IOrganizationEditable }

export default IOrganizationAuthModel