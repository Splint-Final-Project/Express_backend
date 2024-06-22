export const playPickleSoundTrack = async (command, isGroup) => {
  if (!isGroup) return;
  if (command.startsWith('!!play')) {
    const musicTitle = command.slice(6).trim();
    return `Playing music: ${musicTitle}`;
  }
  // 추가 명령어 처리 로직을 여기에 구현합니다.
  return 'Unknown command.';
};