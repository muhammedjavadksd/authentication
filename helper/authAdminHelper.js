
const bcrypt = require("bcrypt");
const AdminAuthModel = require("../db/models/adminAuth");
const COMMUNICATION_PROVIDER = require("../communication/Provider/notification/notification_service");
const tokenHelper = require("./tokenHelper");
const { MAIL_TYPE } = require("../config/const");
const constant_data = require("../config/const");
let authAdminHelper = {

    signInHelper: async (email, password) => {

        try {
            let findAdmin = await AdminAuthModel.findOne({ email_address: email });
            if (findAdmin) {

                console.log("Got admin");

                let adminPassword = findAdmin.password;
                console.log("Admin password" + adminPassword);
                let comparePassword = await bcrypt.compare(password, adminPassword);
                let token = await tokenHelper.createJWTToken({ email: findAdmin.email_address, type: constant_data.JWT_FOR.ADMIN_AUTH }, constant_data.USERAUTH_EXPIRE_TIME)

                if (comparePassword && token) {
                    console.log("Creditials was right");
                    return {
                        statusCode: 200,
                        status: true,
                        msg: "Admin auth success",
                        email: email,
                        name: findAdmin.name,
                        token
                    }
                } else {
                    console.log("Creditial is wrong");
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
            let token = await tokenHelper.createJWTToken({ email, type: MAIL_TYPE.ADMIN_PASSWORD_REST }, constant_data.OTP_EXPIRE_TIME)
            console.log(findAdmin);
            console.log(token);
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
            console.log(e);
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
            console.log("Admin token : " + token);
            console.log("Org admin token : " + findAdmin.token);
            if (findAdmin) {
                if (findAdmin.token == token) {

                    let newPassword = await bcrypt.hash(password, Number(process.env.BCRYPT_SALTROUND));
                    let comparePassword = await bcrypt.compare(password, findAdmin.password)

                    if (comparePassword) {
                        return {
                            status: false,
                            statusCode: 400,
                            msg: "New password cannot be the same as the last used password."
                        }
                    }

                    if (newPassword) {
                        findAdmin.password = newPassword;
                        findAdmin.token = "";
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
                        msg: "Invalid Token"
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