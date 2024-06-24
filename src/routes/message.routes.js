import express from "express";

import {
  getMessages,
  getMessagesInOneToOne,
  sendMessageOneToOne,
  sendMessage,
} from "../controllers/message.controller.js";
import { spotifyAuth } from "../middleware/spotifyAuth.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/:conversationId", protectRoute, getMessages);
router.get("/:pickleId/:id", protectRoute, getMessagesInOneToOne);

router.post("/send/:conversationId", protectRoute, sendMessage);
router.post("/send/:pickleId/:id", protectRoute, sendMessageOneToOne); // protectRoute에 의해

export default router;
