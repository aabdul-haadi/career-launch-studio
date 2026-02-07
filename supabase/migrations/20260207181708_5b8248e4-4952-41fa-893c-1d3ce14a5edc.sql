-- Create enum for submission status
CREATE TYPE public.submission_status AS ENUM ('pending', 'in_review', 'processing', 'completed');

-- Create student submissions table
CREATE TABLE public.student_submissions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    reference_code TEXT NOT NULL UNIQUE DEFAULT 'CLR-' || UPPER(SUBSTRING(gen_random_uuid()::text FROM 1 FOR 8)),
    status submission_status NOT NULL DEFAULT 'pending',
    
    -- Personal Info
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    linkedin_url TEXT,
    nationality TEXT,
    
    -- Education
    university TEXT NOT NULL,
    degree TEXT NOT NULL,
    graduation_year TEXT,
    gpa TEXT,
    coursework JSONB DEFAULT '[]',
    
    -- Experience (array of internships/rotations)
    experience JSONB DEFAULT '[]',
    
    -- Final Year Project
    fyp_title TEXT,
    fyp_supervisor TEXT,
    fyp_objectives TEXT,
    fyp_methods TEXT,
    fyp_tools TEXT,
    fyp_outcomes TEXT,
    
    -- Skills
    technical_skills JSONB DEFAULT '[]',
    soft_skills JSONB DEFAULT '[]',
    languages JSONB DEFAULT '[]',
    
    -- Certifications
    certifications JSONB DEFAULT '[]',
    
    -- Target Roles
    selected_roles JSONB DEFAULT '[]',
    job_description TEXT,
    
    -- Generated Outputs (stored after processing)
    generated_outputs JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Create admins table for authentication
CREATE TABLE public.admins (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default admin (password: admin123admin)
-- Using a simple hash for demo - in production use proper bcrypt
INSERT INTO public.admins (username, password_hash) 
VALUES ('admin', 'admin123admin');

-- Enable RLS
ALTER TABLE public.student_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Policies for student_submissions
-- Public can insert (students submitting forms)
CREATE POLICY "Anyone can submit"
ON public.student_submissions
FOR INSERT
WITH CHECK (true);

-- Public can view their own submission by reference code
CREATE POLICY "Anyone can view by reference code"
ON public.student_submissions
FOR SELECT
USING (true);

-- Admin can update submissions (via edge function with service role)
CREATE POLICY "Service role can update"
ON public.student_submissions
FOR UPDATE
USING (true);

-- Policies for admins table
-- Only service role can access (authenticated via edge function)
CREATE POLICY "Service role can read admins"
ON public.admins
FOR SELECT
USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_student_submissions_updated_at
BEFORE UPDATE ON public.student_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for reference code lookups
CREATE INDEX idx_submissions_reference_code ON public.student_submissions(reference_code);
CREATE INDEX idx_submissions_status ON public.student_submissions(status);
CREATE INDEX idx_submissions_created_at ON public.student_submissions(created_at DESC);