import { useState, useEffect, useCallback, useRef } from 'react';
import {
  achievementsList,
  getNewAchievements,
  createAchievementStats,
  getGenderBasedAchievementName,
  getGenderBasedAchievementIcon,
} from '../modules/achievements';

const useAchievements = ({
  score,
  streak,
  level,
  combo,
  completedModules,
  perfectModulesCount,
  currentUser,
}) => {
  const [achievements, setAchievements] = useState([]);
  const [showAchievement, setShowAchievement] = useState(null);
  const toastTimeoutRef = useRef(null);

  const clearToastTimeout = useCallback(() => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
  }, []);

  const scheduleToastClear = useCallback(() => {
    clearToastTimeout();
    toastTimeoutRef.current = setTimeout(() => {
      setShowAchievement(null);
      toastTimeoutRef.current = null;
    }, 7000);
  }, [clearToastTimeout]);

  const restoreAchievements = useCallback((achievementIds = []) => {
    if (!Array.isArray(achievementIds) || achievementIds.length === 0) {
      setAchievements([]);
      return;
    }

    const restored = achievementsList.filter((achievement) =>
      achievementIds.includes(achievement.id)
    );
    setAchievements(restored);
  }, []);

  const resetAchievements = useCallback(() => {
    setAchievements([]);
    setShowAchievement(null);
    clearToastTimeout();
  }, [clearToastTimeout]);

  const getAchievementDisplayData = useCallback(
    (achievement) => {
      if (!achievement) return null;
      const originalAchievement = achievementsList.find(
        (candidate) => candidate.id === achievement.id
      );

      if (originalAchievement?.genderBased && currentUser?.gender) {
        return {
          ...achievement,
          name: getGenderBasedAchievementName(
            originalAchievement,
            currentUser.gender
          ),
          icon: getGenderBasedAchievementIcon(
            originalAchievement,
            currentUser.gender
          ),
        };
      }

      return achievement;
    },
    [currentUser?.gender]
  );

  const checkAchievementConditions = useCallback(() => {
    const stats = createAchievementStats({
      score,
      streak,
      level,
      completedModules,
      perfectModulesCount,
      combo,
    });

    const newAchievements = getNewAchievements(
      achievements,
      stats,
      currentUser?.gender
    );

    if (newAchievements.length > 0) {
      const firstNewAchievement = newAchievements[0];
      setAchievements((prev) => [...prev, firstNewAchievement]);
      setShowAchievement(firstNewAchievement);
      scheduleToastClear();
    }
  }, [
    achievements,
    combo,
    completedModules,
    currentUser?.gender,
    level,
    perfectModulesCount,
    scheduleToastClear,
    score,
    streak,
  ]);

  useEffect(() => {
    checkAchievementConditions();
  }, [checkAchievementConditions]);

  useEffect(
    () => () => {
      clearToastTimeout();
    },
    [clearToastTimeout]
  );

  return {
    achievements,
    showAchievement,
    restoreAchievements,
    resetAchievements,
    getAchievementDisplayData,
  };
};

export default useAchievements;
