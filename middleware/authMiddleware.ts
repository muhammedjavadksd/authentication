import { NextFunction, Response } from "express";
import { ControllerInterFace, ControllerResponseInterFace, CustomRequest } from "../config/Datas/InterFace";
import const_data from '../config/const'
import tokenHelper from "../helper/tokenHelper";
import { JwtPayload } from "jsonwebtoken";
import utilHelper from "../helper/utilHelper";
import authAdminHelper from "../helper/authAdminHelper";

let { OTP_TYPE } = const_data;


const authMiddleware: ControllerInterFace = {
    isValidSignUpTrying: async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {

        const headers: CustomRequest['headers'] = req.headers;
        const token: string | false = authAdminHelper.getTokenFromHeader(headers['authorization'])

        if (token) {
            if (!req.context) {
                req.context = {}
            }
            req.context.auth_token = token;
            const checkValidity: JwtPayload | string | boolean = await tokenHelper.checkTokenValidity(token);
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
    },

    isUserLogged: (req, res, next) => {
        next();
    },

    isAdminLogged: (req, res, next) => {
        next();
    },

    isOrganizationLogged: (req, res, next) => {
        next();
    }
};

export default authMiddleware;

