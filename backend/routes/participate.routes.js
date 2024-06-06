import express from "express";
import axios from "axios";
import protectRoute from "../middleware/protectRoute.js";
import Pickle from "../models/Pickle.model.js";
import Participation from "../models/participation.model.js";

const router = express.Router();

// 피클에 신청하기
router.post("/", protectRoute, async (req, res) => {
  const { _id: user_id } = req.user;
  const { uid: imp_uid, pickle_id } = req.body;
  try {
    const tokenResponse = await axios.post(
      "https://api.iamport.kr/users/getToken",
      {
        imp_key: process.env.IMP_API_KEY,
        imp_secret: process.env.IMP_API_SECRET,
      }
    );
    const access_token = tokenResponse.data.response.access_token;
    const paymentResponse = await axios.get(
      `https://api.iamport.kr/payments/${imp_uid}`,
      {
        headers: { Authorization: access_token },
      }
    );

    const payment = paymentResponse.data.response;
    if (!payment?.amount) {
      return res.status(404).json({
        message: "결제 정보가 존재하지 않습니다. 신청에 실패했습니다.",
      });
      //환불처리
    }

    const pickle = await Pickle.findById(pickle_id);
    if (!pickle) {
      return res
        .status(404)
        .json({ message: "피클이 존재하지 않습니다. 신청에 실패했습니다." });
      //환불처리
    }
    // 피클의 최대 신청 인원을 초과했는지 검사하고 환불처리

    if (pickle.cost === payment.amount && payment.status === "paid") {
      const participation = new Participation({
        user: user_id,
        pickle: pickle_id,
        imp_uid: imp_uid,
        payment_amount: payment.amount,
      });
      await participation.save();
      res.status(200).json({ message: "신청성공" });
    } else {
      // 결제 금액이 불일치하거나 결제 상태가 paid가 아닌 경우
      // 환불처리
      res.status(400).json({ message: "결제에 실패했습니다" });
    }
  } catch (error) {
    console.log(error);
    //환불처리
    res.status(400).json({ message: "신청에 실패했습니다.", error: error });
  }
});

//피클 신청 취소하기
router.delete("/", protectRoute, async (req, res) => {
  const { _id: user_id } = req.user;
  const { pickle_id } = req.body;
  // participation 객체를 찾아서 status를 "Cancelled"로 변경
  // 해당 participation 객채의  imp_uid에 해당하는 결제를 환불처리
});

export default router;
