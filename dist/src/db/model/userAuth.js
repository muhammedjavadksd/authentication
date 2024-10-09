"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const const_1 = __importDefault(require("../../config/const"));
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
        enum: const_1.default.AUTH_PROVIDERS
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
                type: mongoose_1.default.Types.Decimal128,
                required: true
            },
            longitude: {
                type: mongoose_1.default.Types.Decimal128,
                required: true
            }
        },
        required: false
    }
};
const userAuthModel = new mongoose_1.default.Schema(userAuthSchema);
exports.default = mongoose_1.default.model("user", userAuthModel, "user");
