import express from "express";
import {
  getMe,
  login,
  logout,
  signup,
  signup2,
} from "../controllers/auth.controller.js";
import protectRoute from "../middleware/protectRoute.js";
import axios from "axios";
import User from "../models/user.model.js";
import generateToken from "../utils/generateToken.js";

const router = express.Router();

router.get("/me", protectRoute, getMe);

router.post("/join", signup);

router.put("/join2", signup2);

router.post("/login", login);

router.delete("/logout", logout);

router.get("/oauth/github", async (req, res) => {
  try {
    const { code } = req.query;
    const result = await axios({
      url: "https://github.com/login/oauth/access_token",
      method: "POST",
      data: {
        client_id: process.env.GIT_CLIENT_ID,
        client_secret: process.env.GIT_CLIENT_SECRET,
        code: code,
      },
    });
    const accessToken = result.data.split("=")[1].split("&")[0];
    const userInfo = await axios({
      url: "https://api.github.com/user",
      method: "get",
      headers: {
        Authorization: `token ${accessToken}`,
      },
    });
    console.log("user info received from github");

    // 깃허브id가 유저목록db 검색해서 나오면 바로 로그인 jwt 발급, fe 홈으로 리다이렉트
    // 없으면 JSON으로 정보 넘기면서 fe의 회원가입 추가정보입력 페이지로 이동,
    const found = await User.findOne({
      oauthType: "github",
      oauthId: userInfo.data.id,
    });
    if (found) {
      generateToken(found._id, res);
      // 로그인
      res.redirect(
        `http://localhost:4000/oauth/success?status=${found.status}&nickname=${found.nickname}&profilePic=${found.profilePic}&occupation=${found.occupation}&_id=${found._id}&oauthType=${found.oauthType}&oauthId=${found.oauthId}`
      );
    } else {
      // 회원가입
      const newUser = new User({
        oauthType: "github",
        oauthId: userInfo.data.id,
      });
      await newUser.save();
      console.log("회원가입 완료");

      generateToken(newUser._id, res);
      res.redirect(
        `http://localhost:4000/oauth/success?status=${newUser.status}&nickname=${newUser.nickname}&profilePic=${newUser.profilePic}&occupation=${newUser.occupation}&_id=${newUser._id}&oauthType=${newUser.oauthType}&oauthId=${newUser.oauthId}`
      );
    }
  } catch (error) {
    console.log(error);
    // res.status(500).json(error);
  }
});

export default router;
