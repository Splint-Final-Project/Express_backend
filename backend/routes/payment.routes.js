import express from "express";
import axios from "axios";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/verify/:uid", async (req, res) => {
  const { uid } = req.params;
  try {
    // 1. 포트원 API 엑세스 토큰 발급
    const tokenResponse = await axios.post(
      "https://api.iamport.kr/users/getToken",
      {
        imp_key: process.env.IMP_API_KEY,
        imp_secret: process.env.IMP_API_SECRET,
      }
    );
    const access_token = tokenResponse.data.response.access_token;

    // 2. 포트원 결제내역 단건조회 API 호출
    const paymentResponse = await axios.get(
      `https://api.iamport.kr/payments/${uid}`,
      {
        headers: { Authorization: access_token },
      }
    );

    const payment = paymentResponse.data.response;
    console.log(payment.status);
    // 3. 고객사 내부 주문 데이터의 가격과 실제 지불된 금액을 비교합니다.

    // const order = await OrderService.findById(merchant_uid);
    if (/*order.amount === payment.amount*/ true) {
      if (payment.status === "paid") {
        // 모든 금액을 지불했습니다! 완료 시 원하는 로직을 구성하세요.

        res.status(200).json({ message: "결제성공" });
      }
    } else {
      // 결제 금액이 불일치하여 위/변조 시도가 의심됩니다.

      // 위/변조 시도가 의심될 경우, 아래와 같이 결제를 취소하고 결제 취소 로직을 수행하세요.

      // 4. 포트원 결제취소 API 호출

      res.status(400).json({ message: "결제실패" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "결제실패" });
  }
});

export default router;
