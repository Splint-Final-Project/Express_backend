import Pickle from "../../models/Pickle.model.js";

export const createPickle = async (req, res) => {
  try {
    const {
      title,
      capacity,
      cost,
      deadLine,
      where,
      when,
      content,
      explanation,
      latitude,
      longitude,
    } = req.body;

    // 현재 사용자가 생성 -> 리더가 됩니다.
    const leader = req.user._id;
    const sortedTimes = when.times.sort((a, b) => new Date(a) - new Date(b));

    // 새로운 피클 생성
    const newPickle = new Pickle({
      leader: leader,
      title,
      capacity,
      cost,
      deadLine,
      where,
      when: {
        summary: when.summary,
        times: sortedTimes,
      },
      content,
      explanation,
      viewCount: 0, // 초기 viewCount 설정
      latitude,
      longitude,
    });

    // 데이터베이스에 저장
    const savedPickle = await newPickle.save();
    // TODO: 결제 했는지 여부 확인하고 newPickle participants 필드에 push

    res
      .status(201)
      .json({ message: "Pickle created successfully", pickle: newPickle });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};
