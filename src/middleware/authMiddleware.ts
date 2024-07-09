import { NextFunction, Response, Request } from "express";
import { ControllerResponseInterFace, CustomRequest } from "../config/Datas/InterFace";
import const_data from '../config/const'
import { JwtPayload } from "jsonwebtoken";
import utilHelper from "../helper/util/utilHelper";
import TokenHelper from "../helper/token/tokenHelper";
import IAuthMiddleware from "../config/Interface/Middleware/AuthMiddlewareInterface";

let { OTP_TYPE } = const_data;

class AuthMiddleware implements IAuthMiddleware {


    private readonly tokenHelpers;

    constructor() {
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

            if (checkValidity) {
                if (typeof checkValidity == "object") {
                    if (checkValidity.email_id) {
                        if (checkValidity.type == OTP_TYPE.SIGN_UP_OTP || checkValidity.type == OTP_TYPE.SIGN_IN_OTP) {
                            req.context.email_id = checkValidity?.email_id;
                            req.context.token = token;
                            next();
                        } else {
                            res.status(401).json({
                                status: false,
                                msg: "Authorization is failed"
                            } as ControllerResponseInterFace);
                        }
                    } else {
                        res.status(401).json({
                            status: false,
                            msg: "Authorization is failed"
                        } as ControllerResponseInterFace);
                    }
                } else {
                    res.status(401).json({
                        status: false,
                        msg: "Authorization is failed"
                    } as ControllerResponseInterFace);
                }
            } else {
                res.status(401).json({
                    status: false,
                    msg: "Authorization is failed"
                } as ControllerResponseInterFace);
            }
        } else {
            res.status(401).json({
                status: false,
                msg: "Invalid auth attempt"
            } as ControllerResponseInterFace);
        }
    }

    isUserLogged(req: Request, res: Response, next: NextFunction): void {
        next();
    }

    isAdminLogged(req: Request, res: Response, next: NextFunction): void {
        next();
    }

    isOrganizationLogged(req: Request, res: Response, next: NextFunction): void {
        next();
    }
}




export default AuthMiddleware;

