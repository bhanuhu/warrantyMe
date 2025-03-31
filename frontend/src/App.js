import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import LoginPage from "./components/LoginPage/loginPage";
import EditorPage from './components/Editor/editorPage';

function App() {
  return (
    <GoogleOAuthProvider 
      clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
      onScriptLoadError={(error) => {
        console.error('Failed to load Google OAuth script:', error);
      }}
      onScriptLoadSuccess={() => console.log('Google OAuth script loaded successfully')}
    >
      <Router>
        <div className="app">
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/editor" element={<EditorPage />} />
          </Routes>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
