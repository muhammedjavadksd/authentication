import { Document } from "mongoose";

interface locationTypeInterFace {
    type: object,
    coordinates: [number, number];
}


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
    location?: locationTypeInterFace,
}

export default IUserModelDocument
export { locationTypeInterFace }