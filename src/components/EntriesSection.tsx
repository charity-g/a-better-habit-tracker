import { formatHours } from '../lib/utils';
import type { HabitEntry, Topic } from '../types';

type EntriesSectionProps = {
  entries: HabitEntry[];
  topicMap: Map<string, Topic>;
};

export function EntriesSection({ entries, topicMap }: EntriesSectionProps) {
  return (
    <article className="panel panel-wide">
      <header className="panel-header">
        <div>
          <p className="eyebrow">Recent entries</p>
          <h2>Local timeline</h2>
        </div>
      </header>
      <div className="table-shell">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Topic</th>
              <th>Task</th>
              <th>Hours</th>
              <th>Source</th>
              <th>Sync</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-cell">
                  No entries yet.
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.date}</td>
                  <td>{topicMap.get(entry.topicId)?.name ?? 'Unknown topic'}</td>
                  <td>{entry.task}</td>
                  <td>{formatHours(entry.hours)}</td>
                  <td>{entry.source}</td>
                  <td>
                    <span className={`sync-pill ${entry.syncStatus}`}>{entry.syncStatus}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </article>
  );
}
