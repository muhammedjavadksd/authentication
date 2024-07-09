
// const constant_data = require("../../config/const");
import UserModelDocument from "../../config/Interface/IModel/UserAuthModel/IUserAuthModel";
import constant_data from "../../config/const";
// const mongo = require("mongoose");
import mongoose from "mongoose";
// const { default: mongoose } = require("mongoose");

const userAuthSchema = {
    user_id: {
        type: String,
        required: true
    },
    phone_number: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    otp: {
        type: Number,
        required: true
    },
    otp_timer: {
        type: Number,
        required: true
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


const userAuthModel = new mongoose.Schema<UserModelDocument>(userAuthSchema);

export default mongoose.model("user", userAuthModel, "user")