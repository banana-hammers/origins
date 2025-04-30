// filepath: /Users/ryaneves/code-projects/origins/src/app/estimate/[id]/error.tsx
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function EstimateError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Estimate page error:', error);
  }, [error]);

  return (
    <div className="container max-w-5xl py-8">
      <h1 className="text-3xl font-bold mb-6">Estimate Editor</h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Error Loading Estimate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            There was a problem loading this estimate. The error has been reported.
          </p>
          <div className="bg-red-50 p-4 rounded-md text-sm text-red-700 font-mono">
            {error.message || 'Unknown error occurred'}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
          <Button
            variant="default"
            onClick={reset}
          >
            Try Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}