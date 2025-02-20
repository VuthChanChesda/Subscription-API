import { Router } from "express";

const subscriptionRouter = Router();

subscriptionRouter.get("/", (req, res) => {
    res.send( { message: "Get all subscription" } );
});

subscriptionRouter.get("/:id", (req, res) => {
    res.send( { message: "Get subscription Details" } );
});

subscriptionRouter.post("/:id", (req, res) => {
    res.send( { message: "create subscription" } );
});

subscriptionRouter.put("/:id", (req, res) => {
    res.send( { message: "Update subscription" } );
});

subscriptionRouter.delete("/:id", (req, res) => {
    res.send( { message: "Delete subscription" } );
});

subscriptionRouter.get("/user/:id", (req, res) => {
    res.send( { message: "Get all user subscription" } );
});

subscriptionRouter.put("/:id/cancel", (req, res) => {
    res.send( { message: "Cancel subscription" } );
});

subscriptionRouter.get("/upcoming-renewals", (req, res) => {
    res.send( { message: "Get upcoming renewal subscription" } );
});


export default subscriptionRouter;