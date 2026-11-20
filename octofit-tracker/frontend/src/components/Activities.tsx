import { useApiData } from '../hooks/useApiData.js';
import { CapabilityCard } from './CapabilityCard.js';

type Activity = {
  _id?: string;
  type: string;
  minutes: number;
  points: number;
};

export default function Activities() {
  const { data, loading, error } = useApiData<{ activities: Activity[] }>('/api/activities');
  const activities = data?.activities ?? [];

  return (
    <CapabilityCard
      title="Activities"
      description="Track student activity minutes and points."
      loading={loading}
      error={error}
      empty={!loading && !error && activities.length === 0}
      emptyMessage="No activities yet."
    >
      {activities.map((activity, index) => (
        <p key={activity._id ?? `${activity.type}-${index}`}>
          {activity.type}: {activity.minutes} minutes, {activity.points} points
        </p>
      ))}
    </CapabilityCard>
  );
}
