import { useState } from 'react';
import { DEFAULT_TOPIC_PALETTE } from '../lib/utils';
import type { Topic } from '../types';

type TopicInput = {
  name: string;
  color: string;
};

type TopicSectionProps = {
  topics: Topic[];
  onSubmit: (payload: TopicInput) => Promise<void>;
};

export function TopicSection({ topics, onSubmit }: TopicSectionProps) {
  const [topicName, setTopicName] = useState('');
  const [topicColor, setTopicColor] = useState(DEFAULT_TOPIC_PALETTE[0]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit({ name: topicName, color: topicColor });
    setTopicName('');
    const currentIndex = DEFAULT_TOPIC_PALETTE.indexOf(topicColor);
    setTopicColor(DEFAULT_TOPIC_PALETTE[(currentIndex + 1) % DEFAULT_TOPIC_PALETTE.length]);
  };

  return (
    <article className="panel">
      <header className="panel-header">
        <div>
          <p className="eyebrow">Topic config</p>
          <h2>Manage categories</h2>
        </div>
      </header>
      <form className="topic-form" onSubmit={(event) => void handleSubmit(event)}>
        <input value={topicName} onChange={(event) => setTopicName(event.target.value)} placeholder="Add a topic" />
        <div className="swatch-row">
          {DEFAULT_TOPIC_PALETTE.map((color) => (
            <button
              key={color}
              className={`swatch ${topicColor === color ? 'selected' : ''}`}
              type="button"
              style={{ backgroundColor: color }}
              onClick={() => setTopicColor(color)}
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
