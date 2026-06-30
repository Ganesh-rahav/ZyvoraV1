-- Supabase seed file for local development
-- Run with: npx supabase db reset (which applies migrations then seeds)
-- DO NOT run in production.

-- Seed the exercises catalog with common movements
-- Full exercise library is populated in Sprint 4 (Workout Engine)

INSERT INTO public.exercises (id, name, primary_muscle_group, equipment_required, execution_cues)
VALUES
  (uuid_generate_v4(), 'Barbell Bench Press', 'Chest', 'barbell', ARRAY['Set up with eyes under the bar', 'Grip slightly wider than shoulder-width', 'Lower bar to lower chest with control', 'Drive bar up explosively']),
  (uuid_generate_v4(), 'Barbell Squat', 'Quadriceps', 'barbell', ARRAY['Bar sits on upper traps', 'Feet shoulder-width, toes slightly out', 'Brace core and descend below parallel', 'Drive through heels to stand']),
  (uuid_generate_v4(), 'Deadlift', 'Posterior Chain', 'barbell', ARRAY['Bar over mid-foot', 'Hip hinge to grip bar', 'Brace core, chest tall', 'Drive hips through as bar passes knee']),
  (uuid_generate_v4(), 'Pull-Up', 'Back', 'pull_up_bar', ARRAY['Dead hang grip slightly wider than shoulders', 'Depress scapulae before pulling', 'Pull elbows toward hips', 'Control the descent']),
  (uuid_generate_v4(), 'Overhead Press', 'Shoulders', 'barbell', ARRAY['Bar at upper chest, wrists neutral', 'Brace core, glutes tight', 'Press bar overhead in slight arc', 'Lock out at top']),
  (uuid_generate_v4(), 'Romanian Deadlift', 'Hamstrings', 'barbell', ARRAY['Hip hinge with soft knee', 'Bar slides down thighs', 'Feel hamstring stretch at bottom', 'Drive hips forward to stand']),
  (uuid_generate_v4(), 'Dumbbell Row', 'Back', 'dumbbell', ARRAY['Brace on bench with neutral spine', 'Row elbow toward hip', 'Squeeze at top', 'Control the descent']),
  (uuid_generate_v4(), 'Dumbbell Lateral Raise', 'Shoulders', 'dumbbell', ARRAY['Slight forward lean', 'Raise arms to shoulder height', 'Lead with elbows', 'Lower with control'])
ON CONFLICT DO NOTHING;
