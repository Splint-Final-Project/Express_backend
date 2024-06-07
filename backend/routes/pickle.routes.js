import express from "express";

import {
  getPickles,
  getNearbyPickles,
  getProceedingPickles,
  getPopularPickles,
  getHotTimePickles,
  getFinishedPickles,
} from "../controllers/pickle/pickles.get.controller.js";
import { getPickleDetails } from "../controllers/pickle/pickle.get.controller.js";
import { createPickle } from "../controllers/pickle/pickle.create.controller.js";
import { editPickle } from "../controllers/pickle/pickle.edit.controller.js";

import {
  JoinPickle,
  WithdrawFromPickle,
} from "../controllers/pickle/pickle.join.controller.js";
import { searchPickles } from "../controllers/pickle/pickle.search.controller.js";

import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/", getPickles);
router.get("/nearby", getNearbyPickles);
router.get("/popular", getPopularPickles);
router.get("/hotTime", getHotTimePickles);
router.get("/search", searchPickles);

// 로그인 필수
router.get("/proceeding", protectRoute, getProceedingPickles);
router.get("/finish", protectRoute, getFinishedPickles);

// 동적
router.get("/:id", getPickleDetails);

// not get
router.post("/create", protectRoute, createPickle);
router.put("/:id", protectRoute, editPickle);
router.post("/join", protectRoute, JoinPickle);

//개발용, 피클 참가 취소
router.delete("/join", protectRoute, WithdrawFromPickle);

export default router;
