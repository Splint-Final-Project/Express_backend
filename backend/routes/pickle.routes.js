import express from "express";

import { getPickles, getNearbyPickles, getPicklesByStatus } from "../controllers/pickle/pickles.get.controller.js";
import { getPickleDetails } from "../controllers/pickle/pickle.get.controller.js";
import { createPickle } from "../controllers/pickle/pickle.create.controller.js";
import { editPickle } from "../controllers/pickle/pickle.edit.controller.js";

import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/", protectRoute, getPickles);
router.get("/nearby", protectRoute, getNearbyPickles);
// router.get("/myPickle", protectRoute, getNearbyPickles);

// 동적
router.get("/:id", protectRoute, getPickleDetails);
router.get("/:status", protectRoute, getPicklesByStatus);

// not get
router.post("/create", protectRoute, createPickle);
router.put("/:id", protectRoute, editPickle);
// router.get("/:pickleType", protectRoute, getPicklesOfType);

export default router;