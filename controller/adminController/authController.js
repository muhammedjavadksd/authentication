const AdminAuthModel = require("../../db/models/adminAuth");
const authAdminHelper = require("../../helper/authAdminHelper");
const tokenHelper = require("../../helper/tokenHelper");


let authController = {

    signUpController: async (req, res, next) => {

        let email_address = req.body.email_address;
        let password = req.body.password;

        try {
            let adminAuthAttempt = await authAdminHelper.signInHelper(email_address, password)
            res.status(adminAuthAttempt.statusCode).json({
                status: adminAuthAttempt.status,
                msg: adminAuthAttempt.msg,
                email: adminAuthAttempt.email,
                name: adminAuthAttempt.name
            })
        } catch (e) {
            res.status(500).json({
                status: false,
                msg: "Internal Server Error",
            })
        }


    },

    forgetPasswordController: async (req, res) => {
        try {

            let email_id = req.body.email_id;
            let adminResetRequest = await authAdminHelper.forgetPasswordHelpers(email_id)
            res.status(adminResetRequest.statusCode).json({ status: true, msg: adminResetRequest.msg })
        } catch (e) {
            console.log(e);
            res.status(500).json({ status: false, msg: "Internal Server Error" })
        }
    },


    adminPasswordReset: async (req, res) => {

        try {

            let token = req.params.token;
            console.log("The token is : " + token);

            let password = req.body.password;
            if (password) {
                let resetPassword = await authAdminHelper.resetPassword(token, password);
                res.status(resetPassword.statusCode).json({
                    status: resetPassword.status,
                    msg: resetPassword.msg,
                })
            } else {
                res.status(401).json({
                    status: false,
                    msg: "Please provide a password",
                })
            }
        } catch (e) {
            res.status(500).json({
                status: false,
                msg: "Internal Servor Error",
            })
        }

    }
}

module.exports = authController