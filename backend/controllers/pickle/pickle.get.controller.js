// 세부 피클에 대한 컨트롤러
import Pickle from "../../models/Pickle.model.js";

export const getPickleDetails = async (req, res) => {
  try {
    const pickle = await Pickle.findById(req.params.id).exec();

    if (!pickle) {
      return res.status(404).json({ error: 'Pickle not found' });
    }

    res.json(pickle); // status 필드가 JSON 응답에 포함됩니다.
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const editPickle = async (req, res) => {
  try {
    const pickle = await Pickle.findById(req.params.id).exec();

    if (!pickle) {
      return res.status(404).json({ error: 'Pickle not found' });
    }

    const updates = req.body;
    for (let key in updates) {
      if (updates.hasOwnProperty(key) && key !== '_id') {
        pickle[key] = updates[key];
      }
    }

    const updatedPickle = await pickle.save();

    res.json(updatedPickle);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};