-- Migration: Add visibility fields and saved_outfits table
-- Date: 2026-05-23

-- Add visibility column to clothes table (if not exists)
ALTER TABLE clothes 
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'private';

ALTER TABLE clothes
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add visibility column to outfits table (if not exists)
ALTER TABLE outfits
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'private';

ALTER TABLE outfits
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create saved_outfits table (if not exists)
CREATE TABLE IF NOT EXISTS saved_outfits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  outfit_id UUID NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, outfit_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_clothes_visibility ON clothes(visibility);
CREATE INDEX IF NOT EXISTS idx_clothes_user_visibility ON clothes(user_id, visibility);
CREATE INDEX IF NOT EXISTS idx_outfits_visibility ON outfits(visibility);
CREATE INDEX IF NOT EXISTS idx_outfits_user_visibility ON outfits(user_id, visibility);
CREATE INDEX IF NOT EXISTS idx_saved_outfits_user_id ON saved_outfits(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_outfits_outfit_id ON saved_outfits(outfit_id);
CREATE INDEX IF NOT EXISTS idx_clothes_created_at ON clothes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_outfits_created_at ON outfits(created_at DESC);
