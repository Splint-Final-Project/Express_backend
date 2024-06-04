export const minimumFormatPickle = (pickle) => {
  return {
    id: pickle._id,
    title: pickle.title,
    capacity: pickle.capacity,
    participants: pickle.participants,
    deadLine: pickle.deadLine,
    where: pickle.where,
    when: pickle.when,
  };
}
