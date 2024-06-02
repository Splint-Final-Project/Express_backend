import express from "express";

import { getPickles, getNearbyPickles } from "../controllers/pickle/pickle.controller.js";
import { getPicklesByStatus } from "../controllers/pickle/pickles.get.controller.js";
import { createPickle } from "../controllers/pickle/pickle.create.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/", protectRoute, getPickles);
router.get("/nearby", protectRoute, getNearbyPickles);
router.get("/myPickle", protectRoute, getNearbyPickles);

// 동적
router.get("/:status", protectRoute, getPicklesByStatus);

router.post("/create", protectRoute, createPickle);
// router.get("/:pickleType", protectRoute, getPicklesOfType);

export default router;