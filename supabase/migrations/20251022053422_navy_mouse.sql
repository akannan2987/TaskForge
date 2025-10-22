/*
  # Create tasks table for TaskForg

  1. New Tables
    - `tasks`
      - `id` (uuid, primary key)
      - `title` (text, required) - Task title
      - `description` (text, optional) - Task description
      - `status` (text, required) - Task status (active/completed)
      - `priority` (text, required) - Task priority (low/medium/high)
      - `due_date` (timestamptz, optional) - Task due date
      - `created_at` (timestamptz) - When task was created
      - `user_id` (uuid, required) - Foreign key to auth.users
      - `ai_generated` (boolean, default false) - Whether task was AI generated

  2. Security
    - Enable RLS on `tasks` table
    - Add policy for authenticated users to read/write their own tasks
    - Add policy for users to only access their own data

  3. Indexes
    - Add index on user_id for efficient queries
    - Add index on status for filtering
    - Add composite index on user_id and status for common queries
*/

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date timestamptz,
  created_at timestamptz DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ai_generated boolean DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for tasks
CREATE POLICY "Users can view their own tasks"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks"
  ON tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
  ON tasks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
  ON tasks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date) WHERE due_date IS NOT NULL;