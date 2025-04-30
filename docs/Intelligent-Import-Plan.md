# Intelligent Import Implementation Plan

**Version:** v0.1 (April 29, 2025)  
**Status:** Draft  
**Lead Engineer:** TBD  
**Based on PRD:** [Intelligent-Import.md](./Intelligent-Import.md)

## Overview

This document outlines the technical implementation plan for the Intelligent Import feature as described in the Product Requirements Document. The feature will allow roofing contractors to import material quotes from PDFs, CSVs, or photos and automatically convert them into digital estimates in the system.

## 1. Branch Strategy

We will create a feature branch named `feature/intelligent-import` from the main branch. All development work will be isolated to this branch until the feature is complete and ready for review.

## 2. Database Schema Design

### 2.1 New Tables

#### `materials_demo`

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE materials_demo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100),
  price DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  embedding VECTOR(1536),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_materials_demo_description ON materials_demo USING GIN (to_tsvector('english', description));
CREATE INDEX idx_materials_demo_embedding ON materials_demo USING ivfflat (embedding vector_cosine_ops);
```

#### `import_logs`

```sql
CREATE TABLE import_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  project_id UUID NOT NULL,
  estimate_id UUID,
  file_name TEXT NOT NULL,
  file_type VARCHAR(10) NOT NULL,
  file_size INTEGER NOT NULL,
  tokens_used INTEGER,
  processing_time_ms INTEGER,
  model VARCHAR(50),
  success BOOLEAN DEFAULT false,
  error_message TEXT,
  raw_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_import_logs_user_id ON import_logs(user_id);
CREATE INDEX idx_import_logs_project_id ON import_logs(project_id);
```

#### `project_estimate_options`

```sql
CREATE TABLE project_estimate_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL,
  name VARCHAR(100) DEFAULT 'Draft Estimate',
  description TEXT,
  total_material DECIMAL(12,2),
  total_labor DECIMAL(12,2),
  is_draft BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_project_estimate_options_project_id ON project_estimate_options(project_id);
```

#### `project_estimate_items`

```sql
CREATE TABLE project_estimate_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estimate_id UUID REFERENCES project_estimate_options(id) ON DELETE CASCADE,
  material_id UUID REFERENCES materials_demo(id),
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 1,
  unit VARCHAR(20),
  material_price DECIMAL(10,2) DEFAULT 0,
  labor_price DECIMAL(10,2) DEFAULT 0,
  confidence FLOAT DEFAULT 1.0,
  sort_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_project_estimate_items_estimate_id ON project_estimate_items(estimate_id);
```

### 2.2 Row-Level Security (RLS)

RLS will be implemented in a future phase. For the MVP, we'll rely on application-level security.

## 3. Storage Configuration

Set up a Supabase Storage bucket for imported files:

```sql
-- Create storage bucket for import files
INSERT INTO storage.buckets (id, name, public)
VALUES ('import-files', 'Import Files', false);

-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects FOR INSERT
TO authenticated
USING (bucket_id = 'import-files' AND auth.uid() = owner);

-- Allow users to read their own files
CREATE POLICY "Allow users to read their own files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'import-files' AND auth.uid() = owner);
```

## 4. Backend Implementation

### 4.1 File Processing Utility

Create a utility for processing uploaded files:

```typescript
// src/lib/fileProcessing.ts

export async function processPDF(fileBuffer: Buffer): Promise<Buffer> {
  // Convert first page of PDF to PNG
  // Implementation details...
}

export async function processImage(fileBuffer: Buffer): Promise<Buffer> {
  // Resize and optimize image if needed
  // Implementation details...
}

export async function processCSV(fileBuffer: Buffer): Promise<any[]> {
  // Parse CSV into structured JSON
  // Implementation details...
}
```

### 4.2 OpenAI Vision Integration

Extend the existing OpenAI service to include Vision API integration:

```typescript
// src/lib/visionService.ts

import { openai } from './openaiService';

const VISION_MODEL = 'o3-vision-latest';

export async function extractEstimateFromImage(
  imageBase64: string
) {
  try {
    const response = await openai.chat.completions.create({
      model: VISION_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Extract line items from this quote/invoice.' },
            { type: 'image_url', image_url: { url: `data:image/png;base64,${imageBase64}` } }
          ],
        },
      ],
      max_tokens: 1500,
      response_format: { type: 'json_object' },
      seed: 123,
    });

    return {
      success: true,
      data: JSON.parse(response.choices[0].message.content || '{}'),
      usage: response.usage,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'Unknown error occurred',
    };
  }
}
```

### 4.3 Material Mapping Service

Implement a service for mapping extracted items to materials in the database:

```typescript
// src/lib/materialMapping.ts

import { supabase } from './supabaseClient';
import { generateEmbedding } from './openaiService';

export async function mapItemToMaterial(description: string) {
  // First try exact keyword matching
  const { data: exactMatches } = await supabase
    .from('materials_demo')
    .select('id, sku, description, price, unit')
    .ilike('description', `%${description}%`)
    .limit(1);

  if (exactMatches && exactMatches.length > 0) {
    return {
      success: true,
      data: exactMatches[0],
      method: 'keyword',
    };
  }

  // If no exact match, try vector similarity
  const embeddingResult = await generateEmbedding(description);
  
  if (!embeddingResult.success) {
    return {
      success: false,
      error: 'Failed to generate embedding',
    };
  }

  const { data: vectorMatches } = await supabase.rpc('match_materials', {
    query_embedding: embeddingResult.data,
    similarity_threshold: 0.85,
    match_count: 1,
  });

  if (vectorMatches && vectorMatches.length > 0) {
    return {
      success: true,
      data: vectorMatches[0],
      method: 'vector',
    };
  }

  return {
    success: false,
    error: 'No matching material found',
  };
}
```

### 4.4 Import API Endpoint

Create a new API endpoint for file imports:

```typescript
// src/app/api/import/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';
import { processPDF, processImage, processCSV } from '../../../lib/fileProcessing';
import { extractEstimateFromImage } from '../../../lib/visionService';
import { mapItemToMaterial } from '../../../lib/materialMapping';

export const config = {
  api: {
    bodyParser: false,
    responseLimit: '8mb',
  },
};

export async function POST(request: NextRequest) {
  try {
    // Implementation details...
    // 1. Parse multipart form data
    // 2. Validate file type and size
    // 3. Process file based on type
    // 4. Call Vision API
    // 5. Map items to materials
    // 6. Create estimate in database
    // 7. Log import statistics
    // 8. Return estimate ID

    return NextResponse.json({
      success: true,
      estimateId: estimateId,
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
```

### 4.5 Estimate Service

Create a service for estimate operations:

```typescript
// src/lib/estimateService.ts

import { supabase } from './supabaseClient';

export async function createEstimate(projectId: string, userId: string, items: any[]) {
  // Create estimate record
  const { data: estimate, error: estimateError } = await supabase
    .from('project_estimate_options')
    .insert({
      project_id: projectId,
      created_by: userId,
      is_draft: true,
    })
    .select()
    .single();

  if (estimateError) throw estimateError;

  // Create estimate items
  const estimateItems = items.map((item, index) => ({
    estimate_id: estimate.id,
    material_id: item.material_id,
    description: item.description,
    quantity: item.quantity || 1,
    unit: item.unit,
    material_price: item.material_price || 0,
    labor_price: item.labor_price || 0,
    confidence: item.confidence || 1.0,
    sort_order: index,
  }));

  const { error: itemsError } = await supabase
    .from('project_estimate_items')
    .insert(estimateItems);

  if (itemsError) throw itemsError;

  return estimate.id;
}

export async function updateEstimate(estimateId: string, updates: any) {
  // Implementation details...
}

export async function getEstimate(estimateId: string) {
  // Implementation details...
}
```

## 5. Frontend Implementation

### 5.1 File Upload Component

```typescript
// src/components/FileUpload.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';

export function FileUpload({ projectId }: { projectId: string }) {
  // Implementation details...
}
```

### 5.2 Estimate Editor Page

```typescript
// src/app/estimate/[id]/page.tsx

import { getEstimate } from '../../../lib/estimateService';
import { EstimateGrid } from '../../../components/EstimateGrid';

export default async function EstimateEditorPage({
  params,
}: {
  params: { id: string };
}) {
  // Implementation details...
}
```

### 5.3 Estimate Grid Component

```typescript
// src/components/EstimateGrid.tsx

'use client';

import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';

export function EstimateGrid({ estimateId, initialItems }: { estimateId: string, initialItems: any[] }) {
  // Implementation details...
}
```

## 6. Implementation Plan

### 6.1 Week 1: Database & Backend Foundation

- Day 1: Set up database schema and migrations
- Day 2: Configure Supabase storage and implement file processing utilities
- Day 3: Extend OpenAI service for Vision API integration
- Day 4: Implement material mapping service with hybrid approach
- Day 5: Create import API endpoint and basic error handling

### 6.2 Week 2: Frontend & Integration

- Day 1: Implement file upload component with drag-and-drop support
- Day 2: Create estimate editor page with editable grid
- Day 3: Implement error handling UI for unmapped items
- Day 4: Add success/failure notifications and telemetry logging
- Day 5: End-to-end testing and bug fixes

## 7. Testing Plan

### 7.1 Unit Tests

- File validation logic
- PDF/Image processing utilities
- Material mapping algorithm

### 7.2 Integration Tests

- End-to-end file upload and processing
- Vision API response parsing
- Estimate creation workflow

### 7.3 User Acceptance Testing

- Test with sample quote formats from pilot contractors
- Validate processing time meets < 15s target
- Verify parsing accuracy meets ≥ 80% target

## 8. Deployment Plan

1. Apply database migrations to development environment
2. Deploy feature branch to staging environment
3. Conduct QA testing in staging
4. Deploy to production upon approval

## IMPLEMENTATION CHECKLIST:

1. Create new branch `feature/intelligent-import`
2. Create SQL migration files for database tables
   - `materials_demo` table with pgvector support
   - `import_logs` table
   - `project_estimate_options` table
   - `project_estimate_items` table
3. Apply migrations to Supabase
4. Configure Supabase Storage with `import-files` bucket
5. Implement file processing utilities in `src/lib/fileProcessing.ts`
6. Extend OpenAI service for Vision API in `src/lib/visionService.ts`
7. Create material mapping service in `src/lib/materialMapping.ts`
8. Implement estimate service in `src/lib/estimateService.ts`
9. Create import API endpoint in `src/app/api/import/route.ts`
10. Implement file upload component in `src/components/FileUpload.tsx`
11. Create estimate editor page in `src/app/estimate/[id]/page.tsx`
12. Implement estimate grid component in `src/components/EstimateGrid.tsx`
13. Add error handling and validation to all components
14. Implement telemetry logging in import process
15. Create seed data for `materials_demo` table
16. Set up and test RPC function for vector similarity search
17. Test end-to-end workflow with sample files
18. Document API endpoints and component usage