import React, { useState, useEffect } from 'react';
import Timer from './Timer';
import { submitTask } from '../api/submitTask';

function TimerTaskTracker() {
  const [hasStarted, setHasStarted] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [debouncedTaskName, setDebouncedTaskName] = useState('');

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedTaskName(taskName), 300);
    return () => clearTimeout(handle);
  }, [taskName]);

  function setHasEnded() {
    submitTask(debouncedTaskName);
    setTaskName('');
    setHasStarted(false);
  }
  
  
  return (
    <div>
      <input
        type="text"
        value={taskName}
        placeholder="Task name"
        onChange={(e) => setTaskName(e.target.value)}
      />
      <Timer hasStarted={hasStarted} onStart={setHasStarted} onEnd={setHasEnded}  taskName={debouncedTaskName} />
    </div>
  )
}


export default TimerTaskTracker
