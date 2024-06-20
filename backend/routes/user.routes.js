import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import { getUsersForSidebar } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", protectRoute, getUsersForSidebar);
router.get("/points", protectRoute, (req, res) => {
  const user = req.user;
  console.log(user.points);
  res.json({ points: user.points.current, history: user.points.history });
});

export default router;
