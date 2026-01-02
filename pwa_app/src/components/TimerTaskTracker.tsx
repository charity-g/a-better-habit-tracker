import React, { useState, useEffect } from 'react';
import Timer from './Timer';
import { submitTask } from '../api/submitTask';

function TimerTaskTracker() {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [topic, setTopic] = useState('');
  const [taskName, setTaskName] = useState('');
  const [debouncedTaskName, setDebouncedTaskName] = useState('');

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedTaskName(taskName), 300);
    return () => clearTimeout(handle);
  }, [taskName]);

  function setHasEnded() {
    submitTask(debouncedTaskName, timeElapsed);
    setTaskName('');
    setTimeElapsed(0);
  }
  
  
  return (
    <div>
      <input
        type="text"
        value={topic}
        placeholder="Topic"
        onChange={(e) => setTopic(e.target.value)}
      />
      <input
        type="text"
        value={taskName}
        placeholder="Task name"
        onChange={(e) => setTaskName(e.target.value)}
      />
      <Timer onStart={setTimeElapsed} onEnd={setHasEnded}  taskName={debouncedTaskName} />
    </div>
  )
}


export default TimerTaskTracker
