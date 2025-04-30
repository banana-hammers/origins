import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { processPDF, processImage, processCSV, validateFile } from '@/lib/fileProcessing';
import { extractEstimateFromImage } from '@/lib/visionService';
import { batchMapItems } from '@/lib/materialMapping';
import { createEstimate } from '@/lib/estimateService';
import { createClient } from '@supabase/supabase-js';

// Define interface for extracted items
interface ExtractedItem {
  description: string;
  quantity: number;
  unit?: string;
  price?: number;
  [key: string]: string | number | boolean | null | undefined; // More specific than 'any'
}

/**
 * Handles file imports for the Intelligent Import feature
 * Expected form data:
 * - file: The file to process
 * - projectId: (Optional) The project ID to associate the import with
 */
export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const projectId = formData.get('projectId') as string | null;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Check for Authorization header
    const authHeader = request.headers.get('Authorization');
    let session;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Get the token from Authorization header
      const token = authHeader.substring(7);
      
      // Create a Supabase client with the token
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabaseWithAuth = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      
      // Set the auth token
      const { data, error } = await supabaseWithAuth.auth.getUser(token);
      
      if (error || !data.user) {
        return NextResponse.json(
          { success: false, error: 'Invalid or expired token' },
          { status: 401 }
        );
      }
      
      session = {
        user: data.user
      };
    } else {
      // Fallback to check for session cookie if no Authorization header
      const { data: { session: cookieSession } } = await supabase.auth.getSession();
      session = cookieSession;
    }
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Validate file
    const validation = validateFile(file.size, file.type);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }
    
    // Track processing time
    const startTime = Date.now();
    
    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    let imageBuffer: Buffer;
    let extractedItems: ExtractedItem[] = [];
    
    // Process file based on type
    if (validation.fileType === 'pdf') {
      try {
        imageBuffer = await processPDF(fileBuffer);
        const base64Image = imageBuffer.toString('base64');
        const extractionResult = await extractEstimateFromImage(base64Image);
        
        if (!extractionResult.success) {
          throw new Error(extractionResult.error || 'Failed to extract data from PDF');
        }
        
        extractedItems = extractionResult.data.items || [];
      } catch (error) {
        // Log the error for debugging
        console.error('PDF processing error:', error);
        
        return NextResponse.json(
          { success: false, error: 'Failed to process PDF. Please try a different file or format.' },
          { status: 500 }
        );
      }
    } else if (validation.fileType === 'image') {
      try {
        imageBuffer = await processImage(fileBuffer);
        const base64Image = imageBuffer.toString('base64');
        const extractionResult = await extractEstimateFromImage(base64Image);
        
        if (!extractionResult.success) {
          throw new Error(extractionResult.error || 'Failed to extract data from image');
        }
        
        extractedItems = extractionResult.data.items || [];
      } catch (error) {
        // Log the error for debugging
        console.error('Image processing error:', error);
        
        return NextResponse.json(
          { success: false, error: 'Failed to process image. Please try a different file or format.' },
          { status: 500 }
        );
      }
    } else if (validation.fileType === 'csv') {
      try {
        const csvRows = await processCSV(fileBuffer);
        extractedItems = csvRows.map(row => ({
          description: String(row.description || ''),
          quantity: parseFloat(row.quantity as string) || 0,
          unit: row.unit as string,
          price: parseFloat(row.price as string) || undefined,
          ...row
        }));
      } catch (error) {
        // Log the error for debugging
        console.error('CSV processing error:', error);
        
        return NextResponse.json(
          { success: false, error: 'Failed to process CSV. Please try a different file or format.' },
          { status: 500 }
        );
      }
    }
    
    if (extractedItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No items could be extracted from the file' },
        { status: 400 }
      );
    }
    
    // Map items to materials
    const mappedItems = await batchMapItems(extractedItems);
    
    // Prepare items for estimate creation
    const estimateItems = mappedItems.map(item => ({
      description: item.originalDescription,
      quantity: item.quantity,
      unit: item.success ? item.data.unit : 'EACH',
      material_id: item.success ? item.data.id : null,
      material_price: item.success ? item.data.price : 0,
      labor_price: 0, // Default labor price to 0
      confidence: item.confidence || 0.5,
    }));
    
    // Create estimate
    const estimateId = await createEstimate(projectId, userId, estimateItems);
    
    // Calculate processing time
    const processingTime = Date.now() - startTime;
    
    // Log import statistics
    await supabase.from('import_logs').insert({
      user_id: userId,
      project_id: projectId, // This will be null if no projectId was provided
      estimate_id: estimateId,
      file_name: file.name,
      file_type: validation.fileType,
      file_size: file.size,
      processing_time_ms: processingTime,
      model: 'o3-vision-latest', // Hardcoded for now
      success: true,
      raw_json: extractedItems,
    });
    
    // Upload file to storage
    const fileName = `${estimateId}/${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('import-files')
      .upload(fileName, fileBuffer);
    
    if (uploadError) {
      console.error('File upload error:', uploadError);
      // Don't fail the whole request if storage upload fails
    }
    
    return NextResponse.json({
      success: true,
      estimateId: estimateId,
      processingTime: processingTime,
      itemsExtracted: extractedItems.length,
      itemsMapped: mappedItems.filter(item => item.success).length,
    });
  } catch (error) {
    console.error('Import API error:', error);
    
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

/**
 * Configuration for API route
 */
export const config = {
  api: {
    // Disable default body parser to handle file uploads
    bodyParser: false,
  },
};