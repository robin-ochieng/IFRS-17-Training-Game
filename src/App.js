// App.js
import React, { useState, useEffect } from 'react';
import UserLogin from './components/UserLogin';
import IFRS17TrainingGame from './IFRS17TrainingGame';
import { getCurrentUser } from './modules/userProfile';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if there's already a logged-in user
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    // You might want to clear the current user from storage here as well
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="App">
      {currentUser ? (
        <IFRS17TrainingGame onLogout={handleLogout} />
      ) : (
        <UserLogin onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;