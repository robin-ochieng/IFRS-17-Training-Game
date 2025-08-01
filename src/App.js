// App.js
import React, { useState, useEffect } from 'react';
import AuthScreen from './components/AuthScreen';
import IFRS17TrainingGame from './IFRS17TrainingGame';
import { getCurrentAuthUser, signOut } from './modules/authService';
import { Loader2 } from 'lucide-react';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if there's already a logged-in user
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const user = getCurrentAuthUser();
      if (user) {
        setCurrentUser(user);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    signOut();
    setCurrentUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading IFRS 17 Master...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {currentUser ? (
        <IFRS17TrainingGame 
          onLogout={handleLogout}
          currentUser={currentUser}
        />
      ) : (
        <AuthScreen onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;