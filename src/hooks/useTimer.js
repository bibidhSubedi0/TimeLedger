import { useState, useEffect, useRef } from 'react';

export const useTimer = (activeTask) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const pauseStartTimeRef = useRef(null);
  const totalPausedTimeRef = useRef(0);

  // Load persisted timer state on mount
  useEffect(() => {
    if (activeTask) {
      const savedTimer = localStorage.getItem('activeTimer');
      if (savedTimer) {
        const { taskId, startTime, isPausedState, pauseStartTime, totalPausedTime } = JSON.parse(savedTimer);
        if (taskId === activeTask.id) {
          startTimeRef.current = startTime;
          pauseStartTimeRef.current = pauseStartTime;
          totalPausedTimeRef.current = totalPausedTime;
          setIsPaused(isPausedState);
          
          // Calculate elapsed time immediately
          if (!isPausedState) {
            const now = Date.now();
            const elapsed = Math.floor((now - startTime - totalPausedTime) / 1000);
            setElapsedTime(elapsed);
          }
        }
      } else {
        // New task - initialize
        startTimeRef.current = Date.now();
        pauseStartTimeRef.current = null;
        totalPausedTimeRef.current = 0;
        persistTimerState();
      }
    }
  }, [activeTask?.id]);

  // Persist timer state to localStorage
  const persistTimerState = () => {
    if (activeTask && startTimeRef.current) {
      localStorage.setItem('activeTimer', JSON.stringify({
        taskId: activeTask.id,
        startTime: startTimeRef.current,
        isPausedState: isPaused,
        pauseStartTime: pauseStartTimeRef.current,
        totalPausedTime: totalPausedTimeRef.current
      }));
    }
  };

  useEffect(() => {
    if (activeTask && !isPaused) {
      // Calculate elapsed time based on timestamps
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTimeRef.current - totalPausedTimeRef.current) / 1000);
        setElapsedTime(elapsed);
        persistTimerState();
      }, 100); // Update every 100ms for smooth display

    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [activeTask, isPaused]);

  // Persist state when paused state changes
  useEffect(() => {
    persistTimerState();
  }, [isPaused]);

  const resetTimer = () => {
    setElapsedTime(0);
    setIsPaused(false);
    startTimeRef.current = null;
    pauseStartTimeRef.current = null;
    totalPausedTimeRef.current = 0;
    localStorage.removeItem('activeTimer');
  };

  const togglePause = () => {
    if (!isPaused) {
      // Pausing - record when pause started
      pauseStartTimeRef.current = Date.now();
      setIsPaused(true);
    } else {
      // Resuming - add pause duration to total paused time
      if (pauseStartTimeRef.current) {
        const pauseDuration = Date.now() - pauseStartTimeRef.current;
        totalPausedTimeRef.current += pauseDuration;
        pauseStartTimeRef.current = null;
      }
      setIsPaused(false);
    }
  };

  return { elapsedTime, isPaused, resetTimer, togglePause };
};