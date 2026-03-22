import { formatHours } from '../lib/utils';

type StatusStripProps = {
  isOnline: boolean;
  pendingEntries: number;
  todayHours: number;
  yesterdayHours: number;
  weekHours: number;
  topicCount: number;
};

export function StatusStrip({ isOnline, pendingEntries, todayHours, yesterdayHours, weekHours, topicCount }: StatusStripProps) {
  return (
    <section className="status-strip">
      <div className="status-item">
        <span>Status</span>
        <strong>{isOnline ? 'Online' : 'Offline'}</strong>
      </div>
      <div className="status-item">
        <span>Queued</span>
        <strong>{pendingEntries}</strong>
      </div>
      <div className="status-item">
        <span>Today</span>
        <strong>{formatHours(todayHours)}</strong>
      </div>
      <div className="status-item">
        <span>Yesterday</span>
        <strong>{formatHours(yesterdayHours)}</strong>
      </div>
      <div className="status-item">
        <span>This week</span>
        <strong>{formatHours(weekHours)}</strong>
      </div>
      <div className="status-item">
        <span>Topics</span>
        <strong>{topicCount}</strong>
      </div>
    </section>
  );
}
