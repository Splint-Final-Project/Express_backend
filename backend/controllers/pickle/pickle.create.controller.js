import { vectorDataSaver } from "../../langchain/dataSaver.js";
import Pickle from "../../models/Pickle.model.js";
import Participation from "../../models/participation.model.js";
import { verify, refund } from "../../utils/payments.js";
var today = new Date();
var tomorrow = new Date(today.setDate(today.getDate() + 1));

export const createPickle = async (req, res) => {
  const { imp_uid } = req.body;
  try {
    // 이미 존재하는 결제정보인지 확인
    const already = await Participation.find({
      payment_uid: imp_uid,
    });

    if (already.length > 0) {
      // await refund(imp_uid);
      return res.status(400).json({
        message: "이미 존재하는 결제 정보입니다. 해킹이 의심됩니다.",
      });
    }

    // 결제 정보 단건 불러오기
    const { payment } = await verify(imp_uid);

    const pickleData = JSON.parse(payment.custom_data);

    // 결제 정보가 없을 경우
    if (!payment?.amount) {
      await refund(imp_uid);
      return res.status(404).json({
        message: "결제 정보가 존재하지 않습니다. 피클 생성에 실패했습니다.",
      });
    }

    //결제 금액 확인
    if (
      pickleData.cost - pickleData.discount !== payment.amount ||
      payment.status !== "paid"
    ) {
      await refund(imp_uid);
      return res.status(400).json({
        message: "결제에 실패했습니다. 금액 위변조가 의심됩니다.",
      });
    }

    console.log(tomorrow);

    // 새로운 피클 생성
    const newPickle = new Pickle({
      ...pickleData,
      // deadLine: tomorrow,
      viewCount: 0, // 초기 viewCount 설정
      isCancelled: false,
    });

    // 데이터베이스에 저장
    await newPickle.save();

    // 참가자 정보 생성
    const newParticipation = new Participation({
      user: req.user._id,
      pickle: newPickle._id,
      payment_uid: imp_uid,
      amount: payment.amount,
      status: "paid",
      isLeader: true,
    });

    await newParticipation.save();

    // 벡터 db에 저장
    await vectorDataSaver(newPickle);
    res
      .status(201)
      .json({ message: "Pickle created successfully", pickle: newPickle });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};
