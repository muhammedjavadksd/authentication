// const { required } = require("joi");
const { default: mongoose } = require("mongoose");


let OrganizationAuthModel = new mongoose.Schema({
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
})

let OrganizationAuth = mongoose.model("organization", OrganizationAuthModel, "organization");

module.exports = OrganizationAuth;