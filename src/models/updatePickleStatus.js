import { refund } from "../utils/payments.js";
import Pickle from "./Pickle.model.js";
import Participation from "./participation.model.js";

const updatePickleStatus = async () => {
  const now = new Date();

  // try {
  //   const pickles = await Pickle.find({
  //     deadLine: { $lte: now },
  //     $expr: { $lt: [{ $size: "$participants" }, "$capacity"] },
  //     isCancelled: false,
  //   });

  //   pickles.forEach(async (pickle) => {
  //     console.log(`Pickle ID: ${pickle._id}`);

  //     Participation.find({
  //       pickle: pickle._id,
  //       status: "paid",
  //     }).then(async (participants) => {
  //       for (const participant of participants) {
  //         console.log("Refunding participant: ", participant.user._id);
  //         const refundResult = await refund(participant.payment_uid);
  //         if (refundResult.cancellation.code !== 0) {
  //           throw new Error("Refund failed");
  //         }
  //         console.log(refundResult);
  //         participant.status = "refunded";
  //         await participant.save();
  //       }
  //     });

  //     pickle.isCancelled = true;
  //     await pickle.save();
  //   });
  // } catch (error) {
  //   console.error("Error removing expired pickles:", error);
  // }
};

// 예제: 정기적으로 실행 (예: 하루에 한 번)
export default updatePickleStatus;
