import * as Jwt from "jsonwebtoken";

interface ITokenHelper {
    generateJWtToken: (payload: object, timer: string) => Promise<string | null>;
    decodeJWTToken: (jwttoken: string) => Promise<Jwt.Jwt | null>;
    checkTokenValidity: (token: string) => Promise<Jwt.JwtPayload | boolean | string>;
}

export default ITokenHelper