import Pickle from "../../models/Pickle.model.js";

export const editPickle = async (req, res) => {
  try {
    const pickle = await Pickle.findById(req.params.id).exec();

    if (!pickle) {
      return res.status(404).json({ error: 'Pickle not found' });
    }

    const updates = req.body;
    
    Object.assign(pickle, updates);

    const updatedPickle = await pickle.save();

    res.json(updatedPickle);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};