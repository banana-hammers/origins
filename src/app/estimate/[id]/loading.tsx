// filepath: /Users/ryaneves/code-projects/origins/src/app/estimate/[id]/loading.tsx
import { Loader2 } from 'lucide-react';

export default function EstimateLoading() {
  return (
    <div className="container max-w-5xl py-8">
      <h1 className="text-3xl font-bold mb-6">Estimate Editor</h1>
      
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading estimate...</span>
      </div>
    </div>
  );
}