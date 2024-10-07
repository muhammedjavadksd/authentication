import { Document } from "mongoose";

interface IUserModelDocument extends Document {
    user_id: string;
    phone_number?: number;
    email: string;
    otp: number;
    otp_timer: number;
    auth_id?: string | null;
    auth_provider: string;
    blood_token: string,
    first_name: string;
    last_name: string;
    jwtToken: string;
    account_started?: boolean;
}

interface IAdminAuthModel extends Document {
    name: string
    email_address: string
    password: string
    last_logged: string
    token: string
}

export { IUserModelDocument, IAdminAuthModel }