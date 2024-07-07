
import multer from 'multer';
import utilHelper from './utilHelper'

const { organizationFileName } = utilHelper;


const organizationStorage = {

    kycMulter: multer.diskStorage({
        destination: (req: Request, file: File, cb: Function) => {
            cb(null, 'public/organization/kyc');
        },
        filename: (req: Request, file: any, cb: Function) => {
            let file_name = organizationFileName("kyc_", file.filename)
            cb(null, file_name);
        }
    }),

    logoPicture: multer.diskStorage({
        destination: (req: Request, file: any, cb: Function) => {
            cb(null, 'public/organization/logo');
        },
        filename: (req: Request, file: any, cb: Function) => {
            let fileName = organizationFileName("logo_", file.filename)
            cb(null, fileName);
        }
    })
}

// module.exports = organizationStorage;
export default organizationStorage