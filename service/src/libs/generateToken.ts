import jwt from 'jsonwebtoken';

import * as dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

class generateToken {
    constructor() {

    }
    // generate token with user id
    public generateJWT(userId: string): string {
        return jwt.sign({ userId }, process.env.JWT_SECRET || 'defaultToken', { expiresIn: '1h', algorithm: "HS512", });
    }
}

const generateTokene = new generateToken();
export default generateTokene;