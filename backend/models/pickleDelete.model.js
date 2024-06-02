import Pickle from "./Pickle.model.js";

// 특정 조건에 맞는 피클 문서 제거
const removeExpiredPickles = async () => {
  const now = new Date();
  try {
    const result = await Pickle.deleteMany({
      deadLine: { $gt: now },
      $expr: {
        $lt: [{ $size: "$participants" }, "$capacity"]
      }
    });
    console.log(`${result.deletedCount} pickles removed.`);
  } catch (error) {
    console.error('Error removing expired pickles:', error);
  }
};

// 예제: 정기적으로 실행 (예: 하루에 한 번)
export default removeExpiredPickles;