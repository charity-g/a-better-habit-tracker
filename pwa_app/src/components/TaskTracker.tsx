import { useState, useEffect } from 'react';
import { submitTask } from '../api/submitTask';

function TimerTaskTracker() {
  const [time, setTime] = useState(0);
  const [topic, setTopic] = useState("Computer Science");
  const [taskName, setTaskName] = useState("");

  return (
    <div>
      <form>
        <div>
          <h2> Time: <span> {time} </span></h2>
        </div>
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
      <input type="submit" value="Commit Done" onClick={(e) => {
        e.preventDefault();
        submitTask({ topic, taskName, time });
        setTime(0);
        setTaskName("");
      }} />
      </form>
    </div>
  )
}


export default TimerTaskTracker
