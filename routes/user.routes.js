import { Router } from "express";
import { getAllUsers } from "../controllers/user.controller.js";
import { getUser } from "../controllers/user.controller.js";
import { authorize } from "../middlewares/auth.middlewares.js";

const Userrouter = Router();

Userrouter.get("/", authorize ,getAllUsers);
Userrouter.get("/:id", authorize ,getUser);

Userrouter.post("/", (req, res) => {
    res.send( { title: "Create User" } );
});

Userrouter.put("/:id", (req, res) => {
    res.send( { title: "Update user profile page" } );
});

Userrouter.delete("/:id", (req, res) => {
    res.send( { title: "delete user profile page" } );
});

export default Userrouter;