import Subscription  from "../models/subscription.model.js";
import subscriptionValidationSchema from "../validationSchema/subscriptionSchema.js";
import { workflowClient } from "../config/upstash.js"; // Import the workflow client
import {SERVER_URL} from "../config/env.js";
export const createSubscription = async (req, res, next) => {
    try {

        const { error } = subscriptionValidationSchema.validate(req.body, { abortEarly: false });

        if (error) {
            return res.status(400).json({
                message: "Validation error",
                success: false,
                errors: error.details.map((err) => err.message), // Return all validation errors
            });
        }

        const subscription = await Subscription.create({
            ...req.body,
            user: req.user._id,
        });

        const {workflowRunId} = await workflowClient.trigger({
            url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
            body: {
                subscriptionId: subscription._id,
            },
            headers: {
                "Content-Type": "application/json",
            },
            retries: 0,
        })

        res.status(201).json({
            message: "Subscription created successfully",
            success: true ,
            data: { subscription , workflowRunId }
        });
    } catch (error) {
        next(error);
    }
}

export const getUserSubscriptions = async (req, res, next) => {
    try {

        if (!req.params.id) {
            return res.status(400).json({
                message: "User ID is required",
                success: false,
            });
        }

        if (req.user._id.toString() !== req.params.id) {
            const error = new Error("You are not authorized to view this user's subscriptions");
            error.status = 403;
            throw error;
        }

        const subscriptions = await Subscription.find({ user: req.params.id })
            .populate("user", "name email") // Populate user details
     
        res.status(200).json({
            message: "User subscriptions fetched successfully",
            success: true,
            data: subscriptions
        });

    } catch (error) {
        next(error);
    }
}

export const getAllSubscriptions = async (req, res, next) => {
    try {
        const subscriptions = await Subscription.find()
            .populate("user", "name email") // Populate user details
        res.status(200).json({
            message: "All subscriptions fetched successfully",
            success: true,
            data: subscriptions
        });
    } catch (error) {
        next(error);
    }
}

export const getSubscriptionDetails = async (req, res, next) => {
    try {

        const subscription = await Subscription.findById(req.params.id)
            .populate("user", "name email") // Populate user details

        if (!subscription) {
            return res.status(404).json({
                message: "Subscription not found",
                success: false,
            });
        }     
        // Check if the subscription belongs to the logged-in user
        if (subscription.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You are not authorized to view this subscription",
                success: false,
            });
        }

        res.status(200).json({
            message: "Subscription details fetched successfully",
            success: true,
            data: subscription
        });
    } catch (error) {
        next(error);
    }
}
