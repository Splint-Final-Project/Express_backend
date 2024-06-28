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
        date: participation.review.date,
        stars: participation.review.stars,
        content: participation.review.content,
      };
    });
    return res.status(200).json({ data: reviews });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const postReview = async (req, res) => {
  try {
    const user = req.user;
    const pickleId = req.params.id;
    const participation = await Participation.findOne({
      user: user._id,
      pickle: pickleId,
    });

    if (!participation) {
      return res.status(404).json({ message: "Invalid participation" });
    }
    const pickle = await Pickle.findOne({ _id: pickleId });
    if (!pickle) {
      return res.status(404).json({ message: "Invalid pickle" });
    }
    if (pickle.when.finishDate > new Date()) {
      return res
        .status(400)
        .json({ message: "아직 종료되지 않은 피클입니다." });
    }
    const { stars, content } = req.body.data;
    console.log(req.body);
    if (!stars) {
      return res.status(400).json({ message: "리뷰 형식이 잘못됐습니다." });
    }
    if (participation.review) {
      return res.status(400).json({ message: "이미 리뷰를 남기셨습니다." });
    }
    participation.review = { date: new Date(), stars, content };
    await participation.save();
    // 유저에게 포인트 지급
    user.points.current += 500;
    user.points.history.push({
      type: "earn",
      message: `리뷰 작성: ${pickle.title}`,
      date: new Date(),
      amount: 500,
      remaining: user.points.current,
    });
    await user.save();
    return res
      .status(200)
      .json({ message: "리뷰 작성 완료! 500P가 지급됐습니다." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// export const deleteReview = async (req, res) => {
//   try {
//     const user = req.user;
//     const pickleId = req.params.id;
//     const participation = Participation.findOne({
//       user: user._id,
//       pickle: pickleId,
//     });

//     if (!participation) {
//       return res.status(404).json({ message: "Invalid participation" });
//     }
//     if (!participation.review) {
//       return res.status(404).json({ message: "No review found" });
//     }
//     participation.review = null;
//     await participation.save();
//     return res.status(200).json({ message: "Review deleted successfully" });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// };
