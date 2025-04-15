/*
  # Create leads table for storing saved lender information

  1. New Tables
    - `leads`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `lender_data` (jsonb, stores lender information)
      - `created_at` (timestamp with timezone)
      - `status` (text, tracks lead status)
      - `notes` (text, optional notes about the lead)

  2. Security
    - Enable RLS on `leads` table
    - Add policies for authenticated users to manage their own leads
*/

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  lender_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  status text DEFAULT 'new',
  notes text,
  CONSTRAINT valid_status CHECK (status IN ('new', 'contacted', 'in_progress', 'closed'))
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own leads"
  ON leads
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);