import express from "express";

import {
  getPickles,
  getNearbyPickles,
  getProceedingPickles,
  getPopularPickles,
  getHotTimePickles,
  getFinishedPickles,
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
import { editPickle } from "../controllers/pickle/pickle.edit.controller.js";

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
  deleteReview,
  getReviews,
  postReview,
} from "../controllers/pickle/pickle.review.controller.js";

const router = express.Router();

router.get("/nearby", getNearbyPickles);

// 옵션: 로그인/ 미 로그인 로직 분기
router.get("/", optionalAuth, getPickles);
router.get("/popular", optionalAuth, getPopularPickles);
router.get("/hotTime", optionalAuth, getHotTimePickles);
router.get("/search", optionalAuth, searchPickles);
router.get("/detail/popular", optionalAuth);
router.get("/detail/lowCount", optionalAuth);
router.get("/detail/highCount", optionalAuth);

// 로그인 필수
router.get("/proceeding", protectRoute, getProceedingPickles);
router.get("/finish", protectRoute, getFinishedPickles);

// 동적
router.get("/:id", optionalAuth, getPickleDetails);
router.get("/:id/favorite", optionalAuth, getFavoriteCount);

// not get
router.post("/create", protectRoute, createPickle);
router.put("/:id", protectRoute, editPickle);
router.post("/join", protectRoute, JoinPickle);

//개발용, 피클 참가 취소
router.delete("/join", protectRoute, WithdrawFromPickle);

// 이미지 업로드
router.post("/img", upload.single("image"), createImgUrl);
router.post(
  "/generatedImg",
  upload.single("image"),
  createUrlImgForGeneratedImage
);

//리뷰 달기
router.get("/review", protectRoute, getReviews);
router.post("/:id/review", protectRoute, postReview);
router.delete("/:id/review", protectRoute, deleteReview);

export default router;
