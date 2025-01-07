-- Add deleted_at column to lists table if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lists' 
    AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE public.lists
    ADD COLUMN deleted_at timestamp with time zone;
  END IF;
END $$;

-- Add deleted_at column to items table if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'items' 
    AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE public.items
    ADD COLUMN deleted_at timestamp with time zone;
  END IF;
END $$;

-- Add is_deleted column to lists table if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lists' 
    AND column_name = 'is_deleted'
  ) THEN
    ALTER TABLE public.lists
    ADD COLUMN is_deleted boolean DEFAULT false;
  END IF;
END $$;

-- Add is_deleted column to items table if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'items' 
    AND column_name = 'is_deleted'
  ) THEN
    ALTER TABLE public.items
    ADD COLUMN is_deleted boolean DEFAULT false;
  END IF;
END $$;