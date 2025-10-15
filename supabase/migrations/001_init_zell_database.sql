/*
  # ZELL Database Schema Initialization

  1. Tables
    - `file_operations_history`
      - Stores history of all file operations (convert, compress, edit, compile)
      - Includes original file info, results, and timestamps

    - `user_preferences`
      - Stores user settings and preferences
      - Theme, default compression levels, etc.

    - `file_metadata`
      - Stores metadata about processed files
      - For caching and quick lookups

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users (future auth integration)
    - For now, allow anonymous access since it's a local-first app
*/

-- File Operations History Table
CREATE TABLE IF NOT EXISTS file_operations_history (
  id BIGSERIAL PRIMARY KEY,
  operation TEXT NOT NULL CHECK (operation IN ('convert', 'compress', 'edit', 'compile')),
  original_name TEXT NOT NULL,
  original_size BIGINT NOT NULL,
  new_size BIGINT NOT NULL,
  compression_ratio REAL NOT NULL DEFAULT 0,
  target_format TEXT,
  compression_level TEXT CHECK (compression_level IN ('low', 'medium', 'high')),
  download_url TEXT,
  file_type TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
  id BIGSERIAL PRIMARY KEY,
  preference_key TEXT UNIQUE NOT NULL,
  preference_value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- File Metadata Table
CREATE TABLE IF NOT EXISTS file_metadata (
  id BIGSERIAL PRIMARY KEY,
  file_hash TEXT UNIQUE NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  mime_type TEXT,
  metadata JSONB,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE file_operations_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_metadata ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Allow all for now - local-first app)
-- File Operations History Policies
CREATE POLICY "Allow public read access to file_operations_history"
  ON file_operations_history
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to file_operations_history"
  ON file_operations_history
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to file_operations_history"
  ON file_operations_history
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to file_operations_history"
  ON file_operations_history
  FOR DELETE
  USING (true);

-- User Preferences Policies
CREATE POLICY "Allow public read access to user_preferences"
  ON user_preferences
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to user_preferences"
  ON user_preferences
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to user_preferences"
  ON user_preferences
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to user_preferences"
  ON user_preferences
  FOR DELETE
  USING (true);

-- File Metadata Policies
CREATE POLICY "Allow public read access to file_metadata"
  ON file_metadata
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to file_metadata"
  ON file_metadata
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to file_metadata"
  ON file_metadata
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to file_metadata"
  ON file_metadata
  FOR DELETE
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_file_operations_history_operation ON file_operations_history(operation);
CREATE INDEX IF NOT EXISTS idx_file_operations_history_created_at ON file_operations_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_file_operations_history_status ON file_operations_history(status);
CREATE INDEX IF NOT EXISTS idx_file_metadata_file_hash ON file_metadata(file_hash);
CREATE INDEX IF NOT EXISTS idx_file_metadata_file_type ON file_metadata(file_type);
CREATE INDEX IF NOT EXISTS idx_user_preferences_key ON user_preferences(preference_key);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_file_operations_history_updated_at
  BEFORE UPDATE ON file_operations_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default preferences
INSERT INTO user_preferences (preference_key, preference_value)
VALUES
  ('theme', '{"mode": "auto", "primaryColor": "#2196F3"}'::jsonb),
  ('defaultCompressionLevel', '"medium"'::jsonb),
  ('autoSaveHistory', 'true'::jsonb),
  ('maxHistoryItems', '1000'::jsonb)
ON CONFLICT (preference_key) DO NOTHING;
