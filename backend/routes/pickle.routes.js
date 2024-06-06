import express from "express";

import {
  getPickles,
  getNearbyPickles,
  getPicklesByStatus,
  getPopularPickles,
  getHotTimePickles,
} from "../controllers/pickle/pickles.get.controller.js";
import { getPickleDetails } from "../controllers/pickle/pickle.get.controller.js";
import { createPickle } from "../controllers/pickle/pickle.create.controller.js";
import { editPickle } from "../controllers/pickle/pickle.edit.controller.js";

import {
  JoinPickle,
  WithdrawFromPickle,
} from "../controllers/pickle/pickle.join.controller.js";

import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/", protectRoute, getPickles);
router.get("/nearby", protectRoute, getNearbyPickles);
router.get("/popular", protectRoute, getPopularPickles);
router.get("/hotTime", protectRoute, getHotTimePickles);

// 동적
router.get("/:id", protectRoute, getPickleDetails);
router.get("/:status", protectRoute, getPicklesByStatus);

// not get
router.post("/create", protectRoute, createPickle);
router.put("/:id", protectRoute, editPickle);
router.post("/join", protectRoute, JoinPickle);
// router.get("/:pickleType", protectRoute, getPicklesOfType);

//개발용, 피클 참가 취소
router.delete("/join", protectRoute, WithdrawFromPickle);

export default router;
