import { useEffect, useState } from 'react';
import { formatDuration, formatHours, todayLocal } from '../lib/utils';
import type { Topic } from '../types';

type TimerEntryInput = {
  topicId: string;
  task: string;
  date: string;
  elapsedMs: number;
};

type TimerDraft = {
  topicId: string;
  task: string;
  date: string;
};

type TimerEntrySectionProps = {
  topics: Topic[];
  roundedTimerHours: number;
  onElapsedMsChange: (elapsedMs: number) => void;
  onSubmit: (payload: TimerEntryInput) => Promise<void>;
};

export function TimerEntrySection({ topics, roundedTimerHours, onElapsedMsChange, onSubmit }: TimerEntrySectionProps) {
  const [draft, setDraft] = useState<TimerDraft>({ topicId: '', task: '', date: todayLocal() });
  const [timerStartedAt, setTimerStartedAt] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const isRunning = timerStartedAt !== null;

  useEffect(() => {
    if (!draft.topicId && topics.length > 0) {
      setDraft((current) => ({ ...current, topicId: topics[0].id }));
    }
  }, [draft.topicId, topics]);

  useEffect(() => {
    onElapsedMsChange(elapsedMs);
  }, [elapsedMs, onElapsedMsChange]);

  useEffect(() => {
    if (!timerStartedAt) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setElapsedMs(Date.now() - timerStartedAt);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [timerStartedAt]);

  const startTimer = () => {
    setTimerStartedAt(Date.now() - elapsedMs);
  };

  const pauseTimer = () => {
    setTimerStartedAt(null);
  };

  const resetTimer = () => {
    setTimerStartedAt(null);
    setElapsedMs(0);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit({ ...draft, elapsedMs });
    setDraft((current) => ({ ...current, task: '' }));
    setTimerStartedAt(null);
    setElapsedMs(0);
  };

  return (
    <article className="panel panel-large accent-panel">
      <header className="panel-header">
        <div>
          <p className="eyebrow">Timer capture</p>
          <h2>Run a live session</h2>
        </div>
        <div className="timer-clock">{formatDuration(elapsedMs)}</div>
      </header>
      <form className="form-grid" onSubmit={(event) => void handleSubmit(event)}>
        <label>
          Topic
          <select value={draft.topicId} onChange={(event) => setDraft((current) => ({ ...current, topicId: event.target.value }))}>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>
        </label>
        <label className="wide-field">
          Task
          <input
            value={draft.task}
            onChange={(event) => setDraft((current) => ({ ...current, task: event.target.value }))}
            placeholder="Current focus"
          />
        </label>
        <label>
          Date
          <input type="date" value={draft.date} onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))} />
        </label>
        <div className="timer-actions wide-field">
          <button className="secondary-button" type="button" onClick={startTimer} disabled={isRunning}>
            Start
          </button>
          <button className="secondary-button" type="button" onClick={pauseTimer} disabled={!isRunning}>
            Pause
          </button>
          <button className="secondary-button" type="button" onClick={resetTimer}>
            Reset
          </button>
          <button className="primary-button" type="submit">
            Save {roundedTimerHours > 0 ? `(${formatHours(roundedTimerHours)})` : ''}
          </button>
        </div>
      </form>
    </article>
  );
}
