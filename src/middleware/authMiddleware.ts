import { NextFunction, Response } from "express";
import const_data from '../config/const'
import { JwtPayload } from "jsonwebtoken";
import utilHelper from "../helper/utilHelper";
import TokenHelper from "../helper/tokenHelper";
import { StatusCode } from "../config/Datas/Enums";
import { ControllerResponseInterFace, CustomRequest } from "../config/Datas/Interface/UtilInterface";
import { IAuthMiddleware } from "../config/Datas/Interface/MethodInterface";

const { OTP_TYPE } = const_data;

class AuthMiddleware implements IAuthMiddleware {

    private readonly tokenHelpers;

    constructor() {
        this.isAdminLogged = this.isAdminLogged.bind(this)
        this.isUserLogged = this.isUserLogged.bind(this)
        this.isValidSignUpAttempt = this.isValidSignUpAttempt.bind(this)
        this.tokenHelpers = new TokenHelper();
    }


    async isValidSignUpAttempt(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {

        const headers: CustomRequest['headers'] = req.headers;
        const token: string | false = utilHelper.getTokenFromHeader(headers['authorization'])

        if (token) {
            if (!req.context) {
                req.context = {}
            }
            req.context.auth_token = token;
            const checkValidity: JwtPayload | string | boolean = await this.tokenHelpers.checkTokenValidity(token);

            if (checkValidity && typeof checkValidity == "object") {
                if (checkValidity.email && checkValidity.type == OTP_TYPE.SIGN_UP_OTP || checkValidity.type == OTP_TYPE.SIGN_IN_OTP) {
                    req.context.email_id = checkValidity?.email;
                    req.context.token = token;
                    next();
                    return;
                }
            }
            res.status(StatusCode.UNAUTHORIZED).json({
                status: false,
                msg: "Authorization is failed"
            } as ControllerResponseInterFace);

        } else {
            res.status(StatusCode.UNAUTHORIZED).json({
                status: false,
                msg: "Invalid auth attempt"
            } as ControllerResponseInterFace);
        }
    }

    async isUserLogged(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {

        const headers: CustomRequest['headers'] = req.headers;
        const token: string | false = utilHelper.getTokenFromHeader(headers['authorization'])

        if (token) {
            if (!req.context) {
                req.context = {}
            }
            req.context.auth_token = token;


            const checkValidity: JwtPayload | string | boolean = await this.tokenHelpers.checkTokenValidity(token);

            if (checkValidity && typeof checkValidity == "object") {
                const emailAddress: string = checkValidity.email || checkValidity.email_address;
                if (emailAddress && checkValidity) {
                    req.context.email_id = emailAddress;
                    req.context.token = token;
                    req.context.user_id = checkValidity.user_id;
                    next();
                    return
                }
            }
            res.status(StatusCode.UNAUTHORIZED).json({
                status: false,
                msg: "Authorization is failed"
            } as ControllerResponseInterFace);
        } else {
            res.status(401).json({
                status: false,
                msg: "Invalid auth attempt"
            } as ControllerResponseInterFace);
        }
    }

    async isAdminLogged(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        const headers: CustomRequest['headers'] = req.headers;
        const token: string | false = utilHelper.getTokenFromHeader(headers['authorization'])


        if (token) {
            if (!req.context) {
                req.context = {}
            }
            req.context.auth_token = token;


            const checkValidity: JwtPayload | string | boolean = await this.tokenHelpers.checkTokenValidity(token);
            console.log(checkValidity);

            if (checkValidity && typeof checkValidity == "object") {
                const emailAddress: string = checkValidity.email || checkValidity.email_address;
                if (emailAddress && checkValidity) {

                    req.context.email_id = emailAddress;
                    req.context.token = token;
                    req.context.user_id = checkValidity.user_id;
                    console.log("Passed");
                    console.log(req.context);
                    next();
                    return
                }
            }
            res.status(StatusCode.UNAUTHORIZED).json({
                status: false,
                msg: "Authorization is failed"
            } as ControllerResponseInterFace);
        } else {
            res.status(StatusCode.UNAUTHORIZED).json({
                status: false,
                msg: "Authorization is failed"
            } as ControllerResponseInterFace);
        }
    }


}
export default AuthMiddleware;

