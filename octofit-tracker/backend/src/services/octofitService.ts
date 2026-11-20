import { Types } from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw Object.assign(new Error('Activity details are required'), { status: 400 });
  }

  const { userId, teamId, type, minutes } = input as Record<string, unknown>;
  if (
    typeof userId !== 'string' ||
    !Types.ObjectId.isValid(userId) ||
    typeof teamId !== 'string' ||
    !Types.ObjectId.isValid(teamId) ||
    typeof type !== 'string' ||
    !type.trim() ||
    typeof minutes !== 'number' ||
    !Number.isFinite(minutes) ||
    minutes < 1
  ) {
    throw Object.assign(new Error('Activity details are invalid'), { status: 400 });
  }

  const [user, team] = await Promise.all([
    User.exists({ _id: userId }),
    Team.exists({ _id: teamId }),
  ]);
  if (!user || !team) {
    throw Object.assign(new Error('Activity user and team must exist'), { status: 400 });
  }

  return Activity.create({
    user: userId,
    team: teamId,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw Object.assign(new Error('Team details are required'), { status: 400 });
  }

  const { name, mascot, members } = input as Record<string, unknown>;
  if (
    typeof name !== 'string' ||
    !name.trim() ||
    typeof mascot !== 'string' ||
    !mascot.trim() ||
    (members !== undefined &&
      (!Array.isArray(members) ||
        members.some((member) => typeof member !== 'string' || !Types.ObjectId.isValid(member))))
  ) {
    throw Object.assign(new Error('Team details are invalid'), { status: 400 });
  }

  return Team.create({
    name: name.trim(),
    mascot: mascot.trim(),
    members: members ?? [],
  });
}

export async function getLeaderboard() {
  const teamTotals = await Activity.aggregate<{ teamName: string; totalPoints: number }>([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    {
      $lookup: {
        from: Team.collection.name,
        localField: '_id',
        foreignField: '_id',
        as: 'team',
      },
    },
    { $unwind: '$team' },
    { $sort: { totalPoints: -1 } },
    { $project: { _id: 0, teamName: '$team.name', totalPoints: 1 } },
  ]);

  return teamTotals.map((team, index) => ({ ...team, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail.trim().toLowerCase() }).lean();
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  const [activity, workouts] = await Promise.all([
    Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).lean(),
    Workout.find({ focus: user.fitnessGoal }).limit(1).lean(),
  ]);
  const reason = activity
    ? `Recommended for your ${user.fitnessGoal} goal and recent ${activity.type} activity.`
    : `Recommended for your ${user.fitnessGoal} goal.`;

  return workouts.map((workout) => ({ ...workout, reason }));
}

export { User };
