import type { FormEvent } from 'react';
import { DEFAULT_TOPIC_PALETTE } from '../lib/utils';
import type { Topic } from '../types';

type TopicSectionProps = {
  topics: Topic[];
  topicName: string;
  topicColor: string;
  onTopicNameChange: (value: string) => void;
  onTopicColorChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
};

export function TopicSection({ topics, topicName, topicColor, onTopicNameChange, onTopicColorChange, onSubmit }: TopicSectionProps) {
  return (
    <article className="panel">
      <header className="panel-header">
        <div>
          <p className="eyebrow">Topic config</p>
          <h2>Manage categories</h2>
        </div>
      </header>
      <form className="topic-form" onSubmit={onSubmit}>
        <input value={topicName} onChange={(event) => onTopicNameChange(event.target.value)} placeholder="Add a topic" />
        <div className="swatch-row">
          {DEFAULT_TOPIC_PALETTE.map((color) => (
            <button
              key={color}
              className={`swatch ${topicColor === color ? 'selected' : ''}`}
              type="button"
              style={{ backgroundColor: color }}
              onClick={() => onTopicColorChange(color)}
              aria-label={`Select ${color}`}
            />
          ))}
        </div>
        <button className="secondary-button" type="submit">
          Add topic
        </button>
      </form>
      <ul className="topic-list">
        {topics.map((topic) => (
          <li key={topic.id}>
            <span className="topic-chip" style={{ backgroundColor: topic.color }} />
            <span>{topic.name}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
