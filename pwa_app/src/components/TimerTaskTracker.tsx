import React, { useState } from 'react';
import Timer from './Timer';

function TimerTaskTracker() {
  const [hasStarted, setHasStarted] = useState(false);
  return (
    <div>
        <Timer hasStarted={hasStarted} setHasStarted={setHasStarted} />
    </div>
  )
}


export default TimerTaskTracker
