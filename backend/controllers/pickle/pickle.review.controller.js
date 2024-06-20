import Pickle from "../../models/Pickle.model.js";
import Participation from "../../models/participation.model.js";

export const getReviews = async (req, res) => {
  try {
    const user = req.user;
    const participations = await Participation.find({
      user: user._id,
      review: { $ne: null },
    }).populate("pickle");
    const reviews = participations.map((participation) => {
      return {
        pickleId: participation.pickle._id,
        pickleTitle: participation.pickle.title,
        pickleImageUrl: participation.pickle.imgUrl,
        stars: participation.review.stars,
        content: participation.review.content,
      };
    });
    res.status(200).json({ data: reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const postReview = async (req, res) => {
  try {
    const user = req.user;
    const pickleId = req.params.id;
    const participation = Participation.findOne({
      user: user._id,
      pickle: pickleId,
    });

    if (!participation) {
      return res.status(404).json({ message: "Invalid participation" });
    }
    const pickle = Pickle.findOne({ _id: pickleId });
    if (!pickle) {
      return res.status(404).json({ message: "Invalid pickle" });
    }
    if (pickle.when.finishDate > new Date()) {
      return res.status(400).json({ message: "Pickle has not finished" });
    }
    const { stars, content } = req.body;
    if (!stars) {
      return res.status(400).json({ message: "Invalid review" });
    }
    participation.review = { stars, content };
    await participation.save();
    res.status(200).json({ message: "Review posted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const user = req.user;
    const pickleId = req.params.id;
    const participation = Participation.findOne({
      user: user._id,
      pickle: pickleId,
    });

    if (!participation) {
      return res.status(404).json({ message: "Invalid participation" });
    }
    if (!participation.review) {
      return res.status(404).json({ message: "No review found" });
    }
    participation.review = null;
    await participation.save();
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
