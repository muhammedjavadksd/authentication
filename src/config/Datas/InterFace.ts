import { Request, Response, NextFunction } from "express"
import { string } from "joi";
import mongoose from "mongoose";

interface ControllerInterFace {
    [key: string]: (req: Request, res: Response, next: NextFunction) => Promise<void> | void
}

interface BASIC_OBJECT_TYPE {
    [key: string]: string
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
}

interface AdminJwtInterFace {
    email: string,
    name: string,
    token: string
}



interface OrganizationJwtInteraFace {
    name: string,
    email: string,
    id: string
}

interface AuthController {
    signUpController: (req: Request, res: Response) => Promise<void>;
    signInController: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    AuthOTPSubmission: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    editAuthPhoneNumber: (req: Request, res: Response) => Promise<void>;
    resetOtpNumber: (req: Request, res: Response) => Promise<void>;
}

interface AdminAuthController {
    signInController: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    forgetPasswordController: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    adminPasswordReset: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}

export { MulterFiles, OrganizationJwtInteraFace, AdminAuthController, ControllerInterFace, ConstantData, CustomRequest, AuthData, HelperFunctionResponse, AuthController, ControllerResponseInterFace, UserJwtInterFace, AdminJwtInterFace }