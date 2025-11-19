import { useState, useEffect, useRef, useCallback } from 'react';

const getSessionValue = (moduleId, key) => {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage.getItem(`timer_${key}_${moduleId}`);
  } catch (error) {
    console.warn('Timer session get failed:', error);
    return null;
  }
};

const setSessionValue = (moduleId, key, value) => {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(`timer_${key}_${moduleId}`, value);
  } catch (error) {
    console.warn('Timer session set failed:', error);
  }
};

const removeSessionValue = (moduleId, key) => {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(`timer_${key}_${moduleId}`);
  } catch (error) {
    console.warn('Timer session remove failed:', error);
  }
};

const useModuleTimer = ({ currentModule, currentUser, isModuleCompleted }) => {
  const [timerState, setTimerState] = useState('idle');
  const [currentTime, setCurrentTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [moduleStartTime, setModuleStartTime] = useState(null);
  const timerInterval = useRef(null);

  const clearTimerInterval = useCallback(() => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    if (timerState !== 'idle') return;

    const startTime = new Date();
    setModuleStartTime(startTime);
    setTimerState('running');
    setCurrentTime(0);
    setElapsedTime(0);

    setSessionValue(currentModule, 'start', startTime.toISOString());
    setSessionValue(currentModule, 'state', 'running');
  }, [timerState, currentModule]);

  const stopTimer = useCallback(() => {
    if (timerState !== 'running') return;

    setTimerState('stopped');

    if (moduleStartTime) {
      const finalElapsed = Math.floor((new Date() - moduleStartTime) / 1000);
      setElapsedTime(finalElapsed);
      setCurrentTime(finalElapsed);
      setSessionValue(currentModule, 'elapsed', finalElapsed.toString());
      setSessionValue(currentModule, 'state', 'stopped');
    }

    clearTimerInterval();
  }, [timerState, moduleStartTime, currentModule, clearTimerInterval]);

  const resetTimer = useCallback(() => {
    setTimerState('idle');
    setModuleStartTime(null);
    setCurrentTime(0);
    setElapsedTime(0);
    clearTimerInterval();
    removeSessionValue(currentModule, 'start');
    removeSessionValue(currentModule, 'state');
    removeSessionValue(currentModule, 'elapsed');
  }, [currentModule, clearTimerInterval]);

  useEffect(() => {
    if (timerState === 'running' && moduleStartTime && !isModuleCompleted) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((new Date() - moduleStartTime) / 1000);
        setCurrentTime(elapsed);
        setElapsedTime(elapsed);
      }, 1000);

      timerInterval.current = interval;
      return () => {
        clearInterval(interval);
        timerInterval.current = null;
      };
    }

    clearTimerInterval();
    return undefined;
  }, [timerState, moduleStartTime, isModuleCompleted, clearTimerInterval]);

  useEffect(() => {
    if (!currentUser) return;
    if (currentModule === null || currentModule === undefined) return;

    if (isModuleCompleted) {
      setTimerState('idle');
      setModuleStartTime(null);
      setCurrentTime(0);
      setElapsedTime(0);
      clearTimerInterval();
      return;
    }

    const savedState = getSessionValue(currentModule, 'state');
    const savedStart = getSessionValue(currentModule, 'start');
    const savedElapsed = getSessionValue(currentModule, 'elapsed');

    if (savedState === 'running' && savedStart) {
      const start = new Date(savedStart);
      const elapsed = Math.floor((new Date() - start) / 1000);
      setModuleStartTime(start);
      setTimerState('running');
      setCurrentTime(elapsed);
      setElapsedTime(elapsed);
    } else if (savedState === 'stopped' && savedElapsed) {
      const elapsed = parseInt(savedElapsed, 10) || 0;
      setModuleStartTime(null);
      setTimerState('stopped');
      setCurrentTime(elapsed);
      setElapsedTime(elapsed);
    } else {
      setTimerState('idle');
      setModuleStartTime(null);
      setCurrentTime(0);
      setElapsedTime(0);
    }
  }, [currentModule, currentUser, isModuleCompleted, clearTimerInterval]);

  useEffect(() => () => clearTimerInterval(), [clearTimerInterval]);

  const formatTime = useCallback((seconds) => {
    if (seconds === null || seconds === undefined) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    timerState,
    currentTime,
    elapsedTime,
    startTimer,
    stopTimer,
    resetTimer,
    formatTime,
  };
};

export default useModuleTimer;
