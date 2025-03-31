const { google } = require("googleapis");

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Exchange authorization code for tokens
const getAccessToken = async (authCode) => {
  try {
    const { tokens } = await oauth2Client.getToken(authCode);
    oauth2Client.setCredentials(tokens);
    console.log("✅ Access Token:", tokens.access_token);
    return tokens;
  } catch (error) {
    console.error("❌ Error exchanging auth code:", error.response?.data || error.message);
  }
};
