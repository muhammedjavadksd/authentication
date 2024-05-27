
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
    },

    checkTokenValidity: async (token) => {
        try {
            let checkValidity = await jwt.verify(token, process.env.JWT_SECRET);
            console.log("Token validity is : ");
            console.log(checkValidity);
            return checkValidity
        } catch (e) {
            return false
        }
    }
}

module.exports = tokenHelper