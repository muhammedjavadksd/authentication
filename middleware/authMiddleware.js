// const { OTP_TYPE } = require("../../notification/config/const_data");
const { OTP_TYPE } = require("../config/const");
const tokenHelper = require("../helper/tokenHelper");


let authMiddleware = {

    isValidSignUpTrying: async (req, res, next) => {
        let headers = req.headers;
        console.log("The header is : 123");

        console.log(req.headers);
        if (headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            if (!req.context) {
                req.context = {}
            }
            let token = req.headers.authorization.split(' ')[1]
            req.context.auth_token = token;
            let checkValidity = await tokenHelper.checkTokenValidity(token)
            if (checkValidity) {
                console.log('Decode jwt is : ');

                if (checkValidity?.email_id && (checkValidity.type == OTP_TYPE.SIGN_UP_OTP || checkValidity.type == OTP_TYPE.SIGN_IN_OTP)) {
                    req.context.email_id = checkValidity?.email_id;
                    console.log("Requested phone number is", checkValidity?.email_id);
                    next()
                } else {
                    res.status(401).json({
                        status: false,
                        msg: "Authorization is failed"
                    })
                }
            } else {
                res.status(401).json({
                    status: false,
                    msg: "Authorization is failed"
                })
            }
        } else {
            res.status(401).json({
                status: false,
                msg: "Invalid auth attempt"
            })
        }
    },



    isUserLogged: (req, res, next) => {
        next()
    },


    isAdminLogged: (req, res, next) => {
        next()
    },

    isOrganizationLogged: (req, res) => {
        next()
    }
}

module.exports = authMiddleware;