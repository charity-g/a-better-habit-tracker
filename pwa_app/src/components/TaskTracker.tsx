import { useState, useEffect } from 'react';
import { submitTask } from '../api/submitTask';

class Topic {
  static CS = "Computer Science"
  static BIO = "Bio"
  static MISC = "Misc"
  static AMG = "Amgen"
}

function TimerTaskTracker() {
  const [time, setTime] = useState(0);
  const [topic, setTopic] = useState(Topic.CS);
  const [taskName, setTaskName] = useState("");

  return (
    <div>
      <form>
        <TimeInput time={time} setTime={setTime} />
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
        submitTask({ topic, taskName, durationHours: time });
        setTime(0);
        setTaskName("");
      }} />
      </form>
    </div>
  )
}


function TimeInput({ time, setTime }: { time: number; setTime: (time: number) => void; }) {

  return (
    <div>
      <h2> Time: <span> {time} </span></h2>
      <div>
        <button onClick={() => setTime(time + 0.25)}> +15min </button>
        <button onClick={() => setTime(time + 0.5)}> +30min </button>
        <button onClick={() => setTime(time + 1)}> +1hr </button>
        <button onClick={() => setTime(0)}> clear </button>
      </div>
    </div>
  );
}

export default TimerTaskTracker
