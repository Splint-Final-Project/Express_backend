import Pickle from "../models/Pickle.model.js";

export const getPickles = async (req, res) => {
  try {
    // const { pickleType } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const skip = (page - 1) * limit;

    const pickles = await Pickle.find({})
      .skip(skip)
      .limit(limit);

    const total = await Pickle.countDocuments();

    res.status(200).json({
      count: pickles.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: pickles
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

export const createPickle = async (req, res) => {
  try {
    const {
      title,
      content,
      latitude,
      longitude,
      capacity
    } = req.body;
    // 현재 사용자가 생성 -> 리더가 됩니다.
    const leader = req.user._id;

    const newPickle = new Pickle({
      leader,
      title,
      content,
      viewCount: 0,
      latitude,
      longitude,
      capacity
    });

    // 데이터베이스에 저장
    const savedPickle = await newPickle.save();

    res.status(201).json({
      success: true,
      data: savedPickle
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};