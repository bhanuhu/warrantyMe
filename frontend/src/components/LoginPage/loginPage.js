import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useGoogleOneTapLogin } from 'react-google-one-tap-login';
import axios from 'axios';
import './loginPage.css';

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const LoginPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {

      if (!credentialResponse.credential) {
        console.error("No token provided");
        setError("Google authentication failed. No token received.");
        return;
      }
  
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/google`,
        { credential: credentialResponse.credential }, // ✅ Send only the token string
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
  
      const { token, user } = response.data;
      localStorage.setItem("jwtToken", token);
      localStorage.setItem("isGoogleUser", "true");
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/editor");
    } catch (err) {
      console.error("Google authentication error:", err);
      setError("Google authentication failed. Please try again.");
    }
  };
  

  const handleGoogleError = () => {
    console.error('Google authentication failed');
    setError('Google authentication failed');
  };

  useGoogleOneTapLogin({
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
    googleAccountConfigs: {
      client_id: clientId,
    },
  });

  const validateEmail = (input) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input)) {
      setError('Invalid email format.');
      return false;
    }
    setError('');
    return true;
  };

  const checkPasswordStrength = (input) => {
    if (input.length === 0) {
      setPasswordStrength('');
    } else if (input.length < 6) {
      setPasswordStrength('Weak');
    } else if (
      input.match(/[A-Za-z]/) &&
      input.match(/[0-9]/) &&
      input.length >= 8
    ) {
      setPasswordStrength('Strong');
    } else {
      setPasswordStrength('Moderate');
    }
  };

  const validateInputs = () => {
    if (!validateEmail(email)) return false;
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return false;
    }
    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    setError('');
    return true;
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;

    const endpoint = isSignUp ? 'signup' : 'login';
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/${endpoint}`,
        { email, password }
      );

      const { token, user } = response.data;
      localStorage.setItem('jwtToken', token);
      localStorage.setItem('isGoogleUser', 'false');
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/editor');
    } catch (err) {
      console.error(`${isSignUp ? 'Signup' : 'Login'} error:`, err);
      setError(
        err.response?.data?.message ||
          `Failed to ${isSignUp ? 'sign up' : 'login'}`
      );
    }
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="login-page">
        <div className="login-container">
          <h1>{isSignUp ? 'Create Your Account' : 'Welcome Back'}</h1>
          <div className="login-options">
            <div className="google-login">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                responseType="id_token"
                clientId={clientId}
              />
            </div>
            <div className="divider">
              <span>or</span>
            </div>
            <form onSubmit={handleAuth} className="email-login">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  validateEmail(e.target.value);
                }}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  checkPasswordStrength(e.target.value);
                }}
                required
              />
              {isSignUp && (
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              )}
              {passwordStrength && isSignUp && (
                <p className={`password-strength ${passwordStrength.toLowerCase()}`}>
                  Password Strength: {passwordStrength}
                </p>
              )}
              {error && <div className="error-message">{error}</div>}
              <button type="submit">
                {isSignUp ? 'Sign Up' : 'Login'}
              </button>
            </form>
            <p>
              {isSignUp
                ? 'Already have an account?'
                : "Don't have an account?"}{' '}
              <button type="button" onClick={() => setIsSignUp(!isSignUp)}>
                {isSignUp ? 'Log In' : 'Create one'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default LoginPage;
