import express from "express";

import { getPickles, getNearbyPickles } from "../controllers/pickle/pickle.controller.js";
import { createPickle } from "../controllers/pickle/pickle.create.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/", protectRoute, getPickles);
router.post("/create", protectRoute, createPickle);
router.get("/nearby", protectRoute, getNearbyPickles);
// router.get("/:pickleType", protectRoute, getPicklesOfType);

export default router;