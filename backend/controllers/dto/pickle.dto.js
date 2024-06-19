export const minimumFormatPickle = (pickle) => {
  return {
    id: pickle._id,
    title: pickle.title,
    imgUrl: pickle.imgUrl,
    capacity: pickle.capacity,
    deadLine: pickle.deadLine,
    palce: pickle.place,
    when: pickle.when,
    cost: pickle.cost,
    latitude: pickle.latitude,
    longitude: pickle.longitude,
    category: pickle.category,
    participantNumber: pickle.participantNumber,
  };
};

export const pickleEditFormat = (pickle) => {
  return {
    title: pickle.title,
    category: pickle.category,
    explanation: pickle.explanation,
    imgUrl: pickle.imgUrl,
    goals: pickle.goals,
  };
};
