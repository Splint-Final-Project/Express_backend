import axios from "axios";
import querystring from "querystring";
import dotenv from "dotenv";

dotenv.config();

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

export const spotifyAuth = async (req, res, next) => {
  const authOptions = {
    headers: {
      'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64')),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  }

  const data = querystring.stringify({
    grant_type: 'client_credentials',
    redirect_uri: "http://localhost:8080/callback",
  });

  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', data, authOptions);
    if (response.status === 200) {
      // request 객체에 저장
      req.access_token = response.data.access_token;

      next();
    } else {
      res.status(response.status).json({ error: 'Failed to retrieve access token' });
    }
  } catch (error) {
    console.error('Error getting access token:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};