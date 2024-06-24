import axios from "axios";

export const refund = async (imp_uid) => {
  try {
    const tokenResponse = await axios.post(
      "https://api.iamport.kr/users/getToken",
      {
        imp_key: process.env.IMP_API_KEY,
        imp_secret: process.env.IMP_API_SECRET,
      }
    );
    const access_token = tokenResponse.data.response.access_token;
    const cancelResponse = await axios({
      url: "https://api.iamport.kr/payments/cancel",
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: access_token, // 포트원 서버로부터 발급받은 엑세스 토큰
      },
      data: {
        reason: "피클타임 환불",
        imp_uid,
        // amount: cancel_request_amount,
      },
    });
    const cancellation = cancelResponse.data;
    return { cancellation };
  } catch (error) {
    throw new Error(error);
  }
};

export const verify = async (imp_uid) => {
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
    return { payment };
  } catch (error) {
    throw new Error(error);
  }
};
