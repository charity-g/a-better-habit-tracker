import type { FormEvent } from 'react';
import { formatDuration, formatHours } from '../lib/utils';
import type { TimerDraft, Topic } from '../types';

type TimerEntrySectionProps = {
  topics: Topic[];
  draft: TimerDraft;
  elapsedMs: number;
  roundedTimerHours: number;
  isRunning: boolean;
  onChange: (patch: Partial<TimerDraft>) => void;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
};

export function TimerEntrySection({
  topics,
  draft,
  elapsedMs,
  roundedTimerHours,
  isRunning,
  onChange,
  onStart,
  onPause,
  onReset,
  onSubmit
}: TimerEntrySectionProps) {
  return (
    <article className="panel panel-large accent-panel">
      <header className="panel-header">
        <div>
          <p className="eyebrow">Timer capture</p>
          <h2>Run a live session</h2>
        </div>
        <div className="timer-clock">{formatDuration(elapsedMs)}</div>
      </header>
      <form className="form-grid" onSubmit={onSubmit}>
        <label>
          Topic
          <select value={draft.topicId} onChange={(event) => onChange({ topicId: event.target.value })}>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>
        </label>
        <label className="wide-field">
          Task
          <input value={draft.task} onChange={(event) => onChange({ task: event.target.value })} placeholder="Current focus" />
        </label>
        <label>
          Date
          <input type="date" value={draft.date} onChange={(event) => onChange({ date: event.target.value })} />
        </label>
        <div className="timer-actions wide-field">
          <button className="secondary-button" type="button" onClick={onStart} disabled={isRunning}>
            Start
          </button>
          <button className="secondary-button" type="button" onClick={onPause} disabled={!isRunning}>
            Pause
          </button>
          <button className="secondary-button" type="button" onClick={onReset}>
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
