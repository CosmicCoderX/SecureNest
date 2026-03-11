-- Add tags column to credentials table
ALTER TABLE public.credentials ADD COLUMN tags text[] DEFAULT '{}';

-- Create index for efficient tag searching
CREATE INDEX idx_credentials_tags ON public.credentials USING GIN(tags);