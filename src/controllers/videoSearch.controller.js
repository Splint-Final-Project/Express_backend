import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.GOOGLE_API_KEY,
});

export const youtubeSearch = async (req, res) => {
  const query = req.query.q;
  try {
    const response = await youtube.search.list({
      part: 'snippet',
      q: query,
      type: 'video',
      maxResults: 10,
      videoEmbeddable: 'true',
    });

    const video = response.data.items[0];
    res.json({response: response.data.items});
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};