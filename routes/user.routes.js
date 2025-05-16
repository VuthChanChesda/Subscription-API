import { Router } from "express";
import { getAllUsers , createUserByAdmin , getUser,UpdateUser , deleteUser } from "../controllers/user.controller.js";
import { authorize } from "../middlewares/auth.middlewares.js";

const Userrouter = Router();

Userrouter.get("/", authorize("admin") ,getAllUsers);
Userrouter.get("/:id", authorize() ,getUser);

Userrouter.post("/", authorize("admin"), createUserByAdmin);

Userrouter.put("/:id", authorize() ,UpdateUser );

Userrouter.delete("/:id", authorize() ,deleteUser);

export default Userrouter;