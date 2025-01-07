-- Add deleted_at column to lists table
ALTER TABLE public.lists
ADD COLUMN deleted_at timestamp with time zone;