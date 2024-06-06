import { refund } from "../controllers/participation.controller.js";
import Pickle from "./Pickle.model.js";
import Participation from "./participation.model.js";

// 특정 조건에 맞는 피클 문서 제거
const updatePickleStatus = async () => {
  try {
    const pickles = await Pickle.find({
      status: { $nin: ["cancelled", "terminated"] },
    });
    console.log(pickles);
    pickles.forEach(async (pickle) => {
      console.log(`Pickle ID: ${pickle._id}, Status: ${pickle.status}`);
      const now = new Date();
      const firstTime = pickle.when.times[0];
      const lastTime = pickle.when.times[pickle.when.times.length - 1];

      const participants = await Participation.find({ pickle: pickle._id });

      if (participants.length < pickle.capacity && pickle.deadLine > now) {
        await Pickle.findByIdAndUpdate(pickle._id, { status: "recruiting" });
      } else if (
        participants.length < pickle.capacity &&
        pickle.deadLine < now
      ) {
        participants.forEach(async (participant) => {
          await Participation.findByIdAndUpdate(participant._id, {
            status: "cancelled",
            isRefunded: true,
          });
          refund(participant.imp_uid);
        });
        // 해당하는 Participation들을 모두 찾아서 status: Cancelled, 환불처리, isRefunded를 true로 바꿔줘야함
        await Pickle.findByIdAndUpdate(pickle._id, { status: "cancelled" });
      } else if (participants.length === pickle.capacity && firstTime > now) {
        await Pickle.findByIdAndUpdate(pickle._id, { status: "readytostart" });
      } else if (participants.length === pickle.capacity && firstTime < now) {
        await Pickle.findByIdAndUpdate(pickle._id, { status: "ongoing" });
      } else if (participants.length === pickle.capacity && lastTime < now) {
        await Pickle.findByIdAndUpdate(pickle._id, { status: "terminated" });
      }
    });
  } catch (error) {
    console.error("Error removing expired pickles:", error);
  }
};

// 예제: 정기적으로 실행 (예: 하루에 한 번)
export default updatePickleStatus;
