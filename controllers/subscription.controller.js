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

        //Update the subscription with the workflowRunId
        subscription.workflowRunId = workflowRunId;
        await subscription.save();



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
        if (subscriptions.length === 0) {
            return res.status(404).json({
                message: "No subscriptions found for this user",
                success: false,
            });
        }
     
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

export const updateSubscription = async (req, res, next) => {
    try {
        const { error } = subscriptionValidationSchema.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(400).json({
                message: "Validation error",
                success: false,
                errors: error.details.map((err) => err.message), // Return all validation errors
            });
        }
        // Find the subscription and ensure it belongs to the logged-in user
        const subscription = await Subscription.findOne({
            _id: req.params.id,
            user: req.user._id, // Ensure the subscription belongs to the logged-in user
        }).populate("user", "name email");

        if (!subscription) {
            return res.status(404).json({
                message: "Subscription not found",
                success: false,
            });
        }

        // Update the subscription
        const updatedSubscription = await Subscription.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true } // Return the updated document and run validators
        );

        // Trigger the workflow again if needed
        if (req.body.renewalDate || req.body.frequency || req.body.startDate) {
            const { workflowRunId } = await workflowClient.trigger({
                url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
                body: {
                    subscriptionId: updatedSubscription._id,
                },
                headers: {
                    "Content-Type": "application/json",
                },
                retries: 0,
            });
            console.log("Workflow triggered with ID:", workflowRunId);
        }

        // Return the updated subscription
        res.status(200).json({
            message: "Subscription updated successfully",
            success: true,
            data: updatedSubscription
        });

    }
    catch (error) {
        next(error);
    }
}

export const DeleteSubscription = async (req, res, next) => {
    try {
        // Find the subscription and ensure it belongs to the logged-in user
        const subscription = await Subscription.findOne({
            _id: req.params.id,
            user: req.user._id, // Ensure the subscription belongs to the logged-in user
        }).populate("user", "name email");
        if (!subscription) {
            return res.status(404).json({
                message: "Subscription not found",
                success: false,
            });
        }
        // Cancel the workflow if it exists
        const workflowRunId = subscription.workflowRunId;
        console.log("WorkflowRunId to cancel:", workflowRunId);

        if (workflowRunId) {
            await workflowClient.cancel({ids: workflowRunId});
            console.log("Workflow cancelled with ID:", workflowRunId);
        }

        const DeleteSubscription = await Subscription.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Subscription deleted successfully",
            success: true,
        });
    } catch (error) {
        next(error);
    }
}

export const cancelSubscription = async (req, res, next) => {
    try {
        // Find the subscription and ensure it belongs to the logged-in user
        const subscription = await Subscription.findOne({
            _id: req.params.id,
            user: req.user._id, // Ensure the subscription belongs to the logged-in user
        }).populate("user", "name email");
        if (!subscription) {
            return res.status(404).json({
                message: "Subscription not found",
                success: false,
            });
        }
        if (subscription.status === 'cancelled') {
            return res.status(400).json({
                message: "Subscription is already cancelled",
                success: false,
            });
        }
        // Check if the subscription is already expired
        if (subscription.status === 'expired') {
            return res.status(400).json({
                message: "Subscription is already expired",
                success: false,
            });
        }
        // Cancel the workflow if it exists
        const workflowRunId = subscription.workflowRunId;
        console.log("WorkflowRunId to cancel:", workflowRunId);

        if (workflowRunId) {
            await workflowClient.cancel({ids: workflowRunId});
            console.log("Workflow cancelled with ID:", workflowRunId);
        }

        // Update the subscription status to 'cancelled'
        subscription.status = 'cancelled';
        await subscription.save();

        res.status(200).json({
            message: "Subscription cancelled successfully",
            success: true,
            data: subscription
        });
    } catch (error) {
        next(error);
    }
}

export const getUpcomingRenewals = async (req, res, next) => {
    try {

        const userId = req.user._id; 

        const upcomingRenewals = await Subscription.find({
            user: userId, // Only own user's subscriptions
            renewalDate: { $gte: new Date() },
            status: 'active'
        })
            .populate("user", "name email")
            .sort({ renewalDate: 1 });

        if (upcomingRenewals.length === 0) {
            return res.status(404).json({
                message: "No upcoming renewals found",
                success: false,
            });
        }

        res.status(200).json({
            message: "Upcoming renewals fetched successfully",
            success: true,
            data: upcomingRenewals
        });
    } catch (error) {
        next(error);
    }
}