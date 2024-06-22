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

    //check if pickle's deadline has passed
    if (pickle.deadLine < new Date()) {
      return res.status(403).json({ error: "Pickle deadline has passed" });
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

export const pickleViewCountUp = async (req, res) => {
  try {
    const pickle = await Pickle.findById(req.params.id);

    if (!pickle) {
      return res.status(404).json({ error: "Pickle not found" });
    }

    Object.assign(pickle, { viewCount: pickle.viewCount + 1 });
    await pickle.save();
    console.log(pickle)

    res.status(201).json({message: "successfully viewCount updated" });
  } catch (error) {
    res.status(500).json({ error: "해당하는 피클을 찾을 수 없어요" });
  }
}