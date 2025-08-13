import express from "express";
import { sendInterviewInvitation } from "../controllers/interviewController.js";

const router = express.Router();

router.post("/send", sendInterviewInvitation);

export default router;
