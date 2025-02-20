import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({

    name:{
            type: String,
            required:[true , "subscription is required"] ,
            trim: true,
            minLength: 3,
            maxLength: 200,
        },
    price:{
            type: Number,
            required:[true , "Subscription price is required"] ,
            min: [0, "Subscription price must be at least 0"],
        },
    currency:{
            type: String,
            enum: ["USD", "EUR", "GBP"],
            default: "USD",
        },
    frequency:{
            type: String,
            enum: ["daily", "weekly", "monthly", "yearly"],
            default: "monthly",
        },
    category:{
            type: String,
            enum: ["food", "clothing", "electronics", "books", "other"],
            required: [true, "Category is required"],
            default: "other",
        },
    paymentMethod:{
            type: String,
            required: [true, "Payment method is required"],
            trim: true,
        },
    status:{
            type: String,
            enum: ["active", "cancelled", "expired"],
            default: "active",
        },
    startDate:{
            type: Date,
            required: [true, "Start date is required"],
            validate: {
                validator:(value) => value <= new Date(),
                message: "Start date must be in the past",
            },
        },
    renewalDate:{
            type: Date,
            validate: {
                validator:function (value) {
                   return value > this.startDate
                },
                message: "Renewal date must be in the future",
            },
        },
    user:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User is required"],
            index: true,
        },



}, {timestamps: true}); //timestamps: true will automatically add createdAt and updatedAt fields

//if renewalDate is not provided, calculate it based on the startDate and frequency
subscriptionSchema.pre("save", function(next) {

    if(!this.renewalDate){
        const renewalPeriod = {
            daily: 1,
            weekly: 7,
            monthly: 30,
            yearly: 365,
        };
        this.renewalDate = new Date(this.startDate);
        this.renewalDate.setDate(this.renewalDate.getDate() + renewalPeriod[this.frequency]);
    }

    //auto update the status to expired if renewalDate has passed
    if(this.renewalDate < new Date()){
        this.renewalDate = new Date();
        this.status = "expired";
    }

    next();

}); //this is a mongoose middleware that will run before saving a document

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;