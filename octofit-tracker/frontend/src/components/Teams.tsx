import { useApiData } from '../hooks/useApiData.js';
import { CapabilityCard } from './CapabilityCard.js';

type Team = { name: string; members: string[] };

export default function Teams() {
  const { data, loading, error } = useApiData<{ teams: Team[] }>('/api/teams');
  const teams = data?.teams ?? [];

  return (
    <CapabilityCard
      title="Teams"
      description="Manage teams and members."
      loading={loading}
      error={error}
      empty={!loading && !error && teams.length === 0}
      emptyMessage="No teams yet."
    >
      {teams.map((team) => (
        <p key={team.name}>{team.name} ({team.members.length} members)</p>
      ))}
    </CapabilityCard>
  );
}
