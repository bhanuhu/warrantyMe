const mongoose = require('mongoose');
const bcryptjs = require("bcryptjs");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function() {
      return this.authType === 'email';
    }
  },
  name: {
    type: String,
    trim: true
  },
  picture: {
    type: String
  },
  authType: {
    type: String,
    enum: ['email', 'google'],
    required: true
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  googleTokens: {
    accessToken: String,
    refreshToken: String,
    expiryDate: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password") && this.password) {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcryptjs.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;