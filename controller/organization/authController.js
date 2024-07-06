const authOrganizationHelper = require("../../helper/authOrganizationHelper");
const { organizationFileName } = require("../../helper/utilHelper");


let authController = {

    signUpController: (req, res, next) => {

        const name = req.body.name;
        const phone_number = req.body.phone_number;
        const email_address = req.body.email_address;
        const password = req.body.password;
        const blood_service = req.body.blood_service;
        const fund_service = req.body.fund_service;
        const organization_type = req.body.organization_type;
        const websiteurl = req.body.website_url;

        const pan_card_photo = organizationFileName(req.files.pan_card, "kyc_")
        const logo_photo = organizationFileName(req.files.logo_photo, "logo")
        const office_photo = organizationFileName(req.files.office_photo, "kyc_")
        const registration_photo = organizationFileName(req.files.registration_photo, "kyc_")

        authOrganizationHelper.signUpHelper(name, phone_number, email_address, password, blood_service, fund_service, organization_type, pan_card_photo, logo_photo, office_photo, registration_photo, websiteurl).then(() => {
            res.status(201).json({ status: true })
        }).catch((err) => {
            res.status(500).json({ status: false, msg: "Something went wrong" })
        })
    },

    signInController: (req, res, next) => {

        console.log("Here ");

        let email_address = req.body.email_address;
        let password = req.body.password;

        try {

            authOrganizationHelper.signInHelper(email_address, password).then((data) => {
                if (data.status) {
                    let token = data?.token;
                    if (token) {
                        res.status(200).json({ status: true, token, name: data.name })
                    } else {
                        res.status(500).json({ status: false, msg: "Internal server error" })
                    }
                } else {
                    res.status(401).json({ status: false, msg: data?.msg ?? "Something went wrong" })
                }
            }).catch((err) => {
                console.log(err);
                res.status(500).json({ status: false, msg: "Internal server error" })
            })
        } catch (e) {
            console.log(e);
            res.status(500).json({ status: false, msg: "Internal server error" })
        }

    },

    forgetPasswordController: (req, res, next) => {

        const email_address = req.body.email_address;

        authOrganizationHelper.forgetPasswordHelper(email_address).then((data) => {
            if (data.status) {
                res.status(200).json({ status: true })
            } else {
                res.status(data.statusCode).json({ status: false, msg: data.msg })
            }
        }).catch((err) => {
            console.log(err);
            res.status(500).json({ status: false, msg: "Internal server error" })
        })
    },

    resetPasswordController: (req, res, next) => {

        try {

            let password = req.body.password;
            const token = req.params.token;

            authOrganizationHelper.resetPassword(token, password).then((data) => {
                if (data.status) {
                    res.status(200).json({ status: true })
                } else {
                    res.status(data.statusCode).json({ status: false, msg: data.msg })
                }
            }).catch((err) => {
                console.log(err);
                res.status(500).json({ status: false, msg: "Internal server error" })
            })
        } catch (e) {
            console.log(e);
            res.status(200).json({ status: false, msg: "Internal server error" })
        }
    }
}

module.exports = authController