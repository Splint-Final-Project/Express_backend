import Pickle from "../../models/Pickle.model.js";
import { pickleEditFormat } from "../dto/pickle.dto.js";

export const editPickle = async (req, res) => {
  try {
    const pickle = await Pickle.findById(req.params.id);

    if (!pickle) {
      return res.status(404).json({ error: "Pickle not found" });
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
