import Pickle from "./Pickle.model.js";

const updatePickleStatus = async () => {
  //TODO: 알잘딱
  const now = new Date();

  try {
    const result = await Pickle.updateMany(
      {
        deadLine: { $lte: now },
        $expr: { $lt: [{ $size: "$participants" }, "$capacity"] }
      },
      {
        $set: { isCancelled: true }
      }
    );

    const pickles = await Pickle.find({
      isCancelled: true,
    });

    pickles.forEach(async (pickle) => {
      console.log(`Pickle ID: ${pickle._id}`);

      // 미달일 경우 로직
      pickle.participants.forEach(async (participant) => {

        console.log("Refunding participant: ", participant.user._id);
        const refundResult = refund(participant.payment_uid);
        console.log(refundResult);

      });

    });
  } catch (error) {
    console.error("Error removing expired pickles:", error);
  }
};

// 예제: 정기적으로 실행 (예: 하루에 한 번)
export default updatePickleStatus;
