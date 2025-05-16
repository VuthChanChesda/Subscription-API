import { Router } from "express";
import{
    createSubscription,
    getUserSubscriptions,
    getAllSubscriptions,
    getSubscriptionDetails,
    updateSubscription,
    DeleteSubscription,
    cancelSubscription,
    getUpcomingRenewals
    }  from "../controllers/subscription.controller.js";
import { authorize } from "../middlewares/auth.middlewares.js";

const subscriptionRouter = Router();

subscriptionRouter.get("/upcoming-renewals", authorize(), getUpcomingRenewals);

subscriptionRouter.get("/user/:id", authorize(), getUserSubscriptions);

subscriptionRouter.put("/:id/cancel", authorize(), cancelSubscription);

subscriptionRouter.get("/", authorize("admin"), getAllSubscriptions);

subscriptionRouter.get("/:id", authorize(), getSubscriptionDetails);

subscriptionRouter.post("/", authorize(), createSubscription);

subscriptionRouter.put("/:id", authorize(), updateSubscription);

subscriptionRouter.delete("/:id", authorize(), DeleteSubscription);


export default subscriptionRouter;