"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const { required } = require("joi");
// const { default: mongoose } = require("mongoose");
const mongoose_1 = __importDefault(require("mongoose"));
let OrganizationAuthModel = new mongoose_1.default.Schema({
    name: {
        required: true,
        type: String
    },
    email_address: {
        type: String,
        required: true,
    },
    phone_number: {
        type: Number,
        required: true,
    },
    blood_service: {
        type: Boolean,
        required: true,
    },
    fund_service: {
        type: Boolean,
        required: true,
    },
    organization_type: {
        type: String,
        required: true,
    },
    pan_card_photo: {
        type: String,
        required: true,
    },
    logo_photo: {
        type: String,
        required: true,
    },
    office_photo: {
        type: String,
        required: true,
    },
    registration_photo: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    website_url: {
        type: String,
        required: true
    },
    last_logged: {
        type: Date,
        required: true
    },
    token: {
        type: String,
        required: false
    }
});
let OrganizationAuth = mongoose_1.default.model("organization", OrganizationAuthModel, "organization");
exports.default = OrganizationAuth;
