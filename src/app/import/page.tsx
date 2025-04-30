"use client";

import { useEffect } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Upload, FileText, BrainCircuit } from 'lucide-react';
import { redirect } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function StandaloneImportPage() {
  const { user, loading } = useAuth();

  // Redirect if user is not authenticated
  useEffect(() => {
    if (!loading && !user) {
      redirect('/auth');
    }
  }, [user, loading]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading import page...</span>
      </div>
    );
  }

  // Render import UI once authenticated
  return (
    <div className="max-w-5xl mx-auto pt-8 pb-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Intelligent Import</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <FileUpload />
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-primary" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Upload className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">1. Upload File</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload a quote, invoice, or material list in PDF, image, or spreadsheet format.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <BrainCircuit className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">2. AI Processing</h3>
                  <p className="text-sm text-muted-foreground">
                    Our AI extracts line items and automatically matches them to materials in your database.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">3. Review & Edit</h3>
                  <p className="text-sm text-muted-foreground">
                    Review the generated estimate, make adjustments, and save it.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Supported Formats</CardTitle>
              <CardDescription>
                We can process the following file types:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="bg-red-100 text-red-700 p-1 rounded text-xs font-medium">PDF</div>
                  <span>Quotes, invoices, and material lists</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="bg-blue-100 text-blue-700 p-1 rounded text-xs font-medium">IMG</div>
                  <span>Photos or scans of documents (JPG, PNG)</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="bg-green-100 text-green-700 p-1 rounded text-xs font-medium">CSV</div>
                  <span>Spreadsheets with material data</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}