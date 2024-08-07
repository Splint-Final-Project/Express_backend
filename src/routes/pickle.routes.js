import express from "express";

import {
  getPickles,
  getNearbyPickles,
  getProceedingPickles,
  getPopularPickles,
  getHotTimePickles,
  getFinishedPickles,
  getPendingPickles,
} from "../controllers/pickle/pickles.get.controller.js";
import {
  getPickleDetails,
  getFavoriteCount,
} from "../controllers/pickle/pickle.get.controller.js";
import {
  createPickle,
  createImgUrl,
  createUrlImgForGeneratedImage,
} from "../controllers/pickle/pickle.create.controller.js";
import { editPickle, pickleViewCountUp } from "../controllers/pickle/pickle.edit.controller.js";

import {
  JoinPickle,
  WithdrawFromPickle,
} from "../controllers/pickle/pickle.join.controller.js";
import { searchPickles } from "../controllers/pickle/pickle.search.controller.js";

// middleware
import protectRoute from "../middleware/protectRoute.js";
import optionalAuth from "../middleware/optionalAuth.js";

// storage
import { upload } from "../storage/connectS3.js";
import {
  // deleteReview,
  getReviews,
  postReview,
} from "../controllers/pickle/pickle.review.controller.js";
import { pickleAttendance } from "../controllers/pickle/pickle.attendance.controller.js";

const router = express.Router();

router.get("/nearby", getNearbyPickles);

// 옵션: 로그인/ 미 로그인 로직 분기
router.get("/", optionalAuth, getPickles);
router.get("/popular", optionalAuth, getPopularPickles);
router.get("/hotTime", optionalAuth, getHotTimePickles);
router.get("/search", optionalAuth, searchPickles);

// 로그인 필수
router.get("/proceeding", protectRoute, getProceedingPickles);
router.get("/finish", protectRoute, getFinishedPickles);
router.get("/pending", protectRoute, getPendingPickles);

//리뷰 달기
router.get("/reviews", protectRoute, getReviews);
router.post("/:id/review", protectRoute, postReview);
// router.delete("/:id/review", protectRoute, deleteReview);

//출첵
router.post("/:id/attendance", protectRoute, pickleAttendance);

// 동적
router.get("/:id", optionalAuth, getPickleDetails);
router.get("/:id/favorite", optionalAuth, getFavoriteCount);

// not get
router.post("/create", protectRoute, createPickle);
router.put("/:id", protectRoute, editPickle);
router.post("/join", protectRoute, JoinPickle);
router.put("/:id/viewCountUp", pickleViewCountUp);

//개발용, 피클 참가 취소
router.delete("/join", protectRoute, WithdrawFromPickle);

// 이미지 업로드
router.post("/img", upload.single("image"), createImgUrl);
router.post(
  "/generatedImg",
  upload.single("image"),
  createUrlImgForGeneratedImage
);

//개발용, 피클 참가 취소
router.delete("/join", protectRoute, WithdrawFromPickle);

export default router;
