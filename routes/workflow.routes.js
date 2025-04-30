import { Router } from "express";
import {sendReminder} from "../controllers/workflow.controller.js";

const workflowRoutes = Router();

workflowRoutes.post("/subscription/reminder", sendReminder);

export default workflowRoutes;