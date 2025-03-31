const { google } = require("googleapis");

const uploadFileToDrive = async (authToken, fileContent, fileName) => {
  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: authToken });

    const drive = google.drive({ version: "v3", auth });
    const fileMetadata = {
      name: fileName,
      mimeType: "application/vnd.google-apps.document",
    };
    const media = {
      mimeType: "text/plain",
      body: fileContent,
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: "id",
    });

    return response.data.id;
  } catch (error) {
    throw new Error("File upload failed");
  }
};

module.exports = { uploadFileToDrive };