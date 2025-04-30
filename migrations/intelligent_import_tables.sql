-- Intelligent Import Feature Tables
-- This migration creates all necessary tables for the Intelligent Import feature

-- Materials Demo Table (for material lookup and mapping)
CREATE TABLE IF NOT EXISTS materials_demo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  price FLOAT NOT NULL,
  unit TEXT NOT NULL,
  embedding VECTOR(1536),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on the embedding column for faster similarity search
CREATE INDEX IF NOT EXISTS materials_demo_embedding_idx ON materials_demo USING ivfflat (embedding vector_l2_ops) WITH (lists = 100);

-- Project Estimate Options Table (for storing estimates)
CREATE TABLE IF NOT EXISTS project_estimate_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID, -- Made nullable to allow estimates without a project
  name TEXT DEFAULT 'New Estimate',
  description TEXT,
  is_draft BOOLEAN DEFAULT TRUE,
  total_material FLOAT DEFAULT 0,
  total_labor FLOAT DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Estimate Items Table (for storing line items in an estimate)
CREATE TABLE IF NOT EXISTS project_estimate_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id UUID NOT NULL REFERENCES project_estimate_options(id) ON DELETE CASCADE,
  material_id UUID REFERENCES materials_demo(id),
  description TEXT NOT NULL,
  quantity FLOAT DEFAULT 1,
  unit TEXT DEFAULT 'EACH',
  material_price FLOAT DEFAULT 0,
  labor_price FLOAT DEFAULT 0,
  confidence FLOAT DEFAULT 1.0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Import Logs Table (for tracking file imports and their performance)
CREATE TABLE IF NOT EXISTS import_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  project_id UUID, -- Made nullable to allow imports without a project
  estimate_id UUID REFERENCES project_estimate_options(id),
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  processing_time_ms INTEGER,
  model TEXT,
  success BOOLEAN DEFAULT TRUE,
  error TEXT,
  raw_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);