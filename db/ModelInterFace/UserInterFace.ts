import { boolean, number, string } from "joi"
import mongoose from "mongoose";


interface locationTypeInterFace {
    type: object,
    coordinates: [number, number];
}


interface UserDataType {
    user_id: string;
    phone_number: number;
    email: string;
    otp: number;
    otp_timer: number;
    auth_id?: string | null;
    auth_provider: string;
    first_name: string;
    last_name: string;
    jwtToken: string;
    account_started?: boolean;
    location?: locationTypeInterFace
}

export default UserDataType 