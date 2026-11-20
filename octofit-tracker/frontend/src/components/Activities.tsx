import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Activity = {
  _id?: string;
  type: string;
  minutes: number;
  points: number;
};

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    getJson<{ activities: Activity[] }>('/api/activities').then(({ activities: responseActivities }) => {
      setActivities(responseActivities);
    });
  }, []);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Activities</h2>
        <p>Track student activity minutes and points.</p>
        {activities.map((activity, index) => (
          <p key={activity._id ?? `${activity.type}-${index}`}>
            {activity.type}: {activity.minutes} minutes, {activity.points} points
          </p>
        ))}
      </div>
    </section>
  );
}
