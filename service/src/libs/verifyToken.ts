import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface IPayload {
    _id: string;
    iat: number;
    exp: number;
}

class ValidationToken {
    constructor() { }
    TokenValidation = (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.header('Authorization');
            const bearer: any = token?.split(' ')
            console.log(bearer)
            let bearerToken: any = []
            if (bearer.length != 2) {
                bearerToken = bearer[0]
            } else {
                bearerToken = bearer[1]
            }
            if (!bearerToken) return res.status(401).json('Access Denied');
            const payload = jwt.verify(bearerToken, process.env['SECRET_TOKEN'] || 'tokena') as IPayload;
            req.body = payload._id;
            console.log(req.body)
            next();
        } catch (e) {
            res.status(400).send('Invalid Token');
        }
    }
}

const validationToken = new ValidationToken()
export default validationToken

