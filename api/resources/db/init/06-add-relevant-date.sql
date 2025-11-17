-- Migration: Add relevant_date column to lessons table
-- This migration adds support for time-of-year relevance for lessons

-- Add relevant_date column to lessons table
-- Format: MM-DD (e.g., "03-15" for March 15, "12-25" for Christmas)
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS relevant_date VARCHAR(5) DEFAULT NULL
CHECK (relevant_date IS NULL OR relevant_date ~ '^\d{2}-\d{2}$');

-- Create index for filtering lessons by relevant date
CREATE INDEX IF NOT EXISTS idx_lessons_relevant_date ON lessons(relevant_date);

COMMENT ON COLUMN lessons.relevant_date IS 'Date in year when lesson is most relevant (MM-DD format, e.g., 03-15 for March 15)';
