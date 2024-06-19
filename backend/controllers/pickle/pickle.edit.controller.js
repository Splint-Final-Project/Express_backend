import Pickle from "../../models/Pickle.model.js";
import Participation from "../../models/participation.model.js";
import { pickleEditFormat } from "../dto/pickle.dto.js";

export const editPickle = async (req, res) => {
  try {
    const user = req.user;
    const pickle = await Pickle.findById(req.params.id);

    if (!pickle) {
      return res.status(404).json({ error: "Pickle not found" });
    }

    // find leader of the pickle from participation table
    const leader = await Participation.findOne({
      pickle: pickle._id,
      isLeader: true,
    });
    if (!leader || leader.user.toString() !== user._id.toString()) {
      return res
        .status(403)
        .json({ error: "You are not the leader of this pickle" });
    }

    const updates = req.body;

    // DTO에 존재하지 않는 키가 있는지 확인
    const updateKeys = Object.keys(updates);
    const dtoPickle = Object.keys(pickleEditFormat(pickle));

    for (let key of updateKeys) {
      if (!dtoPickle.includes(key)) {
        return res
          .status(403)
          .json({ error: `${key} 데이터는 수정할 수 없는 데이터 입니다.` });
      }
    }

    Object.assign(pickle, updates);

    const updatedPickle = await pickle.save();

    res.json(pickleEditFormat(updatedPickle));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
