import { NextFunction, Response, Request } from "express";
import { ControllerResponseInterFace, CustomRequest } from "../config/Datas/InterFace";
import const_data from '../config/const'
import { JwtPayload } from "jsonwebtoken";
import utilHelper from "../helper/utilHelper";
import TokenHelper from "../helper/tokenHelper";
import IAuthMiddleware from "../config/Interface/Middleware/AuthMiddlewareInterface";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { string } from "joi";

const { OTP_TYPE } = const_data;

class AuthMiddleware implements IAuthMiddleware {


    private readonly tokenHelpers;

    constructor() {

        this.isAdminLogged = this.isAdminLogged.bind(this)
        this.isOrganizationLogged = this.isOrganizationLogged.bind(this)
        this.isUserLogged = this.isUserLogged.bind(this)
        this.isValidSignUpAttempt = this.isValidSignUpAttempt.bind(this)
        this.isValidResetPasswordForOrganization = this.isValidResetPasswordForOrganization.bind(this);
        this.tokenHelpers = new TokenHelper();
    }

    async isValidResetPasswordForOrganization(req: CustomRequest, res: Response<any, Record<string, any>>, next: NextFunction): Promise<void> {

        // const headers: CustomRequest['headers'] = req.headers;
        const token: string = req.params.token //utilHelper.getTokenFromHeader(headers['authorization'])
        console.log(token);

        if (token) {
            if (!req.context) {
                req.context = {}
            }
            req.context.auth_token = token;

            const checkValidity: JwtPayload | string | boolean = await this.tokenHelpers.checkTokenValidity(token);

            if (checkValidity) {
                if (typeof checkValidity == "object") {
                    if (checkValidity.email_id) {
                        if (checkValidity.type == OTP_TYPE.ORGANIZATION_FORGET_PASSWORD) {
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

    async isValidSignUpAttempt(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {



        const headers: CustomRequest['headers'] = req.headers;
        const token: string | false = utilHelper.getTokenFromHeader(headers['authorization'])

        console.log(token);

        console.log("TOken is");

        console.log(headers['authorization']);



        if (token) {
            if (!req.context) {
                req.context = {}
            }
            req.context.auth_token = token;

            const checkValidity: JwtPayload | string | boolean = await this.tokenHelpers.checkTokenValidity(token);
            console.log("Validity");

            console.log(checkValidity);



            if (checkValidity) {
                if (typeof checkValidity == "object") {
                    if (checkValidity.email) { //email id for sign in, may diff for sign up
                        if (checkValidity.type == OTP_TYPE.SIGN_UP_OTP || checkValidity.type == OTP_TYPE.SIGN_IN_OTP) {
                            req.context.email_id = checkValidity?.email;
                            req.context.token = token;
                            console.log("Passed");

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

    async isUserLogged(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {

        const headers: CustomRequest['headers'] = req.headers;
        const token: string | false = utilHelper.getTokenFromHeader(headers['authorization'])
        console.log("The token is :" + token);

        if (token) {
            if (!req.context) {
                req.context = {}
            }
            req.context.auth_token = token;


            const checkValidity: JwtPayload | string | boolean = await this.tokenHelpers.checkTokenValidity(token);
            console.log(checkValidity);

            if (checkValidity) {
                if (typeof checkValidity == "object") {
                    const emailAddress: string = checkValidity.email || checkValidity.email_address;
                    if (emailAddress) {
                        if (checkValidity) {
                            req.context.email_id = emailAddress;
                            req.context.token = token;
                            req.context.user_id = checkValidity.user_id;
                            console.log("Passed");
                            console.log(req.context);
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

    async isAdminLogged(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        const headers: CustomRequest['headers'] = req.headers;
        const token: string | false = utilHelper.getTokenFromHeader(headers['authorization'])
        console.log("The token is :" + token);

        if (token) {
            if (!req.context) {
                req.context = {}
            }
            req.context.auth_token = token;


            const checkValidity: JwtPayload | string | boolean = await this.tokenHelpers.checkTokenValidity(token);
            console.log(checkValidity);

            if (checkValidity) {
                if (typeof checkValidity == "object") {
                    const emailAddress: string = checkValidity.email || checkValidity.email_address;
                    if (emailAddress) {
                        if (checkValidity) {
                            req.context.email_id = emailAddress;
                            req.context.token = token;
                            req.context.user_id = checkValidity.user_id;
                            console.log("Passed");
                            console.log(req.context);
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

    isOrganizationLogged(req: Request, res: Response, next: NextFunction): void {
        next();
    }



}




export default AuthMiddleware;

