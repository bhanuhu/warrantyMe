const verifyGoogleToken = async (token) => {
  try {
    if (!token) {
      console.error("❌ No token provided");
      throw new Error("Token is missing");
    }

    console.log("🔹 Received Token:", token);

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    console.log("✅ Token Verified:", payload);

    return payload;
  } catch (error) {
    console.error("❌ Token Verification Failed:", error.message);
    throw new Error("Invalid token");
  }
};
