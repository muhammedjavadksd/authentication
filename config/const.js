
const constant_data = {

    AUTH_PROVIDERS: [
        'GOOGLE', 'FACEBOOK', 'CREDENTIAL'
    ],
    MINIMUM_OTP_TIMER: new Date().getUTCMilliseconds() + 1800000,
    BLOOD_GROUP: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    AUTH_PROVIDERS_DATA: {
        GOOGLE: "GOOGLE",
        FACEBOOK: "FACEBOOK",
        CREDENTIAL: "CREDENTIAL"
    },
    OTP_EXPIRE_TIME: 1800000,
    USERAUTH_EXPIRE_TIME: 2700000000,
    OTP_TYPE: {
        SIGN_UP_OTP: "SIGN_UP_OTP",
        SIGN_IN_OTP: "SIGN_IN_OTP"
    },
    MAIL_TYPE: {
        ADMIN_PASSWORD_REST: "ADMIN_PASSWORD_REST"
    },
    JWT_FOR: {
        ADMIN_AUTH: "ADMIN_AUTH"
    }
}

module.exports = constant_data;