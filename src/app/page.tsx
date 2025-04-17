import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <main className="container mx-auto max-w-5xl">
        <div className="flex flex-col items-center justify-center space-y-8 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-primary">Rapid AI Prototyping Platform</h1>
          <p className="max-w-[600px] text-secondary">
            Build, test, and deploy AI-powered applications with a modern tech stack designed for rapid development
          </p>
          <div className="flex gap-4">
            <a href="https://github.com/banana-hammers/origins" target="_blank" rel="noopener noreferrer">
              <Button className="px-6 py-3 text-lg font-semibold">Get Started</Button>
            </a>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full">
            <Card>
              <CardHeader>
                <CardTitle>Modern Stack</CardTitle>
                <CardDescription>Built for Performance</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-slate-600 dark:text-slate-400 text-left space-y-2">
                  <li>• Next.js 15 for optimal performance</li>
                  <li>• Supabase for real-time data and auth</li>
                  <li>• TypeScript for type safety</li>
                  <li>• Shadcn UI components</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Integration</CardTitle>
                <CardDescription>Ready for AI Development</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-slate-600 dark:text-slate-400 text-left space-y-2">
                  <li>• Model Context Protocol support</li>
                  <li>• Real-time AI responses</li>
                  <li>• Custom prompt management</li>
                  <li>• API integrations</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Developer Experience</CardTitle>
                <CardDescription>Optimized Workflow</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-slate-600 dark:text-slate-400 text-left space-y-2">
                  <li>• Hot reload development</li>
                  <li>• Component-driven architecture</li>
                  <li>• Built-in authentication</li>
                  <li>• Easy deployment</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
