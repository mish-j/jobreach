import React, { useState, useEffect } from 'react';
import './App.css';
import Landing from './pages/landing';
import Dashboard from './pages/Dashboard';
import LoginModal from './components/LoginModal';
import SignupModal from './components/SignupModal';
 
import { tokenUtils } from './utils/api';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Check for test mode via URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const testMode = urlParams.get('test') === 'true';

  useEffect(() => {
    // Check if user is logged in
    const token = tokenUtils.getAccessToken();
    if (token) {
      setIsLoggedIn(true);
      // You can fetch user data here from your API
      // For now, we'll use mock data
      setUser({
        username: 'user@example.com',
        full_name: 'John Doe'
      });
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setIsLoginModalOpen(false);
    // You can fetch user data here after successful login
    setUser({
      username: 'user@example.com',
      full_name: 'John Doe'
    });
  };

  const handleLogout = () => {
    tokenUtils.clearTokens();
    setIsLoggedIn(false);
    setUser(null);
  };
 

  return (
    <div className="App">
      {isLoggedIn ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <Landing 
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onOpenSignup={() => setIsSignupModalOpen(true)}
        />
      )}
      
      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSwitchToSignup={() => {
          setIsLoginModalOpen(false);
          setIsSignupModalOpen(true);
        }}
        onLoginSuccess={handleLoginSuccess}
      />
      
      <SignupModal 
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        onSwitchToLogin={() => {
          setIsSignupModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />
    </div>
  );
}

export default App;
