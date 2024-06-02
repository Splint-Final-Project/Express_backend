import express from "express";
import {
  getMe,
  login,
  logout,
  signup,
  signup2,
} from "../controllers/auth.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/me", protectRoute, getMe);

router.post("/join", signup);

router.put("/join2", signup2);

router.post("/login", login);

router.delete("/logout", logout);

export default router;
