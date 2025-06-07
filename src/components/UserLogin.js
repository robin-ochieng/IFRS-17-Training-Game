// src/components/UserLogin.js
import React, { useState } from 'react';
import { User, Plus, LogIn } from 'lucide-react';
import { getAllUsers, createUserProfile, saveUser, setCurrentUser } from '../modules/userProfile';

const UserLogin = ({ onLogin }) => {
  const [users] = useState(getAllUsers());
  const [showNewUser, setShowNewUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserOrg, setNewUserOrg] = useState('');

  const handleCreateUser = () => {
    if (newUserName.trim()) {
      const newUser = createUserProfile(newUserName.trim(), newUserEmail.trim(), newUserOrg.trim());
      saveUser(newUser);
      setCurrentUser(newUser.id);
      onLogin(newUser);
    }
  };

  const handleSelectUser = (user) => {
    setCurrentUser(user.id);
    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4 flex items-center justify-center">
      <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 border border-white/10 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">IFRS 17 Training</h1>
          <p className="text-gray-400">Select your profile to continue</p>
        </div>

        {/* Existing Users */}
        {users.length > 0 && !showNewUser && (
          <div className="space-y-3 mb-6">
            {users.map(user => (
              <button
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl p-4 transition-all duration-200 flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {user.avatar}
                </div>
                <div className="text-left flex-1">
                  <p className="text-white font-semibold">{user.name}</p>
                  <p className="text-gray-400 text-sm">{user.organization || 'No organization'}</p>
                </div>
                <LogIn className="w-5 h-5 text-gray-400" />
              </button>
            ))}
          </div>
        )}

        {/* New User Form */}
        {showNewUser && (
          <div className="space-y-4 mb-6">
            <input
              type="text"
              placeholder="Your Name"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
              autoFocus
            />
            <input
              type="email"
              placeholder="Email (optional)"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
            />
            <input
              type="text"
              placeholder="Organization (optional)"
              value={newUserOrg}
              onChange={(e) => setNewUserOrg(e.target.value)}
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
            />
            <div className="flex gap-3">
              <button
                onClick={handleCreateUser}
                disabled={!newUserName.trim()}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white rounded-lg py-3 font-semibold transition-all duration-200"
              >
                Create Profile
              </button>
              <button
                onClick={() => setShowNewUser(false)}
                className="px-6 bg-white/5 hover:bg-white/10 border border-white/20 text-white rounded-lg transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Add New User Button */}
        {!showNewUser && (
          <button
            onClick={() => setShowNewUser(true)}
            className="w-full bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 text-purple-400 rounded-xl p-4 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Profile</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default UserLogin;