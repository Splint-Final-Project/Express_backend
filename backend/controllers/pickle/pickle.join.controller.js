import Pickle from "../../models/Pickle.model.js";
import { verify, refund } from "../../utils/payments.js";

export const JoinPickle = async (req, res) => {
  const { _id: user_id } = req.user;
  const { imp_uid, pickle_id } = req.body;
  console.log("SignUpForPickle", user_id, imp_uid, pickle_id);
  try {
    const { payment } = verify(imp_uid);

    const pickle = await Pickle.findById(pickle_id);
    
    //피클이 신청 기간을 지났는지 검사
    if (pickle.deadLine < new Date()) {
      const refundResult = refund(imp_uid);
      return res.status(400).json({
        message: "피클 신청 기간이 지났습니다. 신청에 실패했습니다.",
        refundResult,
      });
    }

    // 피클의 최대 신청 인원을 초과했는지 검사하고 환불처리
    if (pickle.participants.length >= pickle.capacity) {
      const refundResult = refund(imp_uid);
      return res.status(400).json({
        message: "피클의 최대 신청 인원을 초과했습니다. 신청에 실패했습니다.",
        refundResult,
      });
    }

    if (pickle.cost !== payment.amount || payment.status !== "paid") {
      const refundResult = refund(imp_uid);
      res.status(400).json({
        message: "결제에 실패했습니다. 금액 위변조가 의심됩니다.",
        refundResult,
      });
    }

    // TODO
    // 이 피클에 대한 결제인지 확인

    pickle.participants.push({
      user: user_id,
      payment_uid: imp_uid,
      isLeader: false,
    });
    res.status(200).json({ message: "신청성공" });
  } catch (error) {
    const refundResult = refund(imp_uid);
    console.log(error);
    //환불처리
    res
      .status(400)
      .json({ message: "신청에 실패했습니다.", error: error, refundResult });
  }
};

export const WithdrawFromPickle = async (req, res) => {
  const { _id: user_id } = req.user;
  const { pickle_id } = req.body;
  const pickle = await Pickle.findById(pickle_id);

  if (!pickle) {
    return res.status(404).json({ message: "피클이 존재하지 않습니다." });
  }

  const participation = pickle.participants.find(
    (participant) => participant.user === user_id
  );

  if (!participation) {
    return res.status(404).json({ message: "참여하지 않은 피클입니다." });
  }

  pickle.participants = pickle.participants.filter(
    (participant) => participant.user !== user_id
  );

  await pickle.save();

  const refundResult = refund(participation.imp_uid);
  res.status(200).json({ message: "참여 취소 성공", refundResult });
  // res.status(400).json({ message: "참여 취소에 실패했습니다.", refundResult });
};