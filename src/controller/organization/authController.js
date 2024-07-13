"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const OrganizationService_1 = __importDefault(require("../../services/OrganizationService/OrganizationService"));
class OrganizationController {
    constructor() {
        this.signInController = this.signInController.bind(this);
        this.signUpController = this.signUpController.bind(this);
        this.forgetPasswordController = this.forgetPasswordController.bind(this);
        this.resetPasswordController = this.resetPasswordController.bind(this);
        this.organizationService = new OrganizationService_1.default();
    }
    signUpController(req, res, next) {
        return;
    }
    signInController(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const email_address = req.body.email_address;
            const password = req.body.password;
            try {
                let signInService = yield this.organizationService.signIn(email_address, password);
                console.log(signInService);
                if (signInService.status) {
                    const responseData = signInService.data;
                    const token = responseData.token;
                    if (token) {
                        res.status(200).json({ status: true, data: { token }, name: responseData.name, msg: "Login success" });
                    }
                    else {
                        res.status(401).json({ status: false, msg: "Something went wrong" });
                    }
                }
                else {
                    res.status(401).json({ status: false, msg: (_a = signInService === null || signInService === void 0 ? void 0 : signInService.msg) !== null && _a !== void 0 ? _a : "Something went wrong" });
                }
            }
            catch (e) {
                console.log(e);
                res.status(500).json({ status: false, msg: "Internal server error" });
            }
        });
    }
    forgetPasswordController(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const email_address = req.body.email_address;
            try {
                const organizationForgetPassword = yield this.organizationService.forgetPasswordHelper(email_address);
                if (organizationForgetPassword.status) {
                    res.status(200).json({ status: true, data: { token: organizationForgetPassword.data.token } });
                }
                else {
                    res.status(organizationForgetPassword.statusCode).json({ status: false, msg: (_a = organizationForgetPassword.msg) !== null && _a !== void 0 ? _a : "Something went wrong" });
                }
            }
            catch (e) {
                console.log(e);
                res.status(500).json({ status: false, msg: "Internal server error" });
            }
        });
    }
    resetPasswordController(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const context = req.context;
            console.log(context);
            if (context && context.email_id && context.email_id) {
                try {
                    const password = req.body.password;
                    const token = context.token;
                    const resetPassword = yield this.organizationService.resetPassword(token, password);
                    if (resetPassword.status) {
                        res.status(200).json({ status: true });
                    }
                    else {
                        res.status(resetPassword.statusCode).json({ status: false, msg: resetPassword.msg });
                    }
                }
                catch (e) {
                    console.log(e);
                    res.status(500).json({ status: false, msg: "Internal server error" });
                }
            }
            else {
                res.status(401).json({ status: false, msg: "Invalid authentication" });
            }
        });
    }
}
exports.default = OrganizationController;
