import { getJson } from '../api/client.js';
import { useApiData } from '../hooks/useApiData.js';
import { CapabilityCard } from './CapabilityCard.js';

type Entry = { teamName: string; totalPoints: number; rank: number };

export default function Leaderboard() {
  const { data, loading, error } = useApiData<{ leaderboard: Entry[] }>('/api/leaderboard', getJson);
  const leaderboard = data?.leaderboard ?? [];

  return (
    <CapabilityCard
      title="Leaderboard"
      description="Compare team point totals."
      loading={loading}
      error={error}
      empty={!loading && !error && leaderboard.length === 0}
      emptyMessage="No leaderboard rankings yet."
    >
      {leaderboard.map((entry) => (
        <p key={entry.rank}>{entry.rank}. {entry.teamName}: {entry.totalPoints} points</p>
      ))}
    </CapabilityCard>
  );
}
