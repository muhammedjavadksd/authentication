const multer = require("multer");
const { organizationFileName } = require("./utilHelper");


let organizationStorage = {

    kycMulter: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'public/organization/kyc');
        },
        filename: (req, file, cb) => {
            let file_name = organizationFileName("kyc_", file.filename)
            cb(null, file_name);
        }
    }),

    logoPicture: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'public/organization/logo');
        },
        filename: (req, file, cb) => {
            let fileName = organizationFileName("logo_", file.filename)
            cb(null, fileName);
        }
    })
}

module.exports = organizationStorage;