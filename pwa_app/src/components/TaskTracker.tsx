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

  function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      submitTask({ topic, taskName, durationHours: time });
      setTime(0);
      setTaskName("");
  }

  return (
    <div className="flex flex-col items-center gap-6 px-6 py-3 rounded-xl bg-black/30 backdrop-blur-md shadow-lg text-white max-w-sm mx-auto">
      
      <TimeInput time={time} setTime={setTime} />
      <form onSubmit={handleSubmit}>
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
        <input type="submit" value="Commit Done" />
        </form>
    </div>
  )
}


function TimeInput({ time, setTime }: { time: number; setTime: (time: number) => void; }) {

  return (
    <div className="flex flex-col items-center gap-6">
    <h2 className="text-2xl font-semibold tracking-wide">
      Time: <span className="font-bold text-lime-300">{time}</span>
    </h2>

    <div className="flex gap-3 justify-center">
      <button
        onClick={() => setTime(time + 0.25)}
        className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition font-medium"
      >
        +0.25
      </button>

      <button
        onClick={() => setTime(time + 0.5)}
        className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition font-medium"
      >
        +0.5
      </button>

      <button
        onClick={() => setTime(time + 1)}
        className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition font-medium"
      >
        +1
      </button>

      <button
        onClick={() => setTime(0)}
        className="px-4 py-2 rounded-lg bg-red-500/70 hover:bg-red-500 transition font-medium"
      >
        clear
      </button>
    </div>
  </div>
  );
}

export default TimerTaskTracker
