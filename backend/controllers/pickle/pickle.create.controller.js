import { vectorDataSaver } from "../../langchain/dataSaver.js";
import Pickle from "../../models/Pickle.model.js";
import Participation from "../../models/participation.model.js";
import { verify, refund } from "../../utils/payments.js";
var today = new Date();
var tomorrow = new Date(today.setDate(today.getDate() + 1));

export const createPickle = async (req, res) => {
  const user = req.user;
  const { imp_uid } = req.body;

  if (!imp_uid) {
    try {
      const {
        discount,
        title,
        category,
        capacity,
        imgUrl,
        explanation,
        goals,
        cost,
        place,
        address,
        detailedAddress,
        areaCode,
        latitude,
        longitude,
        when,
        deadLine,
      } = req.body;
      const points = user.points;
      if (discount > points) {
        return res.status(400).json({
          message: "포인트가 부족합니다.",
        });
      }
      const totalCost = cost - discount;
      if (totalCost !== 0) {
        return res.status(400).json({
          message: "금액이 알맞지 않습니다.",
        });
      }
      // Deduct points from the user
      user.points -= pickleData.discount;
      await user.save();

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
  }
};
