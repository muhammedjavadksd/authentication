const { OTP_TYPE } = require("../../notification/config/const_data");
const tokenHelper = require("../helper/tokenHelper");


let authMiddleware = {

    isValidSignUpTrying: async (req, res, next) => {
        let headers = req.headers;
        console.log("The header is : 123");
        if (headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            console.log(req.headers);
            if (!req.context) {
                req.context = {}
            }
            let token = req.headers.authorization.split(' ')[1]
            req.context.auth_token = token;
            let checkValidity = await tokenHelper.checkTokenValidity(token)
            if (checkValidity) {
                console.log('Decode jwt is : ');
                let decodePayload = decodeJwt.payload;
                console.log(decodeJwt);
                if (decodePayload?.email_id && decodePayload.type == OTP_TYPE.SIGN_UP_OTP) {
                    req.context.email_id = decodePayload?.email_id;
                    console.log("Requested phone number is", decodePayload?.email_id);
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