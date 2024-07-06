const OrganizationAuth = require("../db/models/organizationAuth")
const bcrypt = require("bcrypt");
const tokenHelper = require("./tokenHelper");
const constant_data = require("../config/const");
const COMMUNICATION_PROVIDER = require("../communication/Provider/notification/notification_service");

let authOrganizationHelper = {


    signUpHelper: async (name, phone_number, email_address, password, blood_service, fund_service, organization_type, pan_card_photo, logo_photo, office_photo, registration_photo, website_url) => {

        try {

            password = await bcrypt.hash(password, Number(process.env.BCRYPT_SALTROUND))
            let newOrganization = new OrganizationAuth({ name, phone_number, email_address, password, blood_service, fund_service, organization_type, pan_card_photo, logo_photo, office_photo, registration_photo, website_url });
            await newOrganization.save()
            return true;
        } catch (e) {
            console.log(e);
            return false
        }
    },

    signInHelper: async (email_address, password) => {

        try {

            let getData = await OrganizationAuth.findOne({ email_address });
            if (getData) {
                let dbPassword = getData.password;
                let comparePassword = await bcrypt.compare(password, dbPassword);
                let jwtToken = await tokenHelper.createJWTToken({
                    name: getData.name,
                    email_address,
                    id: getData.id
                }, constant_data.USERAUTH_EXPIRE_TIME);
                getData.token = jwtToken
                await getData.save()
                if (comparePassword) {
                    return { status: true, token: getData, name: getData.name }
                } else {
                    return { status: false, msg: "Incorrect Password" }
                }
            } else {
                return { status: false, msg: "Organization not found" }
            }
        } catch (e) {
            console.log(e);
            return { status: false, msg: "Internal server error" }
        }
    },


    forgetPasswordHelper: async (email_address) => {

        try {

            const organization = await OrganizationAuth.findOne({ email_address });
            const token = await tokenHelper.createJWTToken({ email_id: email_address, type: constant_data.OTP_TYPE.ORGANIZATION_FORGET_PASSWORD }, constant_data.OTP_EXPIRE_TIME)

            if (organization && token) {
                organization.token = token;
                await organization.save();
                COMMUNICATION_PROVIDER.organizationForgetPasswordEmail({
                    token: token,
                    email: email_address,
                    name: organization.name
                })
                return {
                    status: true,
                    statusCode: 200,
                    msg: "Reset email has been sent"
                }
            } else {
                return {
                    status: false,
                    statusCode: 500,
                    msg: "Something went wrong"
                }
            }
        } catch (e) {
            return {
                status: false,
                statusCode: 500,
                msg: "Internal server error"
            }
        }
    },

    resetPassword: async (token, password) => {

        try {
            let organizationToken = await tokenHelper.checkTokenValidity(token);
            let email_address = organizationToken.email_id;
            if (email_address) {
                let organization = await OrganizationAuth.findOne({ email_address, token });
                if (organization) {

                    let newPassword = await bcrypt.hash(password, Number(process.env.BCRYPT_SALTROUND));
                    let comparePassword = await bcrypt.compare(password, organization.password);

                    if (comparePassword) {
                        return {
                            status: false,
                            statusCode: 400,
                            msg: "New password cannot be the same as the last used password."
                        }
                    }

                    if (newPassword) {
                        organization.password = newPassword;
                        organization.token = "";
                        await organization.save();
                        return {
                            status: true,
                            statusCode: 200,
                            msg: "Password has been updated"
                        }
                    } else {
                        return {
                            status: false,
                            statusCode: 500,
                            msg: "Internal Server Error"
                        }
                    }
                } else {
                    return {
                        status: false,
                        statusCode: 401,
                        msg: "Organization not found"
                    }
                }
            } else {
                return {
                    status: false,
                    statusCode: 401,
                    msg: "Organization not found"
                }
            }
        } catch (e) {
            console.log(e);
            return {
                status: false,
                statusCode: 500,
                msg: "Internal server error"
            }
        }
    }
}


module.exports = authOrganizationHelper;