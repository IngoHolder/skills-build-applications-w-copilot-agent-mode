import { Schema, model } from 'mongoose';

const workoutSchema = new Schema({
  title: { type: String, required: true },
  focus: { type: String, required: true },
  minutes: {
    type: Number,
    required: true,
    validate: {
      validator: (value: number) => value > 0,
      message: 'Minutes must be greater than 0',
    },
  },
  difficulty: { type: String, required: true },
});

export const Workout = model('Workout', workoutSchema);
