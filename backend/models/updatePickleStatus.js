import { refund } from "../utils/payments.js";
import Pickle from "./Pickle.model.js";

const updatePickleStatus = async () => {
  const now = new Date();

  try {
    const pickles = await Pickle.find({
      deadLine: { $lte: now },
      $expr: { $lt: [{ $size: "$participants" }, "$capacity"] },
      isCancelled: false,
    });

    // const pickles = await Pickle.find({
    //   isCancelled: true,
    // });

    // TODO: 여기 로직이 맞는지 확인
    pickles.forEach(async (pickle) => {
      console.log(`Pickle ID: ${pickle._id}`);

      // 미달일 경우 로직
      for (const participant of pickle.participants) {
        console.log("Refunding participant: ", participant.user._id);
        console.log(participant);
        const refundResult = await refund(participant.payment_uid);
        if (refundResult.cancellation.code !== 0) {
          throw new Error("Refund failed");
        }
        console.log(refundResult);
      }
      //empty array
      pickle.isCancelled = true;
      await pickle.save();
    });
  } catch (error) {
    console.error("Error removing expired pickles:", error);
  }
};

// 예제: 정기적으로 실행 (예: 하루에 한 번)
export default updatePickleStatus;
