import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import generateToken from "../utils/generateToken.js";
import Verification from "../models/verification.model.js";
import axios from "axios";
import qs from "qs";
import nodemailer from "nodemailer";

export const oauth = async (req, res) => {
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
        `${process.env.FRONTEND_URL}/oauth/success?status=${found.status}&nickname=${found.nickname}&profilePic=${found.profilePic}&areaCodes=${found.areaCodes}&_id=${found._id}&oauthType=${found.oauthType}&oauthId=${found.oauthId}`
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
        `${process.env.FRONTEND_URL}/oauth/success?status=${newUser.status}&nickname=${newUser.nickname}&profilePic=${newUser.profilePic}&areaCodes=${newUser.areaCodes}&_id=${newUser._id}&oauthType=${newUser.oauthType}&oauthId=${newUser.oauthId}`
      );
    }
  } catch (error) {
    console.log(error);
    // res.status(500).json(error);
  }
};

export const emailVerify = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });
  try {
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email))
      return res.status(400).json({ error: "Invalid email format" });
    const user = await User.findOne({
      email,
    });
    if (user) {
      return res.status(400).json({
        error: "User already exists",
      });
    }
    await Verification.deleteMany({ email });
    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    const newVerification = new Verification({
      email,
      verificationCode,
    });
    await newVerification.save();

    console.log("Email: ", email);
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: '"피클타임 운영팀 👻" <vinoankr@gmail.com>', // sender address
      to: email, // list of receivers
      subject: "피클타임 이메일 인증", // Subject line
      text: `이메일 인증 코드: ${verificationCode}`, // plain text body
      html: `<h1>이메일 인증 코드: ${verificationCode}<h1>`, // html body
    });
    console.log("Message sent: %s", info.messageId);
    res.status(200).json({
      message: "Email is available",
    });
  } catch (error) {
    console.log("Error in emailVerify controller", error.message);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

export const signup = async (req, res) => {
  try {
    const { email, verify, password, checkPassword } = req.body;

    if (password !== checkPassword) {
      return res.status(400).json({ error: "Passwords don't match" });
    }

    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }

    const verification = await Verification.findOne({
      email,
      verificationCode: verify,
    });

    if (!verification) {
      return res.status(400).json({ error: "Invalid verification code" });
    }

    const salt = await bcrypt.genSalt(10); // 해싱을 통해 비밀번호 해싱 추적을 어렵게
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      password: hashedPassword,
    });

    if (newUser) {
      // Generate JWT token here
      // generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();

      generateToken(newUser._id, res);
      res.status(201).json({
        message: "회원가입 성공, 추가정보 입력 페이지로 리다이렉트합니다.",
        user: {
          _id: newUser._id,
          email: newUser.email,
          status: newUser.status,
        },
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log("Error in signup controller", err.message);
  }
};

export const signup2 = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res
        .status(401)
        .json({ error: "Unauthorized - No Token Provided" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ error: "Unauthorized - Invalid Token" });
    }
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { nickname, areaCodes } = req.body;

    if (!nickname)
      return res.status(400).json({ error: "닉네임을 입력해주세요." });

    await User.findByIdAndUpdate(user._id, {
      nickname,
      areaCodes,
      status: "active",
    });

    const updated = await User.findById(user._id).select("-password");

    res.status(200).json({
      message: "필수 회원 정보가 입력되어 회원가입이 완료됐습니다.",
      user: {
        _id: updated._id,
        email: updated.email,
        status: updated.status,
        profilePic: updated.profilePic,
        nickname: updated.nickname,
        areaCodes: updated.areaCodes,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log("Error in signup2 controller", err.message);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );

    if (!user || !isPasswordCorrect) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
    generateToken(user._id, res),
      res.status(200).json({
        message: "로그인 성공",
        user: {
          _id: user._id,
          email: user.email,
          status: user.status,
          profilePic: user.profilePic,
          nickname: user.nickname,
          areaCodes: user.areaCodes,
        },
      });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getMe = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res
        .status(401)
        .json({ error: "Unauthorized - No Token Provided" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ error: "Unauthorized - Invalid Token" });
    }
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({
      message: "유저 정보를 성공적으로 가져왔습니다.",
      user: {
        _id: user._id,
        email: user.email,
        status: user.status,
        profilePic: user.profilePic,
        nickname: user.nickname,
        areaCodes: user.areaCodes,
      },
    });
  } catch (error) {
    console.log("Error in getMe controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.clearCookie("jwt");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
