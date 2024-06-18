import express from "express";

import { getConversationList } from "../controllers/conversation.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/", protectRoute, getConversationList);
// router.post("/send/:id", protectRoute, sendMessage); // protectRoute에 의해 

export default router;