import { Router } from "express";
import {createSubscription , getUserSubscriptions , getAllSubscriptions , getSubscriptionDetails}  from "../controllers/subscription.controller.js";
import { authorize } from "../middlewares/auth.middlewares.js";

const subscriptionRouter = Router();

subscriptionRouter.get("/", authorize("admin") , getAllSubscriptions);

subscriptionRouter.get("/:id", authorize() , getSubscriptionDetails);

subscriptionRouter.post("/", authorize() ,createSubscription);

subscriptionRouter.put("/:id", (req, res) => {
    res.send( { message: "Update subscription" } );
});

subscriptionRouter.delete("/:id", (req, res) => {
    res.send( { message: "Delete subscription" } );
});

subscriptionRouter.get("/user/:id", authorize() , getUserSubscriptions);

subscriptionRouter.put("/:id/cancel", (req, res) => {
    res.send( { message: "Cancel subscription" } );
});

subscriptionRouter.get("/upcoming-renewals", (req, res) => {
    res.send( { message: "Get upcoming renewal subscription" } );
});


export default subscriptionRouter;