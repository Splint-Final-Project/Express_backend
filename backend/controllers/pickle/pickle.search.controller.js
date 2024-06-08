import Pickle from "../../models/Pickle.model.js";
import { vectorSearchEngine } from "../../langchain/vectorSearch.js";
import { minimumFormatPickle } from "../dto/pickle.dto.js";

export const searchPickles = async (req, res) => {
  try {
    const now = new Date();
    const message = req.body.message;

    const searchedPickles = await vectorSearchEngine(message); // 리스트

    const formattedPickles = [];

    for await (const pickle of searchedPickles) {
      const foundPickle = await Pickle.find({
        _id: pickle.metadata.pickleId,
        deadLine: { $gt: now },
        $expr: { $lt: [{ $size: "$participants" }, "$capacity"] },
      });

      formattedPickles.push(foundPickle[0]);
    }

    res.json({ data: formattedPickles }); // 최대 10개
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
