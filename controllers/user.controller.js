import User from "../models/user.model.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.js";
import jwt from "jsonwebtoken";


export const getAllUsers = async (req, res, next) => {

    try {
        const users = await User.find();
        res.status(200).json({
            message: 'Users fetched successfully',
            success: true,
            data: users
        });
    } catch (error) {
        next(error);
    }    

}

export const getUser = async (req, res, next) => {
    
    try {
        const user = await User.findById(req.params.id).select('-password'); //select -password to not show password in the response
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({
            message: 'User fetched successfully',
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }    

}

export const createUserByAdmin = async (req, res, next) => {

    const session = await mongoose.startSession();
    session.startTransaction(); //operation that update the state are atomic. Update All or nothing
    try{
        
        const { name, email, password, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Ensure only admins can assign the "admin" role
        //we get user role from req.user.role when we use the authorize middleware
        const newRole = req.user.role === "admin" && role === "admin" ? "admin" : "user";

        // Create a new user
        const user = await User.create([{
            name,
            email,
            password: hashedPassword,
            role: newRole,
        }],{session});

        // Generate a JWT token for the new user
        const token = jwt.sign({ userId: user[0]._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        await session.commitTransaction();
        session.endSession();
        res.status(201).json({
            message: 'User created successfully',
            success: true,
            data: user,
            token,
        });
    }
    catch(error){
        await session.abortTransaction();
        session.endSession();
        next(error);
    }



}