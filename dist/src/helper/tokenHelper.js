"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = __importStar(require("jsonwebtoken"));
class TokenHelper {
    constructor() {
        this.checkTokenValidity = this.checkTokenValidity.bind(this);
        this.decodeJWTToken = this.decodeJWTToken.bind(this);
        this.generateJWtToken = this.generateJWtToken.bind(this);
    }
    generateJWtToken() {
        return __awaiter(this, arguments, void 0, function* (payload = {}, timer) {
            try {
                const jwtToken = yield jwt.sign(payload, process.env.JWT_SECRET, { algorithm: "HS256", expiresIn: timer });
                return jwtToken;
            }
            catch (e) {
                console.log(e);
                return null;
            }
        });
    }
    decodeJWTToken(jwttoken) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const decode = yield jwt.decode(jwttoken, { complete: true });
                return decode;
            }
            catch (e) {
                return null;
            }
        });
    }
    checkTokenValidity(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const checkValidity = yield jwt.verify(token, process.env.JWT_SECRET);
                return checkValidity;
            }
            catch (e) {
                return false;
            }
        });
    }
}
exports.default = TokenHelper;
