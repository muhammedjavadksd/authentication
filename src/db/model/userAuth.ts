
import mongoose from "mongoose";
import constant_data from "../../config/const";
import { IUserModelDocument } from "../../config/Datas/Interface/DatabaseModel";

const userAuthSchema = {
    user_id: {
        type: String,
        required: true,
        unique: true
    },
    phone_number: {
        type: Number,
    },
    email: {
        type: String,
        required: true
    },
    otp: {
        type: Number,
    },
    otp_timer: {
        type: Number,
    },
    auth_id: {
        type: String,
    },
    auth_provider: {
        type: String,
        required: true,
        enum: constant_data.AUTH_PROVIDERS
    },
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    jwtToken: {
        type: String,
        required: true
    },
    account_started: {
        type: Boolean,
        default: false
    },
    blood_token: String,
    location: {
        type: {
            latitude: {
                type: mongoose.Types.Decimal128,
                required: true
            },
            longitude: {
                type: mongoose.Types.Decimal128,
                required: true
            }
        },
        required: false
    }
}


const userAuthModel = new mongoose.Schema<IUserModelDocument>(userAuthSchema);

export default mongoose.model("user", userAuthModel, "user")