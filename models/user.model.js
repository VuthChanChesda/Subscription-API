import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    name:{
            type: String,
            required:[true , "Name is required"] ,
            trim: true,
            minLength: [3, "Name must be at least 3 characters long"],
            maxLength: [20, "Name must be at most 20 characters long"],
        },
    email:{
            type: String,
            required:[true , "Email is required"] ,
            unique: true,
            trim: true,
            match:[/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, "Email is not valid"],
        },
    password:{
            type: String,
            required:[true , "Password is required"] ,
            minLength: [6, "Password must be at least 6 characters long"],
        },


} , {timestamps: true}); //timestamps: true will automatically add createdAt and updatedAt fields

const User = mongoose.model("User", userSchema);

export default User;