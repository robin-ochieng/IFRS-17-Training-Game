// LeaderboardModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Trophy, 
  Medal, 
  TrendingUp, 
  Users, 
  Clock, 
  Star,
  RefreshCw,
  X,
  ChevronDown,
  Globe,
  Target,
  Zap
} from 'lucide-react';
import {
  getOverallLeaderboard,
  getModuleLeaderboard,
  getLeaderboardStats,
  subscribeToLeaderboard,
  unsubscribeFromLeaderboard
} from './supabaseService';
import ModalPortal from '../components/ui/ModalPortal';

const LeaderboardModal = ({ 
  isOpen, 
  onClose, 
  currentUser, 
  modules = [],
  userScore = 0,
  userLevel = 1,
  userAchievements = 0,
  userCompletedModules = []
}) => {
  const [activeTab, setActiveTab] = useState('overall');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userPosition, setUserPosition] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [showStats, setShowStats] = useState(true);
  const [realtimeSubscription, setRealtimeSubscription] = useState(null);

  // Load leaderboard data
  const loadLeaderboardData = useCallback(async (tab) => {
    setIsLoading(true);
    try {
      console.log(`📊 Loading ${tab} leaderboard...`);
      
      let result;
      if (tab === 'overall') {
        result = await getOverallLeaderboard(currentUser?.id);
      } else {
        const moduleId = parseInt(tab);
        result = await getModuleLeaderboard(moduleId, currentUser?.id);
      }

      // Process data for display
      const processedData = result.leaderboard.map((entry) => ({
        ...entry,
        isCurrentUser: currentUser?.id === entry.user_id,
        displayName: entry.user_name || entry.name || 'Anonymous',
        displayAvatar: entry.avatar || entry.displayName?.charAt(0).toUpperCase() || '?'
      }));

      setLeaderboardData(processedData);
      setUserPosition(result.userPosition);
      setLastRefresh(new Date());
      
      console.log(`✅ Loaded ${processedData.length} entries`);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      setLeaderboardData([]);
      setUserPosition(null);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.id]);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const statsData = await getLeaderboardStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }, []);

  // Setup realtime subscription
  useEffect(() => {
    if (isOpen) {
      const subscription = subscribeToLeaderboard(() => {
        // Refresh current tab when data changes
        loadLeaderboardData(activeTab);
      });
      setRealtimeSubscription(subscription);

      return () => {
        if (subscription) {
          unsubscribeFromLeaderboard(subscription);
        }
      };
    }
  }, [isOpen, activeTab, loadLeaderboardData]);

  // Load initial data
  useEffect(() => {
    if (isOpen) {
      loadLeaderboardData(activeTab);
      loadStats();
    }
  }, [isOpen, activeTab, loadLeaderboardData, loadStats]);

  // Handle manual refresh
  const handleRefresh = () => {
    loadLeaderboardData(activeTab);
    loadStats();
  };

  // Get rank display
  const getRankDisplay = (rank) => {
    if (rank === 1) return { icon: '🥇', color: 'from-yellow-400 to-amber-500' };
    if (rank === 2) return { icon: '🥈', color: 'from-gray-300 to-gray-400' };
    if (rank === 3) return { icon: '🥉', color: 'from-orange-400 to-orange-600' };
    return { icon: rank.toString(), color: 'from-gray-600 to-gray-700' };
  };

  // Format time
  const formatTime = (seconds) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate user percentile
  const getUserPercentile = () => {
    const position = userPosition?.rank || 
                    leaderboardData.findIndex(u => u.isCurrentUser) + 1;
    if (!position || leaderboardData.length === 0) return null;
    return Math.round((1 - (position - 1) / leaderboardData.length) * 100);
  };

  if (!isOpen) return null;

  return (
    <ModalPortal>
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
      <div
        className="bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 rounded-2xl max-w-6xl w-full max-h-[92dvh] flex flex-col overflow-hidden border border-purple-500/30 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Leaderboard"
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm p-4 sm:p-6 border-b border-white/10">
          <div className="flex justify-between items-start gap-3">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="p-2.5 sm:p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex-shrink-0">
                <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                  {activeTab === 'overall' ? 'IFRS17 Game Leaderboard' : `${modules[activeTab]?.title || 'Module'} Leaderboard`}
                </h2>
                <p className="text-gray-300 mt-1 text-sm sm:text-base">
                  Compete with players worldwide
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
              aria-label="Close leaderboard"
            >
              <X className="w-6 h-6 text-gray-400 hover:text-white" />
            </button>
          </div>

          {/* Stats Bar */}
          {showStats && stats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 mt-4">
              <div className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-400 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-xs">Total Players</span>
                </div>
                <p className="text-xl font-bold text-white">{stats.totalPlayers}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center gap-2 text-green-400 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs">Active (30d)</span>
                </div>
                <p className="text-xl font-bold text-white">{stats.activePlayers}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center gap-2 text-purple-400 mb-1">
                  <Target className="w-4 h-4" />
                  <span className="text-xs">Completions</span>
                </div>
                <p className="text-xl font-bold text-white">{stats.totalCompletions}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center gap-2 text-yellow-400 mb-1">
                  <Star className="w-4 h-4" />
                  <span className="text-xs">Perfect Runs</span>
                </div>
                <p className="text-xl font-bold text-white">{stats.perfectCompletions}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center gap-2 text-orange-400 mb-1">
                  <Zap className="w-4 h-4" />
                  <span className="text-xs">Avg Completion</span>
                </div>
                <p className="text-xl font-bold text-white">{stats.averageCompletionRate}%</p>
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex-shrink-0 bg-black/30 backdrop-blur-sm border-b border-white/10 px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setActiveTab('overall')}
                className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  activeTab === 'overall'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <Trophy className="w-4 h-4 inline mr-2" />
                Overall
              </button>
              
              {modules.map((module, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(index.toString())}
                  className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                    activeTab === index.toString()
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : userCompletedModules.includes(index)
                      ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-500/30'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  <span className="text-lg">{module.icon}</span>
                  <span className="hidden md:inline">{module.title}</span>
                  {userCompletedModules.includes(index) && (
                    <span className="text-xs">✓</span>
                  )}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => setShowStats(!showStats)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Toggle Stats"
              >
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showStats ? '' : 'rotate-180'}`} />
              </button>
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`w-5 h-5 text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* User Position Card */}
        {(userPosition || leaderboardData.find(u => u.isCurrentUser)) && (
          <div className="flex-shrink-0 mx-4 sm:mx-6 mt-4">
            <div className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 backdrop-blur-sm rounded-xl p-4 border border-purple-400/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${
                    getRankDisplay(userPosition?.rank || leaderboardData.findIndex(u => u.isCurrentUser) + 1).color
                  } flex items-center justify-center text-white font-bold text-xl`}>
                    {getRankDisplay(userPosition?.rank || leaderboardData.findIndex(u => u.isCurrentUser) + 1).icon}
                  </div>
                  <div>
                    <p className="text-purple-300 text-sm">Your Position</p>
                    <p className="text-white text-xl font-bold">{currentUser?.name}</p>
                    <p className="text-gray-400 text-sm">{currentUser?.organization}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left sm:text-right">
                  <div>
                    <p className="text-gray-400 text-xs">Score</p>
                    <p className="text-yellow-400 font-bold text-lg">
                      {activeTab === 'overall' ? userScore.toLocaleString() : (userPosition?.score || 0).toLocaleString()}
                    </p>
                  </div>
                  {activeTab === 'overall' && (
                    <>
                      <div>
                        <p className="text-gray-400 text-xs">Level</p>
                        <p className="text-purple-400 font-bold text-lg">{userLevel}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Awards</p>
                        <p className="text-green-400 font-bold text-lg">{userAchievements}</p>
                      </div>
                    </>
                  )}
                  <div>
                    <p className="text-gray-400 text-xs">Percentile</p>
                    <p className="text-orange-400 font-bold text-lg">
                      Top {getUserPercentile() || '?'}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard List — flex-1 fills remaining panel height, scrolls internally */}
        <div className="flex-1 min-h-0 p-4 sm:p-6 overflow-y-auto overscroll-contain">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-white text-lg animate-pulse">Loading leaderboard...</div>
            </div>
          ) : leaderboardData.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">
                {activeTab === 'overall' 
                  ? 'No scores yet. Be the first to complete the training!'
                  : 'No one has completed this module yet. Be the first!'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboardData.map((entry, index) => {
                const rankDisplay = getRankDisplay(entry.rank || index + 1);
                return (
                  <div
                    key={entry.user_id || index}
                    className={`rounded-xl p-4 transition-all transform hover:scale-[1.02] ${
                      entry.isCurrentUser
                        ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-2 border-purple-400/50'
                        : 'bg-white/5 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        {/* Rank Badge */}
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-full bg-gradient-to-br ${rankDisplay.color}
                          flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg`}>
                          {rankDisplay.icon}
                        </div>
                        
                        {/* User Info */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center
                            text-white font-bold bg-gradient-to-br ${
                            entry.isCurrentUser
                              ? 'from-purple-500 to-pink-500'
                              : 'from-blue-500 to-indigo-500'
                          }`}>
                            {entry.displayAvatar}
                          </div>
                          <div className="min-w-0">
                            <p className="text-white font-semibold flex items-center gap-2 min-w-0">
                              <span className="truncate">{entry.displayName}</span>
                              {entry.isCurrentUser && (
                                <span className="text-xs bg-purple-600 px-2 py-0.5 rounded-full flex-shrink-0">You</span>
                              )}
                              {activeTab !== 'overall' && entry.perfect_completion && (
                                <Star className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                              )}
                            </p>
                            <div className="flex items-center gap-3 text-sm min-w-0">
                              <p className="text-gray-400 truncate">{entry.organization || 'Independent'}</p>
                              {entry.country && entry.country !== 'Unknown' && (
                                <>
                                  <span className="text-gray-600 hidden sm:inline">•</span>
                                  <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
                                    <Globe className="w-3 h-3 text-gray-500" />
                                    <p className="text-gray-400">{entry.country}</p>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Stats */}
                      <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
                        <div className="text-center">
                          <p className="text-yellow-400 font-bold text-lg">
                            {(entry.score || 0).toLocaleString()}
                          </p>
                          <p className="text-gray-500 text-xs">points</p>
                        </div>
                        
                        {activeTab === 'overall' ? (
                          <>
                            <div className="text-center hidden md:block">
                              <p className="text-purple-400 font-semibold">{entry.level || 1}</p>
                              <p className="text-gray-500 text-xs">Level</p>
                            </div>
                            <div className="text-center hidden md:block">
                              <p className="text-green-400 font-semibold">{entry.modules_completed || 0}</p>
                              <p className="text-gray-500 text-xs">Modules</p>
                            </div>
                            {entry.average_completion_time > 0 && (
                              <div className="text-center hidden lg:block">
                                <div className="flex items-center gap-1 justify-center">
                                  <Clock className="w-4 h-4 text-cyan-400" />
                                  <p className="text-cyan-400 font-semibold">
                                    {formatTime(entry.average_completion_time)}
                                  </p>
                                </div>
                                <p className="text-gray-500 text-xs">Avg Time</p>
                              </div>
                            )}
                            <div className="text-center hidden lg:block">
                              <p className="text-orange-400 font-semibold">{entry.achievements || 0}</p>
                              <p className="text-gray-500 text-xs">Awards</p>
                            </div>
                          </>
                        ) : (
                          <>
                            {entry.completion_time && (
                              <div className="text-center">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4 text-cyan-400" />
                                  <p className="text-cyan-400 font-semibold">
                                    {formatTime(entry.completion_time)}
                                  </p>
                                </div>
                                <p className="text-gray-500 text-xs">Time</p>
                              </div>
                            )}
                            {entry.perfect_completion && (
                              <div className="text-center">
                                <Medal className="w-6 h-6 text-yellow-400 mx-auto" />
                                <p className="text-gray-500 text-xs">Perfect</p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 bg-black/30 backdrop-blur-sm border-t border-white/10 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <p className="text-gray-400 text-xs sm:text-sm">
              {lastRefresh && `Last updated: ${lastRefresh.toLocaleTimeString()}`}
              {realtimeSubscription && ' • Live updates enabled'}
            </p>
            <div className="flex items-center flex-wrap gap-2 text-xs sm:text-sm">
              <span className="text-gray-400">Showing top {leaderboardData.length} players</span>
              {getUserPercentile() && (
                <span className="text-purple-400 font-semibold">
                  • You're in the top {getUserPercentile()}%!
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
};

export default LeaderboardModal;