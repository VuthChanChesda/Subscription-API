import User from "../models/user.model.js";
import Subscription from "../models/subscription.model.js";
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

export const UpdateUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password'); //select -password to not show password in the response
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        // If the user is trying to change their own role, ensure they can't demote themselves
        const { name, email, password} = req.body; 

        if (req.user.id.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to update this user" });
        }

        const existingUser = await User
            .findOne({ email })
            .where('_id')
            .ne(user._id); // Check if the email is already in use by another user
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use" });
        }

        // Update the user details
        user.name = name || user.name;
        user.email = email || user.email;
        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }
        await user.save();
        // Generate a new JWT token for the updated user
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        res.status(200).json({
            message: 'User updated successfully',
            success: true,
            data: user,
            token,
        });
        res.status(200).json({
            message: 'User update successfully',
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
}

export const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }
        if (req.user.id.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to delete this user" });
        }
        // Check if the user has any subscriptions
        const subscriptions = await Subscription.find({ user: user._id });
        if (subscriptions.length > 0) {
            return res.status(400).json({ message: "User has active subscriptions and cannot be deleted" });
        }
        
        await user.remove();
        res.status(200).json({
            message: 'User deleted successfully',
            success: true,
        });
    } catch (error) {
        next(error);
    }
}