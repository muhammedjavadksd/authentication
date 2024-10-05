import * as Jwt from "jsonwebtoken";
import { JwtTimer } from "../../Datas/Enums";

interface ITokenHelper {
    generateJWtToken: (payload: object, timer: JwtTimer) => Promise<string | null>;
    decodeJWTToken: (jwttoken: string) => Promise<Jwt.Jwt | null>;
    checkTokenValidity: (token: string) => Promise<Jwt.JwtPayload | boolean | string>;
}

export default ITokenHelper