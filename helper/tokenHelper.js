
let jwt = require("jsonwebtoken")
const const_data = require("../../notification/config/const_data")
let tokenHelper = {

    createJWTToken: async (payload = {}) => {
        try {
            let jwtToken = await jwt.sign(payload, process.env.JWT_SECRET, { algorithm: "HS256", expiresIn: const_data.OTP_EXPIRE_TIME });
            console.log("The jwt token is");
            return jwtToken
        } catch (e) {
            return null;
        }
    },

    decodeJWTToken: async (jwttoken) => {
        try {
            let decode = await jwt.decode(jwttoken, { complete: true });
            return decode
        } catch (e) {
            return null;
        }
    }
}

module.exports = tokenHelper