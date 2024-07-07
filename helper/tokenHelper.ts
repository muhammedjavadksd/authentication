import * as jwt from "jsonwebtoken";
import * as constant_data from "../config/const";

interface TokenHelper {
    createJWTToken: (payload: object, timer: string) => Promise<string | null>;
    decodeJWTToken: (jwttoken: string) => Promise<any | null>;
    checkTokenValidity: (token: string) => Promise<jwt.JwtPayload | boolean | string>;
}

const tokenHelper: TokenHelper = {
    createJWTToken: async (payload: object = {}, timer: string): Promise<string | null> => {
        try {
            const jwtToken: string = await jwt.sign(payload, process.env.JWT_SECRET!, { algorithm: "HS256", expiresIn: timer });
            return jwtToken;
        } catch (e) {
            console.log(e);
            return null;
        }
    },

    decodeJWTToken: async (jwttoken: string): Promise<jwt.Jwt | null> => {
        try {
            const decode: jwt.Jwt | null = await jwt.decode(jwttoken, { complete: true });
            return decode;
        } catch (e) {
            return null;
        }
    },

    checkTokenValidity: async (token: string): Promise<jwt.JwtPayload | boolean | string> => {
        try {
            const checkValidity: jwt.JwtPayload | string = await jwt.verify(token, process.env.JWT_SECRET!);
            return checkValidity;
        } catch (e) {
            return false;
        }
    }
};

export default tokenHelper;

