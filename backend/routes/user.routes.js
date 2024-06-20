import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import { getUsersForSidebar, createImgUrl, createUrlImgForGeneratedImage, editProfile } from "../controllers/user.controller.js";

import { upload } from "../storage/connectS3.js";

const router = express.Router();

router.get("/", protectRoute, getUsersForSidebar);
router.get("/points", protectRoute, (req, res) => {
  const user = req.user;
  console.log(user.points);
  res.json({ points: user.points.current, history: user.points.history });
});

router.put("/profile", protectRoute, editProfile);
router.post("/profileImg", upload.single("image"), protectRoute, createImgUrl);
router.post("/generatedProfileImg", upload.single("image"), protectRoute, createUrlImgForGeneratedImage);

export default router;
