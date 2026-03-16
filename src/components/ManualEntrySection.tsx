import type { FormEvent } from 'react';
import type { ManualEntryDraft, Topic } from '../types';

type ManualEntrySectionProps = {
  topics: Topic[];
  draft: ManualEntryDraft;
  onChange: (patch: Partial<ManualEntryDraft>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
};

export function ManualEntrySection({ topics, draft, onChange, onSubmit }: ManualEntrySectionProps) {
  return (
    <article className="panel panel-large">
      <header className="panel-header">
        <div>
          <p className="eyebrow">Manual entry</p>
          <h2>Log a finished block</h2>
        </div>
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
          <input value={draft.task} onChange={(event) => onChange({ task: event.target.value })} placeholder="What did you work on?" />
        </label>
        <label>
          Hours
          <input type="number" min="0.25" step="0.25" value={draft.hours} onChange={(event) => onChange({ hours: Number(event.target.value) })} />
        </label>
        <label>
          Date
          <input type="date" value={draft.date} onChange={(event) => onChange({ date: event.target.value })} />
        </label>
        <button className="primary-button wide-field" type="submit">
          Save manual entry
        </button>
      </form>
    </article>
  );
}
