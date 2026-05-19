import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DesktopApp from './DesktopApp';
import MobileApp from './MobileApp';
import Docs from './components/Docs';
import SignInPage from './components/SignInPage';
import SignUpPage from './components/SignUpPage';
import { UserProfile } from './types';
import { GoogleOAuthProvider } from '@react-oauth/google';

const App: React.FC = () => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const mobileRegex = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      const isMobileDevice = mobileRegex.test(userAgent.toLowerCase());
      const isSmallScreen = window.innerWidth < 1024;
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [user, setUser] = React.useState<UserProfile | null>(null);

  const handleLogin = (userData: UserProfile) => {
    setUser(userData);
  };

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter>
        <Routes>
          <Route path="/docs" element={<Docs />} />
          <Route path="/signin" element={<SignInPage onLogin={handleLogin} />} />
          <Route path="/signup" element={<SignUpPage onRegister={handleLogin} />} />
          <Route 
            path="*" 
            element={
              isMobile ? 
              <MobileApp /> : 
              <DesktopApp user={user} setUser={setUser} />
            } 
          />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
};

export default App;