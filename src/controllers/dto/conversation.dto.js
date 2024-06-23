export const conversationFormat = (conversation) => {
  return {
    imageUrl: conversation.imageUrl,
    title: conversation.title,
    updatedAt: conversation.lastUpdatedAt,
    _id: conversation._id,
    lastMessage: conversation.lastMessage,
    participants: conversation.participants,
    pickleId: conversation.pickleId,
    lastMessageIsTrack: conversation.lastMessageIsTrack
  }
}