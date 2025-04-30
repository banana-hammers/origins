'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Upload, FileType2, AlertCircle, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface FileUploadProps {
  projectId?: string; // Make projectId optional
}

export function FileUpload({ projectId }: FileUploadProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === 'dragenter' || e.type === 'dragover') {
        setDragActive(true);
      } else if (e.type === 'dragleave') {
        setDragActive(false);
      }
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        setFile(e.dataTransfer.files[0]);
        setError(null);
      }
    },
    []
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      if (e.target.files && e.target.files[0]) {
        setFile(e.target.files[0]);
        setError(null);
      }
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Only append projectId if it exists
      if (projectId) {
        formData.append('projectId', projectId);
      }

      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('You must be logged in to upload files');
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData,
        headers: {
          // Include authorization header with the session access token
          'Authorization': `Bearer ${session.access_token}`
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to process file');
      }

      // Navigate to the estimate editor page
      router.push(`/estimate/${data.estimateId}`);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred');
      }
      setIsLoading(false);
    }
  }, [file, projectId, router]);

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-xl">Intelligent Import</CardTitle>
        <CardDescription>
          Upload a quote, invoice, or material list to automatically generate an estimate.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-md p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer ${
            dragActive ? 'border-primary bg-gray-50' : 'border-gray-300'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleChange}
            accept=".pdf,.jpg,.jpeg,.png,.csv,.xlsx"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="bg-primary/10 p-4 rounded-full">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm font-medium">
                Drag and drop a file, or click to browse
              </p>
              <p className="text-xs text-gray-500">
                Supports PDF, images, CSV/Excel
              </p>
            </div>
          </label>
        </div>

        {file && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md flex items-center gap-3">
            <FileType2 className="h-5 w-5 text-gray-500" />
            <div className="flex-1 truncate">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFile(null)}
              className="text-red-500 hover:text-red-700"
            >
              Remove
            </Button>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 rounded-md flex items-center gap-3 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">{error}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={!file || isLoading}
          className="min-w-[120px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Import
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}