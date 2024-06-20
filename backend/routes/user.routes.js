import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import { getUsersForSidebar, createImgUrl, createUrlImgForGeneratedImage } from "../controllers/user.controller.js";

import { upload } from "../storage/connectS3.js";

const router = express.Router();

router.get("/", protectRoute, getUsersForSidebar);
router.get("/points", protectRoute, (req, res) => {
  const user = req.user;
  console.log(user.points);
  res.json({ points: user.points.current, history: user.points.history });
});
router.post("/profile", upload.single("image"), protectRoute, createImgUrl);
router.post("/generatedProfile", upload.single("image"), protectRoute, createUrlImgForGeneratedImage)

export default router;
