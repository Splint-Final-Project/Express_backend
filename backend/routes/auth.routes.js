import express from "express";
import axios from "axios";
import {
  getMe,
  login,
  logout,
  signup,
  signup2,
} from "../controllers/auth.controller.js";
import protectRoute from "../middleware/protectRoute.js";
import User from "../models/user.model.js";
import generateToken from "../utils/generateToken.js";
import qs from "qs";

const router = express.Router();

router.get("/me", protectRoute, getMe);

router.post("/join", signup);

router.put("/join2", signup2);

router.post("/login", login);

router.delete("/logout", logout);

//callbackes from oauth providers
router.get("/oauth/:provider", async (req, res) => {
  try {
    const { code } = req.query;
    const provider = req.params.provider;
    let tokenUrl, userInfoUrl, oauthType;

    if (provider === "kakao") {
      tokenUrl = "https://kauth.kakao.com/oauth/token";
      userInfoUrl = "https://kapi.kakao.com/v2/user/me";
      oauthType = "kakao";
    } else if (provider === "naver") {
      tokenUrl = "https://nid.naver.com/oauth2.0/token";
      userInfoUrl = "https://openapi.naver.com/v1/nid/me";
      oauthType = "naver";
    } else {
      throw new Error("Invalid provider");
    }

    const result = await axios.post(
      tokenUrl,
      qs.stringify({
        grant_type: "authorization_code",
        client_id:
          provider === "kakao"
            ? process.env.KAKAO_CLIENT_ID
            : process.env.NAVER_CLIENT_ID,
        client_secret:
          provider === "kakao"
            ? process.env.KAKAO_CLIENT_SECRET
            : process.env.NAVER_CLIENT_SECRET,
        // redirectUri: `http://localhost:8080/api/v1/user/oauth/${provider}`,
        code: code,
      }),
      { "content-type": "application/x-www-form-urlencoded" }
    );

    const token = result.data.access_token;
    const userInfo = await axios.get(userInfoUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const oauthId =
      provider === "kakao" ? userInfo.data.id : userInfo.data.response.id;

    const found = await User.findOne({
      oauthType: oauthType,
      oauthId: oauthId,
    });
    if (found) {
      generateToken(found._id, res);
      // 로그인
      res.redirect(
        `${process.env.FRONTEND_URL}/oauth/success?status=${found.status}&nickname=${found.nickname}&profilePic=${found.profilePic}&occupation=${found.occupation}&_id=${found._id}&oauthType=${found.oauthType}&oauthId=${found.oauthId}`
      );
    } else {
      // 회원가입
      const newUser = new User({
        oauthType: oauthType,
        oauthId: oauthId,
      });
      await newUser.save();
      console.log("회원가입 완료");

      generateToken(newUser._id, res);
      res.redirect(
        `${process.env.FRONTEND_URL}/oauth/success?status=${newUser.status}&nickname=${newUser.nickname}&profilePic=${newUser.profilePic}&occupation=${newUser.occupation}&_id=${newUser._id}&oauthType=${newUser.oauthType}&oauthId=${newUser.oauthId}`
      );
    }
  } catch (error) {
    console.log(error);
    // res.status(500).json(error);
  }
});

export default router;
