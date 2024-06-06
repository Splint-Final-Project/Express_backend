import { refund } from "../controllers/participation.controller.js";
import Pickle from "./Pickle.model.js";
import Participation from "./participation.model.js";

const updatePickleStatus = async () => {
  try {
    const pickles = await Pickle.find({
      status: { $nin: ["cancelled", "terminated"] },
    });

    pickles.forEach(async (pickle) => {
      console.log(`Pickle ID: ${pickle._id}`);
      const now = new Date();
      const participants = await Participation.find({ pickle: pickle._id });

      if (participants.length < pickle.capacity && pickle.deadLine > now) {
        await Pickle.findByIdAndUpdate(pickle._id, { status: "recruiting" });
      } else if (
        participants.length < pickle.capacity &&
        pickle.deadLine < now
      ) {
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

    //TODO: 환불 처리하기
    console.log(`${result.deletedCount} pickles removed.`);
  } catch (error) {
    console.error("Error removing expired pickles:", error);
  }
};

// 예제: 정기적으로 실행 (예: 하루에 한 번)
export default updatePickleStatus;
