import Pickle from "../../models/Pickle.model.js";
import { vectorSearchEngine } from "../../langchain/vectorSearch.js";
import { minimumFormatPickle } from "../dto/pickle.dto.js";

export const searchPickles = async (req, res) => {
  try {
    const message = req.query.message;

    const searchedPickles = await vectorSearchEngine(message); // 리스트

    const formattedPickles = [];
    searchedPickles.forEach(async (pickle) => {
      const foundPickle = await Pickle.findById(pickle.pickleId);

      const formattedPickle = minimumFormatPickle(foundPickle);
      formattedPickles.push(formattedPickle);
    });

    res.json({ data: formattedPickles }); // 최대 10개
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}