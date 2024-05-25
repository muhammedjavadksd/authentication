
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
    }
}

module.exports = constant_data;