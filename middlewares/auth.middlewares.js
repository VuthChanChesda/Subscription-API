import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';
import User from '../models/user.model.js';

export const authorize = (req, res, next) => {
    try{
        let token;
        if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
            token = req.headers.authorization.split(" ")[1];
        }
        if(!token){
            return res.status(401).json({
                message: "Not authorized, no token",
                success: false
            });
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = User.findById(decoded.userId);
        if(!user){
            return res.status(401).json({
                message: "Not authorized, no user",
                success: false
            });
        }
        req.user = user;
        next();
    }
    catch(err){
        next(err);
    }

}