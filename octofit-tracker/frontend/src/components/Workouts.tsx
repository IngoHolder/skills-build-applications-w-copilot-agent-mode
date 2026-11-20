import { getJson } from '../api/client.js';
import { useApiData } from '../hooks/useApiData.js';
import { CapabilityCard } from './CapabilityCard.js';

type Suggestion = { title: string; reason?: string };

export default function Workouts() {
  const userEmail = 'mona@example.com';
  const { data, loading, error } = useApiData<{ suggestions: Suggestion[] }>(
    `/api/workouts/suggestions/${encodeURIComponent(userEmail)}`,
    getJson,
  );
  const suggestions = data?.suggestions ?? [];

  return (
    <CapabilityCard
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      loading={loading}
      error={error}
      empty={!loading && !error && suggestions.length === 0}
      emptyMessage="No workout suggestions yet."
    >
      {suggestions.map((suggestion) => (
        <p key={suggestion.title}>
          {suggestion.title}{suggestion.reason ? `: ${suggestion.reason}` : ''}
        </p>
      ))}
    </CapabilityCard>
  );
}
