// const { required } = require("joi");
// const { default: mongoose } = require("mongoose");
import mongoose from "mongoose";
import IOrganizationAuthModel from "../../config/Interface/IModel/IOrganizationModel";


const OrganizationAuthModel: mongoose.Schema = new mongoose.Schema({
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
        required: false,
    },
    pan_card_photo: {
        type: String,
        required: false,
    },
    logo_photo: {
        type: String,
        required: false,
    },
    office_photo: {
        type: String,
        required: false,
    },
    registration_photo: {
        type: String,
        required: false,
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
})

const OrganizationAuth = mongoose.model<IOrganizationAuthModel>("organization", OrganizationAuthModel, "organization");

export default OrganizationAuth;