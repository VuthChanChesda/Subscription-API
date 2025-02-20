import { Router } from "express";
import { signUp, signIn, signOut } from "../controllers/auth.controller.js";

const Authrouter = Router();

// path is /api/v1/auth/sign-up
Authrouter.post("/sign-up", signUp);
Authrouter.post("/sign-in", signIn);
Authrouter.post("/sign-out", signOut);

export default Authrouter;