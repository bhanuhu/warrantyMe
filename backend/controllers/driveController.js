const { google } = require('googleapis');
const User = require('../models/user');

const uploadToDrive = async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.user.userId;
    
    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    // Get user from database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.googleId) {
      return res.status(401).json({ message: "User not authenticated with Google" });
    }

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost:3000'
    );

    // Get new access token using client credentials
    const { tokens } = await oauth2Client.getToken(process.env.GOOGLE_CLIENT_ID);
    oauth2Client.setCredentials(tokens);

    // Create Drive instance
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Create file metadata
    const fileMetadata = {
      name: title,
      mimeType: 'application/vnd.google-apps.document',
      parents: ['root'] // Save to root folder
    };

    // Create file content
    const media = {
      mimeType: 'text/html',
      body: content
    };

    // Upload file to Drive
    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, webViewLink, name'
    });

    console.log('File saved successfully:', file.data);

    // Update file permissions to make it accessible
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

    // Handle specific Google API errors
    if (error.code === 401 || error.response?.status === 401) {
      return res.status(401).json({
        message: "Google authentication failed. Please log in again.",
        error: error.message
      });
    }

    if (error.code === 403 || error.response?.status === 403) {
      return res.status(403).json({
        message: "Access to Google Drive denied. Please check permissions.",
        error: error.message
      });
    }

    res.status(500).json({
      message: "Failed to save document",
      error: error.message
    });
  }
};

module.exports = { uploadToDrive };