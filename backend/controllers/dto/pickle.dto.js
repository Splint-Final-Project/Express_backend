export const minimumFormatPickle = (pickle) => {
  return {
    id: pickle._id,
    title: pickle.title,
    capacity: pickle.capacity,
    deadLine: pickle.deadLine,
    where: pickle.where,
    when: pickle.when,
    cost: pickle.cost,
    latitude: pickle.latitude,
    longitude: pickle.longitude,
    category: pickle.category,
    participantNumber: pickle.participantNumber
  };
}

export const pickleEditFormat = (pickle) => {
  return {
    title: pickle.title,
    capacity: pickle.capacity,
    explanation: pickle.explanation,
    deadLine: pickle.deadLine,
  }
}