import React, { useEffect, useRef, useState } from 'react';

type TimerProps = {
  hasStarted: boolean;
  onStart: (value: boolean) => void;
};

function Timer({ hasStarted, onStart }: TimerProps) {
  const [elapsedMs, setElapsedMs] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (hasStarted && !intervalRef.current) {
      intervalRef.current = setInterval(() => setElapsedMs((t) => t + 1000), 1000);
    }
    if (!hasStarted && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [hasStarted]);

  const handleReset = () => {
    onStart(false);
    setElapsedMs(0);
  };

  const format = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hh = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const mm = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const ss = String(totalSeconds % 60).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  };

  return (
    <div style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
      <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: '1.5rem' }}>
        {format(elapsedMs)}
      </span>
      <button onClick={() => onStart((s) => !s)}>
        {hasStarted ? 'Pause' : 'Start'}
      </button>
      <button onClick={handleReset} disabled={elapsedMs === 0 && !hasStarted}>
        Reset
      </button>
    </div>
  );
}

export default Timer;