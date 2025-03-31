  const { OAuth2Client } = require("google-auth-library");
  const User = require("../models/user");
  const jwt = require("jsonwebtoken");

  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  const googleLogin = async (req, res) => {
    try {
      const token = req.body.token || req.body.credential;
  
      if (!token) {
        console.error("❌ No token provided");
        return res.status(400).json({ message: "Token is required" });
      }
  
      console.log("🔹 Received Token:", token);
  
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
  
      const payload = ticket.getPayload();
      console.log("✅ Token Verified:", payload);
  
      const { email, sub: googleId, name, picture } = payload;
  
      let user = await User.findOne({ $or: [{ googleId }, { email }] });
  
      if (!user) {
        user = new User({ email, googleId, authType: 'google', name, picture });
        await user.save();
      } else {
        user.googleId = googleId;
        user.authType = 'google';
        user.name = name || user.name;
        user.picture = picture || user.picture;
        await user.save();
      }
  
      const authToken = jwt.sign(
        { userId: user._id, email: user.email, googleId: user.googleId },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );
  
      res.status(200).json({
        message: "Google authentication successful",
        token: authToken,
        user: { id: user._id, email: user.email, name: user.name, picture: user.picture }
      });
  
    } catch (error) {
      console.error("❌ Google auth error:", error.message);
      res.status(401).json({ message: "Authentication failed", error: error.message });
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
  const signup = async (req, res) => {
    const { email, password, name } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
  
    try {
      // Check if user already exists
      let existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email is already registered" });
      }
  
      // Create new user
      const newUser = new User({
        email,
        password, // This will be hashed automatically due to `pre("save")` middleware
        name: name || email.split("@")[0], // Default name from email if not provided
        authType: "email"
      });
  
      await newUser.save();
  
      res.status(201).json({
        message: "User registered successfully!",
        user: {
          id: newUser._id,
          email: newUser.email,
          name: newUser.name
        }
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  };
  
  module.exports = { googleLogin, emailLogin, signup };
  