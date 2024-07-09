"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
// import utilHelper from './utilHelper'
// const { organizationFileName } = utilHelper;
const organizationStorage = {
    kycMulter: multer_1.default.diskStorage({
    // destination: (req: Request, file: File, cb: Function) => {
    //     cb(null, 'public/organization/kyc');
    // },
    // filename: (req: Request, file: any, cb: Function) => {
    //     let file_name = organizationFileName("kyc_", file.filename)
    //     cb(null, file_name);
    // }
    }),
    logoPicture: multer_1.default.diskStorage({
    // destination: (req: Request, file: any, cb: Function) => {
    //     cb(null, 'public/organization/logo');
    // },
    // filename: (req: Request, file: any, cb: Function) => {
    //     let fileName = organizationFileName("logo_", file.filename)
    //     cb(null, fileName);
    // }
    })
};
// module.exports = organizationStorage;
exports.default = organizationStorage;
