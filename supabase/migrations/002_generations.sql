-- ============================================================
-- Generations history: store AI generation results per user
-- ============================================================

CREATE TABLE IF NOT EXISTS generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  type TEXT NOT NULL,              -- 'past', 'ancestor', 'action-figure', 'pet-humanize', 'ghibli', 'family-portrait'
  image_url TEXT,                  -- original uploaded image
  result_url TEXT,                 -- AI-generated result URL
  status TEXT NOT NULL DEFAULT 'pending',  -- pending | completed | failed
  task_id TEXT,                    -- Kie AI task ID
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_generations_user ON generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_created ON generations(created_at DESC);

-- Add name column to users for profile
ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT;
