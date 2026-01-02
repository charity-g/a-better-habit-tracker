import React, { useEffect, useRef, useState } from 'react';

type TimerProps = {
  onStart: (elapsedSeconds: number) => void;
  onEnd: () => void;
  taskName?: string;
};

const Timer: React.FC<TimerProps> = ({ onStart, onEnd, taskName }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        onStart(next);
        return next;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, onStart]);

  const handleStart = () => {
    if (isRunning) return;
    setIsRunning(true);
  };

  const handleStop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    onStart(elapsed); // ensure parent has the final elapsed value
    onEnd();
  };

  const handleReset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    setElapsed(0);
    onStart(0);
  };

  return (
    <div>
      <div>Task: {taskName || 'Unnamed task'}</div>
      <div>Elapsed: {elapsed}s</div>
      <button onClick={handleStart} disabled={isRunning}>Start</button>
      <button onClick={handleStop} disabled={!isRunning}>Stop</button>
      <button onClick={handleReset}>Reset</button>
    </div>
  );
};

export default Timer;