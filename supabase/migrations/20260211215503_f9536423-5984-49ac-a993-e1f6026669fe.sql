
-- Allow deletion of student submissions (needed for admin cleanup)
CREATE POLICY "Service role can delete submissions"
ON public.student_submissions FOR DELETE
USING (true);
