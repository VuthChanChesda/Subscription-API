import mongoose from "mongoose";

import { DB_URL, NODE_ENV } from "../config/env.js";

if(!DB_URL){
    throw new Error("DB_URL is not provided in the environment variables");
}

const connectDB = async () => {
    try {
        await mongoose.connect(DB_URL);
        console.log(`MongoDB connected: ${NODE_ENV} mode`);
    } catch (error) {
        console.error("MongoDB connection failed");
        console.error(error);
    }
}; 

export default connectDB;