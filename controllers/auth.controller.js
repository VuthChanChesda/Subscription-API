import { mongoose } from "mongoose";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.js";

export const signUp = async (req, res ,next) => {

    const session = await mongoose.startSession();
    session.startTransaction(); //operation that update the state are atomic. Update All or nothing
    try {

        //create user
        const { email, password, name } = req.body;
        const existingUser  = await User.findOne({ email });
        if (existingUser) {
            const error = new Error('User already exists');
            error.statusCode = 409;
            throw error;
        }

        //hash password
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await User.create([{name, email, password: hashedPassword}] , {session}); //we add session to the create method to make it atomic mean if it fails it will rollback the transaction
        const token = jwt.sign({userId: newUser[0]._id}, JWT_SECRET , {expiresIn: JWT_EXPIRES_IN}); //attach user id to token
        
        await session.commitTransaction();
        session.endSession();
        res.status(201).json({
            message: 'User created',
            success: true,
            data:{
                user: newUser[0],
                token
            }
        });  
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }

};

export const signIn = async (req, res ,next) => {

    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            const error = new Error('Password is incorrect');
            error.statusCode = 401;
            throw error;
        }
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        res.status(200).json({
            message: 'User signed in',
            success: true,
            data: {
                user,
                token
            }
        });
    }
    catch (error) {
        next(error);
    };
};

export const signOut = async (req, res) => {};