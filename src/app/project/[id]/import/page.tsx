// filepath: /Users/ryaneves/code-projects/origins/src/app/project/[id]/import/page.tsx
import { Suspense } from 'react';
import { ImportPage } from '@/components/ImportPage';
import { supabase } from '@/lib/supabaseClient';
import { Loader2 } from 'lucide-react';
import { redirect } from 'next/navigation';

interface ImportProjectPageProps {
  params: {
    id: string;
  };
}

async function getProjectDetails(projectId: string) {
  const { data: session } = await supabase.auth.getSession();
  
  if (!session.session) {
    redirect('/auth');
  }
  
  const { data: project, error } = await supabase
    .from('projects')
    .select('id, name')
    .eq('id', projectId)
    .single();
  
  if (error || !project) {
    redirect('/not-found');
  }
  
  return project;
}

async function ImportContent({ projectId }: { projectId: string }) {
  const project = await getProjectDetails(projectId);
  
  return <ImportPage projectId={project.id} projectName={project.name} />;
}

export default function ImportProjectPage({ params }: ImportProjectPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading import page...</span>
        </div>
      }
    >
      <ImportContent projectId={params.id} />
    </Suspense>
  );
}