import { useState } from 'react';
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
      if (taskName.trim() === "" || time <= 0) {
          alert("Please enter a valid task name and time greater than 0.");
          return;
      }
      submitTask({ topic, taskName, durationHours: time });
      setTime(0);
      setTaskName("");
  }

  return (
    <div className="p-6 rounded-xl bg-[#c0c781]/50 backdrop-blur-md shadow-lg text-white max-w-sm mx-auto">
      
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-2">
        <input
            type="text"
            value={topic}
            placeholder="Topic"
            onChange={(e) => setTopic(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-black/30 text-white placeholder-white/70 backdrop-blur-md focus:bg-black/50 focus:outline-none focus:ring-2 focus:ring-white/80 transition"
          />

          <input
            type="text"
            value={taskName}
            placeholder="Task name"
            onChange={(e) => setTaskName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-black/30 text-white placeholder-white/70 backdrop-blur-md focus:bg-black/50 focus:outline-none focus:ring-2 focus:ring-white/80 transition"
          />

          <TimeInput time={time} setTime={setTime} />

          <input
            type="submit"
            value="Submit"
            className="w-full text-white mt-4 px-4 py-3 rounded-lg bg-[#528F3D]/60 text-black font-semibold hover:bg-[#528F3D] active:scale-95 transition shadow-lg"
          />
        </form>
    </div>
  )
}


function TimeInput({ time, setTime }: { time: number; setTime: (time: number) => void; }) {

  return (
    <div className="flex flex-col items-center gap-2">
    <h2 className="uppercase text-xl font-semibold tracking-wide text-lime-800">
      Time: <span className="font-bold">{time}</span>
    </h2>

    <div className="flex gap-3 justify-center">
      <button
        type="button"
        onClick={() => setTime(time + 0.25)}
        className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition font-medium"
      >
        +0.25
      </button>

      <button
        type="button"
        onClick={() => setTime(time + 0.5)}
        className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition font-medium"
      >
        +0.5
      </button>

      <button
        type="button"
        onClick={() => setTime(time + 1)}
        className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition font-medium"
      >
        +1
      </button>

      <button
        type="button"
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
