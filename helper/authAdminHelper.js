
const bcrypt = require("bcrypt");
const AdminAuthModel = require("../db/models/adminAuth");
const COMMUNICATION_PROVIDER = require("../communication/notification/notification_service");
const tokenHelper = require("./tokenHelper");
const { MAIL_TYPE } = require("../config/const");
let authAdminHelper = {

    signInHelper: async (email, password) => {

        try {
            let findAdmin = await AdminAuthModel.findOne({ email_address: email });
            if (findAdmin) {

                let adminPassword = findAdmin.password;
                let comparePassword = await bcrypt.compare(password, adminPassword);
                if (comparePassword) {
                    console.log("Creditials was right");
                    return {
                        statusCode: 200,
                        status: true,
                        msg: "Admin auth success",
                        email: email,
                        name: findAdmin.name
                    }
                } else {
                    return {
                        statusCode: 401,
                        status: false,
                        msg: "Incorrect Password",
                    }
                }
            } else {
                return {
                    statusCode: 401,
                    status: false,
                    msg: "Email id is not found",
                }
            }
        } catch (e) {
            console.log(e);
            return {
                statusCode: 500,
                status: false,
                msg: "Internal Server Error",
            }
        }
    },

    forgetPasswordHelpers: async (email) => {

        try {
            let findAdmin = await AdminAuthModel.findOne({ email_address: email });
            let token = await tokenHelper.createJWTToken({ email, type: MAIL_TYPE.ADMIN_PASSWORD_REST })
            if (findAdmin && token) {

                findAdmin.token = token;
                await findAdmin.save();
                COMMUNICATION_PROVIDER.adminForgetPasswordEmail({
                    token: token,
                    email,
                    name: findAdmin.name
                })
                return {
                    status: true,
                    statusCode: 200,
                    msg: "Reset email has been sent"
                }
            } else {
                return {
                    status: false,
                    statusCode: 401,
                    msg: "We couldn't locate the admin you're looking for."
                }
            }
        } catch (e) {
            return {
                status: false,
                statusCode: 500,
                msg: "Internal Server Error"
            }
        }
    },


    resetPassword: async (token, password) => {
        let isTokenValid = await tokenHelper.checkTokenValidity(token)


        if (isTokenValid) {

            let email_id = isTokenValid.email
            let findAdmin = await AdminAuthModel.findOne({ email_address: email_id })
            if (findAdmin) {
                let newPassword = await bcrypt.hash(password, process.env.BCRYPT_SALTROUND);
                if (newPassword) {
                    findAdmin.password = newPassword;
                    await findAdmin.save();
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
                    msg: "Invalid Token ID"
                }
            }
        } else {
            return {
                status: false,
                statusCode: 401,
                msg: "Token time has been expired"
            }
        }
    }
}

module.exports = authAdminHelper