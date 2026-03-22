import { useEffect, useState } from 'react';
import { todayLocal } from '../lib/utils';
import type { Topic } from '../types';

type ManualEntryInput = {
  topicId: string;
  task: string;
  hours: number;
  date: string;
};

type ManualEntrySectionProps = {
  topics: Topic[];
  onSubmit: (payload: ManualEntryInput) => Promise<void>;
};

export function ManualEntrySection({ topics, onSubmit }: ManualEntrySectionProps) {
  const [draft, setDraft] = useState<ManualEntryInput>({ topicId: '', task: '', hours: 0.5, date: todayLocal() });

  useEffect(() => {
    if (!draft.topicId && topics.length > 0) {
      setDraft((current) => ({ ...current, topicId: topics[0].id }));
    }
  }, [draft.topicId, topics]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(draft);
    setDraft((current) => ({ ...current, task: '', hours: 0.5 }));
  };

  return (
    <article className="panel panel-large">
      <header className="panel-header">
        <div>
          <p className="eyebrow">Manual entry</p>
          <h2>Log a finished block</h2>
        </div>
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
            placeholder="What did you work on?"
          />
        </label>
        <label>
          Hours
          <input
            type="number"
            min="0.25"
            step="0.25"
            value={draft.hours}
            onChange={(event) => setDraft((current) => ({ ...current, hours: Number(event.target.value) }))}
          />
        </label>
        <label>
          Date
          <input type="date" value={draft.date} onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))} />
        </label>
        <button className="primary-button wide-field" type="submit">
          Save manual entry
        </button>
      </form>
    </article>
  );
}
