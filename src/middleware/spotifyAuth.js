import axios from "axios";
import querystring from "querystring";
import dotenv from "dotenv";

dotenv.config();

const client_id = "3a2d857058d946ad87da5722e4c6b9e3";
const client_secret = "582ef46003964fb894531f07c46bfd78";

export const spotifyAuth = async (req, res, next) => {
  const authOptions = {
    headers: {
      Authorization:
        "Basic " +
        new Buffer.from(client_id + ":" + client_secret).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

  const data = querystring.stringify({
    grant_type: "client_credentials",
    redirect_uri: "https://pickle-time.net/callback",
  });

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      data,
      authOptions
    );
    if (response.status === 200) {
      // request 객체에 저장
      req.access_token = response.data.access_token;

      next();
    } else {
      return res
        .status(response.status)
        .json({ error: "Failed to retrieve access token" });
    }
  } catch (error) {
    console.error("Error getting access token:", error);
    return res.status(500).json({ error: error });
  }
};
