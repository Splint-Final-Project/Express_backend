import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import {
  SignUpForPickle,
  WithdrawFromPickle,
} from "../controllers/participation.controller.js";

const router = express.Router();

// 피클에 신청하기
router.post("/", protectRoute, SignUpForPickle);

//피클 신청 취소하기
//개발용
router.delete("/", WithdrawFromPickle);

export default router;
