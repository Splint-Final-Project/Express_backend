import Pickle from "../../models/Pickle.model.js";
import Participation from "../../models/participation.model.js";
import { vectorSearchEngine } from "../../langchain/vectorSearch.js";
import { minimumFormatPickle } from "../dto/pickle.dto.js";

export const searchPickles = async (req, res) => {
  try {
    const now = new Date();
    const { text, term, sort } = req.query;

    const searchedPickles = await vectorSearchEngine(text); // 리스트

    const formattedPickles = [];

    for await (const pickle of searchedPickles) {
      const foundPickle = await Pickle.find({
        _id: pickle.metadata.pickleId,
        deadLine: { $gt: now },
      });
      if (!foundPickle[0]) continue;

      const participantNumber = await Participation.countDocuments({
        pickle: foundPickle[0]._id,
        status: "paid",
      });

      if (participantNumber < foundPickle[0].capacity) {
        const filteredPickles = minimumFormatPickle(foundPickle[0]);
        formattedPickles.push(filteredPickles);
      }
    }

    // TODO: sort(정렬기준)에 따라 정렬 'popular' | 'recent' | 'lowPrice' | 'highPrice'
    // 리스폰스에 participantNumber field 추가하기

    res.json({ data: formattedPickles }); // 최대 10개
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
