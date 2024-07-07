"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const utilHelper_1 = __importDefault(require("./utilHelper"));
const { organizationFileName } = utilHelper_1.default;
const organizationStorage = {
    kycMulter: multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'public/organization/kyc');
        },
        filename: (req, file, cb) => {
            let file_name = organizationFileName("kyc_", file.filename);
            cb(null, file_name);
        }
    }),
    logoPicture: multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'public/organization/logo');
        },
        filename: (req, file, cb) => {
            let fileName = organizationFileName("logo_", file.filename);
            cb(null, fileName);
        }
    })
};
// module.exports = organizationStorage;
exports.default = organizationStorage;
