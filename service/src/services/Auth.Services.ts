import jwt from 'jsonwebtoken';

import * as dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

class authService {
    constructor() {

    }
    // generate token with user id
    public generateJWT(_id: string): string {
        return jwt.sign({ _id }, process.env.JWT_SECRET || 'defaultToken', { expiresIn: '1h', algorithm: "HS512", });
    }

    public createCookie(token: string): string {
        return `Authorization=${token}; Path=/; HttpOnly; Max-Age=${60 * 60 * 24 * 7}`;
    }
}

const AuthService = new authService();
export default AuthService;