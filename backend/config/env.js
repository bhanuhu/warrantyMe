require("dotenv").config();

const config = {
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  port: process.env.PORT || 5000,
};

module.exports = config;