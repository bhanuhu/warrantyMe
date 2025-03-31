const { google } = require('googleapis');
const User = require('../models/user');

const uploadToDrive = async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.user.userId;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const user = await User.findById(userId);
    if (!user || !user.googleRefreshToken) {
      return res.status(401).json({ message: "User not authenticated with Google" });
    }

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Set refresh token
    oauth2Client.setCredentials({ refresh_token: user.googleRefreshToken });

    // Get a new access token
    const { token } = await oauth2Client.getAccessToken();
    oauth2Client.setCredentials({ access_token: token });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const fileMetadata = {
      name: title,
      mimeType: 'application/vnd.google-apps.document',
      parents: ['root']
    };

    const media = {
      mimeType: 'text/html',
      body: content
    };

    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, webViewLink, name'
    });

    console.log('File saved successfully:', file.data);

    await drive.permissions.create({
      fileId: file.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });

    res.status(200).json({
      message: "Document saved successfully",
      fileId: file.data.id,
      webViewLink: file.data.webViewLink,
      fileName: file.data.name
    });

  } catch (error) {
    console.error('Drive save error:', error);

    if (error.response?.data?.error === "invalid_grant") {
      return res.status(401).json({
        message: "Invalid authorization. Please reauthenticate.",
        error: error.response.data.error_description
      });
    }

    res.status(500).json({
      message: "Failed to save document",
      error: error.message
    });
  }
};

module.exports = { uploadToDrive };
