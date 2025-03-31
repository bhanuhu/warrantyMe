const { OAuth2Client } = require("google-auth-library");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = async (req, res) => {
  try {
    // Handle both One Tap and regular sign-in
    const token = req.body.token || req.body.credential;
    
    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    // Verify the ID token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { email, sub: googleId, name, picture } = payload;

    // Find or create user
    let user = await User.findOne({ 
      $or: [
        { googleId },
        { email }
      ]
    });
    
    if (!user) {
      // Create new user
      user = new User({
        email,
        googleId,
        authType: 'google',
        name,
        picture
      });
      await user.save();
    } else {
      // Update existing user's Google info
      user.googleId = googleId;
      user.authType = 'google';
      user.name = name || user.name;
      user.picture = picture || user.picture;
      await user.save();
    }

    // Generate JWT token
    const authToken = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        googleId: user.googleId
      }, 
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      message: "Google authentication successful",
      token: authToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture
      }
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(401).json({
      message: "Authentication failed",
      error: error.message
    });
  }
};

const emailLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.authType === 'google') {
      return res.status(400).json({ 
        message: "This account uses Google Sign-In. Please login with Google." 
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

module.exports = { googleLogin, emailLogin };