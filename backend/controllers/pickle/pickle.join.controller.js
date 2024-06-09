import Pickle from "../../models/Pickle.model.js";
import Participation from "../../models/participation.model.js";
import { verify, refund } from "../../utils/payments.js";

export const JoinPickle = async (req, res) => {
  const { _id: user_id } = req.user;
  const { imp_uid, pickle_id } = req.body;
  try {
    // console.log("SignUpForPickle", user_id, imp_uid, pickle_id);

    // 이미 존재하는 결제정보인지 확인
    const hacking = await Participation.find({
      payment_uid: imp_uid,
    });
    if (hacking.length > 0) {
      return res.status(400).json({
        message: "이미 존재하는 결제 정보입니다. 해킹이 의심됩니다.",
      });
    }

    const { payment } = await verify(imp_uid);

    const pickle = await Pickle.findById(pickle_id);

    //피클이 신청 기간을 지났는지 검사
    if (pickle.deadLine < new Date()) {
      const refundResult = await refund(imp_uid);
      return res.status(400).json({
        message: "피클 신청 기간이 지났습니다. 신청에 실패했습니다.",
        refundResult,
      });
    }

    //피클이 만원인지 검사
    const participants = await Participation.find({
      pickle: pickle_id,
      status: "paid",
    });
    if (participants.length >= pickle.capacity) {
      const refundResult = await refund(imp_uid);
      return res.status(400).json({
        message: "피클의 최대 신청 인원을 초과했습니다. 신청에 실패했습니다.",
        refundResult,
      });
    }

    //결제 금액 확인
    if (pickle.cost !== payment.amount || payment.status !== "paid") {
      const refundResult = await refund(imp_uid);
      res.status(400).json({
        message: "결제에 실패했습니다. 금액 위변조가 의심됩니다.",
        refundResult,
      });
    }

    // 이미 참가한 피클인지 확인
    const already = await Participation.find({
      pickle: pickle_id,
      user: user_id,
      status: "paid",
    });
    if (already.length > 0) {
      const refundResult = await refund(imp_uid);
      return res.status(400).json({
        message: "이미 참가한 피클입니다. 신청에 실패했습니다.",
        refundResult,
      });
    }
    const newParticipation = new Participation({
      user: user_id,
      pickle: pickle_id,
      payment_uid: imp_uid,
      amount: payment.amount,
      status: "paid",
    });

    await newParticipation.save();

    res.status(200).json({ message: "신청성공" });
  } catch (error) {
    const refundResult = await refund(imp_uid);
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

  const participation = await Participation.findOne({
    user: user_id,
    pickle: pickle_id,
  });
  if (!participation) {
    return res.status(404).json({ message: "참여하지 않은 피클입니다." });
  }
  participation.status = "refunded";
  await participation.save();

  const refundResult = await refund(participation.imp_uid);
  res.status(200).json({ message: "참여 취소 성공", refundResult });
  // res.status(400).json({ message: "참여 취소에 실패했습니다.", refundResult });
};
