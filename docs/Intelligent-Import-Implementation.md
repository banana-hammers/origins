# Intelligent Import Implementation Guide

This document provides an overview of the Intelligent Import feature implementation for the Origins application.

## Overview

The Intelligent Import feature allows users to upload quotes, invoices, or material lists (in PDF, image, or CSV formats), which are then processed using AI to extract line items and match them to materials in our database. The result is a new estimate with pre-populated items that can be reviewed and adjusted.

## Components

1. **Vision Integration (`visionService.ts`)**
   - Handles image processing using OpenAI's Vision API
   - Extracts structured data from images/PDFs of quotes and invoices

2. **Material Mapping (`materialMapping.ts`)**
   - Maps extracted item descriptions to materials in our database
   - Uses both keyword matching and vector similarity search

3. **Estimate Service (`estimateService.ts`)**
   - Handles CRUD operations for estimates
   - Manages estimate items and calculates totals

4. **File Processing (`fileProcessing.ts`)**
   - Utilities for handling different file types
   - Validates uploads and processes images, PDFs, and CSVs

5. **Import API (`/api/import/route.ts`)**
   - API endpoint for file uploads
   - Orchestrates the extraction, mapping, and estimate creation process

6. **UI Components**
   - `FileUpload.tsx`: Drag-and-drop upload component
   - `EstimateGrid.tsx`: Grid for viewing and editing imported estimates

## Database Structure

The feature relies on several database tables:
- `materials_demo`: Stores material information with vector embeddings for similarity search
- `project_estimate_options`: Stores estimate metadata
- `project_estimate_items`: Stores line items for each estimate
- `import_logs`: Tracks import statistics and performance

## Setup Instructions

1. **Database Setup**
   - Run the migrations in `/migrations/intelligent_import_tables.sql`
   - Create the vector similarity function using `/migrations/match_materials_function.sql`
   - Seed the materials table using the script in `/scripts/seed-materials.js`

2. **Environment Variables**
   - Ensure `OPENAI_API_KEY` is set for the Vision API integration
   - Ensure Supabase connection details are properly configured

## Usage Flow

1. User uploads a file (PDF, image, or CSV) via the FileUpload component
2. The file is processed by the import API
3. For images/PDFs, Vision API extracts line items
4. Items are mapped to materials in the database
5. A new estimate is created with the mapped items
6. User is redirected to the estimate editor to review and adjust the items

## Additional Notes

- The PDF processing functionality requires additional libraries (e.g., pdf-lib, canvas) to be fully implemented
- CSV processing requires a parsing library (e.g., papaparse)
- Consider implementing rate limiting for the import API to prevent abuse