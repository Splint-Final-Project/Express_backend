import Pickle from "./Pickle.model.js";

const updatePickleStatus = async () => {
  //TODO: 알잘딱
  // try {
  //   const pickles = await Pickle.find({
  //     status: { $nin: ["cancelled", "terminated"] },
  //   });
  //   pickles.forEach(async (pickle) => {
  //     console.log(`Pickle ID: ${pickle._id}`);
  //     const now = new Date();
  //     // 미달일 경우 로직
  //     if (pickle.numParticipants < pickle.capacity && pickle.deadLine < now) {
  //       await Pickle.findByIdAndUpdate(pickle._id, { isCancelled: true });
  //       const participants = await Participation.find({ pickle: pickle._id });
  //       participants.forEach(async (participant) => {
  //         console.log("Refunding participant: ", participant._id);
  //         const refundResult = refund(participant.imp_uid);
  //         console.log(refundResult);
  //         await Participation.findByIdAndDelete(participant._id);
  //       });
  //     }
  //   });
  // } catch (error) {
  //   console.error("Error removing expired pickles:", error);
  // }
};

// 예제: 정기적으로 실행 (예: 하루에 한 번)
export default updatePickleStatus;
