import { Suspense } from 'react';
import { getEstimate } from '@/lib/estimateService';
import { EstimateGrid } from '@/components/EstimateGrid';
import { Card } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface EstimatePageProps {
  params: {
    id: string;
  };
}

async function EstimateContent({ id }: { id: string }) {
  try {
    const estimate = await getEstimate(id);
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{estimate.name || 'Estimate Editor'}</h1>
            <p className="text-gray-500">
              {estimate.is_draft ? 'Draft • ' : 'Finalized • '}
              Created on {new Date(estimate.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/import">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Imports
              </Button>
            </Link>
          </div>
        </div>
        
        <EstimateGrid estimateId={id} initialEstimate={estimate} />
      </div>
    );
  } catch {
    // Error handling without using the error variable
    return (
      <Card className="p-8 text-center">
        <h2 className="text-xl font-bold mb-2">Error Loading Estimate</h2>
        <p className="text-gray-500">
          The estimate could not be loaded. It may have been deleted or you might not have permission to view it.
        </p>
        <div className="mt-4">
          <Link href="/import">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Imports
            </Button>
          </Link>
        </div>
      </Card>
    );
  }
}

export default async function EstimatePage({ params }: EstimatePageProps) {
  return (
    <div className="container max-w-5xl py-8">
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading estimate...</span>
          </div>
        }
      >
        <EstimateContent id={await params.id} />
      </Suspense>
    </div>
  );
}