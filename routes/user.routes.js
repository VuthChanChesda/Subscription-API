import { Router } from "express";

const Userrouter = Router();

Userrouter.get("/", (req, res) => {
    res.send( { title: "Get all users" } );
});

Userrouter.get("/:id", (req, res) => {
    res.send( { title: "User profile page" } );
});

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