import express from "express";

import { getMessages, sendMessage } from "../controllers/message.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/:id", protectRoute, getMessages);
router.post("/send/:pickleId/:id", protectRoute, sendMessage); // protectRoute에 의해 

export default router;
