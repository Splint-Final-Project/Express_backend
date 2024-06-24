import { refund } from "../utils/payments.js";
import Pickle from "./Pickle.model.js";
import Participation from "./participation.model.js";
import User from "./user.model.js";

const updatePickleStatus = async () => {
  try {
    const now = new Date();
    const pickles = await Pickle.find({
      deadLine: { $lte: now },
      isCancelled: false,
    });

    for await (const pickle of pickles) {
      const participants = await Participation.find({
        pickle: pickle._id,
      });
      if (participants.length < pickle.capacity) {
        pickle.isCancelled = true;
        await pickle.save();
        for (const participant of participants) {
          if (participant.discount > 0) {
            //포인트환불
            const user = await User.findById(participant.user);
            user.points.current += participant.discount;
            user.points.history.push({
              type: "earn",
              message: `피클 취소: ${pickle.title}`,
              date: new Date(),
              amount: participant.discount,
              remaining: user.points.current,
            });
            await user.save();
          }
          if (participant.payment_uid !== "points") {
            // 결제한 기록이 있다면
            const result = await refund(participant.payment_uid);
            console.log(result?.cancellation?.code);
          }
          participant.status = "refunded";
          await participant.save();
        }
      }
    }
  } catch (error) {
    console.error("Error removing expired pickles:", error);
  }
};

export default updatePickleStatus;
