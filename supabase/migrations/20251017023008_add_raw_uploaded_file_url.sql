-- Add raw_uploaded_file_url and asset_ready columns to clips table
ALTER TABLE public.clips
  ADD COLUMN IF NOT EXISTS raw_uploaded_file_url TEXT,
  ADD COLUMN IF NOT EXISTS asset_ready BOOLEAN DEFAULT false NOT NULL;

-- Add index for asset_ready for faster queries on unprocessed clips
CREATE INDEX IF NOT EXISTS idx_clips_asset_ready ON public.clips(asset_ready) WHERE asset_ready = false;

