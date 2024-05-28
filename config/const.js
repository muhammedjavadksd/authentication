
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
    OTP_TYPE: {
        SIGN_UP_OTP: "SIGN_UP_OTP",
        SIGN_IN_OTP: "SIGN_IN_OTP"
    },
}

module.exports = constant_data;