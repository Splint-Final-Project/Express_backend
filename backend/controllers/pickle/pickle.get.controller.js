// 세부 피클에 대한 컨트롤러
import Pickle from "../../models/Pickle.model.js";
import { findParticipationNumber, addParticipantNumber } from "../services/utils/index.js";

export const getPickleDetails = async (req, res) => {
  try {
    const pickle = await Pickle.findById(req.params.id).exec();

    if (!pickle) {
      return res.status(404).json({ error: "Pickle not found" });
    }
    const participantNumber = await findParticipationNumber(req.params.id);
    const picklesWithParticipant = await addParticipantNumber(pickle, participantNumber);

    res.json({data: picklesWithParticipant}); // status 필드가 JSON 응답에 포함됩니다.
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
