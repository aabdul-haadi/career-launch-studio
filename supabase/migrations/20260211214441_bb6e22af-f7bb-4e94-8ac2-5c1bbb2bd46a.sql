
-- Create storage bucket for career pack PDFs
INSERT INTO storage.buckets (id, name, public) VALUES ('career-packs', 'career-packs', true);

-- Allow anyone to view/download files (public bucket)
CREATE POLICY "Anyone can download career packs"
ON storage.objects FOR SELECT
USING (bucket_id = 'career-packs');

-- Service role can upload files (admin uploads via edge function)
CREATE POLICY "Service role can upload career packs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'career-packs');

-- Service role can delete expired files
CREATE POLICY "Service role can delete career packs"
ON storage.objects FOR DELETE
USING (bucket_id = 'career-packs');

-- Add shared_documents column to track what's been shared and when
ALTER TABLE public.student_submissions
ADD COLUMN shared_documents jsonb DEFAULT NULL,
ADD COLUMN shared_at timestamptz DEFAULT NULL,
ADD COLUMN share_expires_at timestamptz DEFAULT NULL;
