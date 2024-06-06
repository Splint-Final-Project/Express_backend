import Pickle from "../../models/Pickle.model.js";
import { verify, refund } from "../../utils/payments.js";

export const createPickle = async (req, res) => {
  try {
    const {
      imp_uid,
      title,
      capacity,
      cost,
      deadLine,
      where,
      when,
      content,
      explanation,
      latitude,
      longitude,
    } = req.body;

    // 현재 사용자가 생성 -> 리더가 됩니다.
    const leader = req.user._id;
    const sortedTimes = when.times.sort((a, b) => new Date(a) - new Date(b));
    // 결제 정보 단건 불러오기
    const { payment } = verify(imp_uid);

    // 결제 정보가 없을 경우
    if (!payment?.amount) {
      refund(imp_uid);
      return res.status(404).json({
        message: "결제 정보가 존재하지 않습니다. 피클 생성에 실패했습니다.",
      });
    }

    //결제 금액 확인
    if (cost !== payment.amount || payment.status !== "paid") {
      refund(imp_uid);
      return res.status(400).json({
        message: "결제에 실패했습니다. 금액 위변조가 의심됩니다.",
      });
    }

    // TODO
    // 이 피클에 대한 결제인지 확인

    // 새로운 피클 생성
    const newPickle = new Pickle({
      title,
      participants: [
        {
          user: leader,
          payment_uid: imp_uid,
          isLeader: true,
        },
      ],
      capacity,
      cost,
      deadLine,
      participants: [
        {
          user: leader,
          isLeader: true,
        }
      ],
      leader: leader,
      where,
      when: {
        summary: when.summary,
        times: sortedTimes,
      },
      category: content,
      explanation,
      viewCount: 0, // 초기 viewCount 설정
      latitude,
      longitude,
      isCancelled: false,
    });

    // 데이터베이스에 저장
    await newPickle.save();

    res
      .status(201)
      .json({ message: "Pickle created successfully", pickle: newPickle });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};
