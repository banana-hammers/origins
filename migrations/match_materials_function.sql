-- filepath: /Users/ryaneves/code-projects/origins/migrations/match_materials_function.sql
-- Match Materials Function
-- This function performs vector similarity search on materials
-- For use with the Intelligent Import feature

-- Create the pgvector extension if it doesn't exist
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the function for similarity search
CREATE OR REPLACE FUNCTION match_materials(
  query_embedding vector(1536),
  similarity_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  sku text,
  description text,
  price float,
  unit text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.sku,
    m.description,
    m.price,
    m.unit,
    1 - (m.embedding <=> query_embedding) AS similarity
  FROM
    materials_demo m
  WHERE
    1 - (m.embedding <=> query_embedding) > similarity_threshold
  ORDER BY
    similarity DESC
  LIMIT
    match_count;
END;
$$;