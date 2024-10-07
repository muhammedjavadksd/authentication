import { NextFunction, Request } from "express"

interface IBaseUser {
    first_name: string
    last_name: string
    phone_number?: number
    email: string
    auth_id: string
    auth_provider: string
    user_id?: string
    profile_id?: string
}

interface IBaseProfileData {
    first_name: string
    last_name: string
    phone_number: number
    email: string
    user_id: string
    profile_id: string
}

interface IAdminEmailVerify {
    email_id: string,
    admin_email: string
}

interface ControllerInterFace {
    [key: string]: (req: Request, res: Response, next: NextFunction) => Promise<void> | void
}

interface BASIC_OBJECT_TYPE {
    [key: string]: string
}

interface IUserJwt {
    email: string,
    first_name: string,
    last_name: string,
    profile_id: string,
    phone: number | undefined,
    user_id: string,
}



interface ConstantData {
    AUTH_PROVIDERS: string[];
    MINIMUM_OTP_TIMER: () => number;
    BLOOD_GROUP: string[];
    AUTH_PROVIDERS_DATA: BASIC_OBJECT_TYPE,
    OTP_EXPIRE_TIME: number;
    USERAUTH_EXPIRE_TIME: number;
    OTP_TYPE: BASIC_OBJECT_TYPE,
    MAIL_TYPE: BASIC_OBJECT_TYPE,
    JWT_FOR: BASIC_OBJECT_TYPE,
}

interface CustomRequest extends Request {
    context?: Record<string, any>
}


interface MulterFiles {
    [fieldname: string]: Express.Multer.File[]
}

interface AuthData {
    first_name: string;
    last_name: string;
    email: string;
    location: object;
    phone_number: number;
    user_id: string;
    profile_id: string;
}

interface HelperFunctionResponse {
    status: boolean,
    msg: string,
    data?: any
    statusCode: number
}

interface ITokenResponse {
    access_token: string,
    refresh_token?: string,
}
interface RefershTokenResponse extends HelperFunctionResponse {
    data?: ITokenResponse
}

interface ControllerResponseInterFace {
    status: boolean,
    msg: string,
    data?: any
}

interface UserJwtInterFace {
    jwt?: string,
    first_name: string,
    last_name: string,
    email: string,
    phone: number,
    user_id: string,
    profile_id: string
    blood_token?: string
    refresh_token?: string
}

interface AdminJwtInterFace {
    email: string,
    name: string,
    token: string
}


export { MulterFiles, ControllerInterFace, ConstantData, CustomRequest, AuthData, HelperFunctionResponse, ControllerResponseInterFace, UserJwtInterFace, AdminJwtInterFace, IUserJwt, RefershTokenResponse, ITokenResponse }

export { IBaseProfileData, IBaseUser, IAdminEmailVerify }