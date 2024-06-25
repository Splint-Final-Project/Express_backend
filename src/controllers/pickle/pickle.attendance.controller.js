import Pickle from "../../models/Pickle.model.js";
import Participation from "../../models/participation.model.js";

export const pickleAttendance = async (req, res) => {
  const user = req.user;
  const pickleId = req.params.id;
  const { latitude, longitude } = req.body;
  const pickle = await Pickle.findById(pickleId);
  if (!pickle) {
    return res.status(404).json({ message: "Invalid pickle" });
  }
  const participation = await Participation.findOne({
    user: user._id,
    pickle: pickleId,
  });
  if (!participation) {
    return res.status(404).json({ message: "참여하지 않은 피클입니다" });
  }
  const today = new Date();
  if (
    !pickle.when.times.find((time) => {
      const date = new Date(time);
      return (
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
      );
    })
  ) {
    return res.status(400).json({ message: "피클이 있는 날이 아닙니다" });
  }

  // 피클 시작 시간 10분 전후인지 확인
  const now = new Date();
  const startTime = new Date();
  startTime.setHours(
    pickle.when.startTime.hour,
    pickle.when.finishTime.minute,
    0,
    0
  );
  const prev10 = new Date(startTime);
  prev10.setMinutes(startTime.getMinutes() - 10);
  const after10 = new Date(startTime);
  after10.setMinutes(startTime.getMinutes() + 10);
  console.log(prev10, after10, now);
  if (now < prev10 || now > after10) {
    return res
      .status(400)
      .json({ message: "피클 시작 10분 전후로 출석이 가능합니다." });
  }

  if (
    participation.attendance.find((time) => {
      const date = new Date(time);
      return (
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
      );
    })
  ) {
    return res.status(400).json({ message: "이미 출석했습니다" });
  }

  // lat lng 기준으로 피클과 500m 이내인지 확인
  const parsedLatitude = parseFloat(latitude);
  const parsedLongitude = parseFloat(longitude);
  if (isNaN(parsedLatitude) || isNaN(parsedLongitude)) {
    return res.status(400).json({ error: "유효하지 않은 위치입니다." });
  }
  const earthRadius = 6371000;
  const maxDistance = 500; // 500m
  const radiansToDegrees = (radians) => radians * (180 / Math.PI);
  const radiusInDegrees = radiansToDegrees(maxDistance / earthRadius);
  if (
    parsedLatitude - radiusInDegrees > pickle.latitude ||
    parsedLatitude + radiusInDegrees < pickle.latitude ||
    parsedLongitude - radiusInDegrees > pickle.longitude ||
    parsedLongitude + radiusInDegrees < pickle.longitude
  ) {
    return res
      .status(400)
      .json({ message: "피클 장소에서 멀리 떨어져 있습니다" });
  }

  participation.attendance.push(today);
  await participation.save();

  // 출석 포인트 지급
  const newpoint = Math.floor(pickle.cost / pickle.when.times.length);
  user.points.current += newpoint;
  user.points.history.push({
    type: "earn",
    message: `출석: ${pickle.title}`,
    date: new Date(),
    amount: newpoint,
    remaining: user.points.current,
  });
  await user.save();

  res
    .status(200)
    .json({ message: `출석 완료! ${newpoint}P가 지급되었습니다.` });
};
