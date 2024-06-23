import axios from "axios";

export const playPickleSoundTrack = async (command, token) => {
  if (command.startsWith('!!음악')) {
    const musicTitle = command.slice(6).trim();

    try {
      const response = await axios.get('https://api.spotify.com/v1/search', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          q: musicTitle,
          type: 'track',
          limit: 1
        }
      });
  
      if (response.status === 200) {
        const track = response.data.tracks.items[0];
        return {messages: track.id, isTrack: true};
      } else {
        return {messages: "찾으시는 음악을 발견하지 못했어요.", isTrack: false};
      }
    } catch (error) {
      throw new Error('Error searching track:', error.response ? error.response.data : error.message);
    }
  }
  // 추가 명령어 처리 로직을 여기에 구현합니다.
  return {messages: "잘못된 명령어에요. (예: !!음악 음악 제목)", isTrack: false};
};