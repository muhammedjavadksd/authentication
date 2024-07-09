"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const authOrganizationHelper_1 = __importDefault(require("../../helper/authOrganizationHelper"));
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
        // if (req.files?.length) {
        //     const files: Array<Express.Multer.File> = req.files
        //     const logo_photo = organizationFileName(req.files.logo_photo, "logo")
        //     const office_photo = organizationFileName(req.files.office_photo, "kyc_")
        //     const registration_photo = organizationFileName(req.files.registration_photo, "kyc_")
        //     authOrganizationHelper.signUpHelper(name, phone_number, email_address, password, blood_service, fund_service, organization_type, pan_card_photo, logo_photo, office_photo, registration_photo, websiteurl).then(() => {
        //         res.status(201).json({ status: true })
        //     }).catch((err) => {
        //         res.status(500).json({ status: false, msg: "Something went wrong" })
        //     })
        // }
    },
    signInController: (req, res, next) => {
        const email_address = req.body.email_address;
        const password = req.body.password;
        try {
            authOrganizationHelper_1.default.signInHelper(email_address, password).then((data) => {
                var _a, _b;
                if (data.status) {
                    const responseData = data.data;
                    if (responseData.token) {
                        const token = responseData.token;
                        if (token) {
                            res.status(200).json({ status: true, data: { token }, name: responseData.name, msg: "Login success" });
                        }
                        else {
                            res.status(500).json({ status: false, msg: "Internal server error" });
                        }
                    }
                    else {
                        res.status(401).json({ status: false, msg: (_a = data === null || data === void 0 ? void 0 : data.msg) !== null && _a !== void 0 ? _a : "Something went wrong" });
                    }
                }
                else {
                    res.status(401).json({ status: false, msg: (_b = data === null || data === void 0 ? void 0 : data.msg) !== null && _b !== void 0 ? _b : "Something went wrong" });
                }
            }).catch((err) => {
                console.log(err);
                res.status(500).json({ status: false, msg: "Internal server error" });
            });
        }
        catch (e) {
            console.log(e);
            res.status(500).json({ status: false, msg: "Internal server error" });
        }
    },
    forgetPasswordController: (req, res, next) => {
        const email_address = req.body.email_address;
        authOrganizationHelper_1.default.forgetPasswordHelper(email_address).then((data) => {
            if (data.status) {
                res.status(200).json({ status: true });
            }
            else {
                res.status(data.statusCode).json({ status: false, msg: data.msg });
            }
        }).catch((err) => {
            console.log(err);
            res.status(500).json({ status: false, msg: "Internal server error" });
        });
    },
    resetPasswordController: (req, res, next) => {
        try {
            const password = req.body.password;
            const token = req.params.token;
            authOrganizationHelper_1.default.resetPassword(token, password).then((data) => {
                if (data.status) {
                    res.status(200).json({ status: true });
                }
                else {
                    res.status(data.statusCode).json({ status: false, msg: data.msg });
                }
            }).catch((err) => {
                console.log(err);
                res.status(500).json({ status: false, msg: "Internal server error" });
            });
        }
        catch (e) {
            console.log(e);
            res.status(200).json({ status: false, msg: "Internal server error" });
        }
    }
};
// module.exports = authController
exports.default = authController;
