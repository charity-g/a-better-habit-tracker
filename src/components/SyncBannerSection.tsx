import type { SyncBanner } from '../hooks/useHabitTracker';

type SyncBannerSectionProps = {
  banner: SyncBanner;
};

export function SyncBannerSection({ banner }: SyncBannerSectionProps) {
  return <section className={`sync-banner ${banner.tone}`}>{banner.message}</section>;
}
