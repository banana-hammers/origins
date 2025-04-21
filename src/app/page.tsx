import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Globe, FileCode, LayoutDashboard, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      
      <main className="container max-w-screen-2xl py-10">
        <div className="space-y-2 pb-8 pt-4 md:space-y-4 md:pb-10">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Rapid AI Prototyping Platform
          </h1>
          <p className="text-muted-foreground max-w-[650px]">
            Unleash the full potential of AI with our cutting-edge development platform! Create, experiment, and launch AI-powered applications in record time with our supercharged tech stack built for innovation.
          </p>
        </div>
 
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <div className="text-primary mb-2">
                <Globe className="h-5 w-5" />
              </div>
              <CardTitle>Modern Stack</CardTitle>
              <CardDescription>Built for Performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-start">
                <span className="mr-2 text-primary">•</span>
                <span>Next.js 15 for optimal performance</span>
              </div>
              <div className="flex items-start">
                <span className="mr-2 text-primary">•</span>
                <span>Supabase for real-time data and auth</span>
              </div>
              <div className="flex items-start">
                <span className="mr-2 text-primary">•</span>
                <span>TypeScript for type safety</span>
              </div>
              <div className="flex items-start">
                <span className="mr-2 text-primary">•</span>
                <span>Shadcn UI components</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="h-8 px-2 text-sm">
                Learn more
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="text-primary mb-2">
                <FileCode className="h-5 w-5" />
              </div>
              <CardTitle>AI Integration</CardTitle>
              <CardDescription>Ready for AI Development</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-start">
                <span className="mr-2 text-primary">•</span>
                <span>Model Context Protocol support</span>
              </div>
              <div className="flex items-start">
                <span className="mr-2 text-primary">•</span>
                <span>Real-time AI responses</span>
              </div>
              <div className="flex items-start">
                <span className="mr-2 text-primary">•</span>
                <span>Custom prompt management</span>
              </div>
              <div className="flex items-start">
                <span className="mr-2 text-primary">•</span>
                <span>API integrations</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="h-8 px-2 text-sm">
                Learn more
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="text-primary mb-2">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <CardTitle>Developer Experience</CardTitle>
              <CardDescription>Optimized Workflow</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-start">
                <span className="mr-2 text-primary">•</span>
                <span>Hot reload development</span>
              </div>
              <div className="flex items-start">
                <span className="mr-2 text-primary">•</span>
                <span>Component-driven architecture</span>
              </div>
              <div className="flex items-start">
                <span className="mr-2 text-primary">•</span>
                <span>Built-in authentication</span>
              </div>
              <div className="flex items-start">
                <span className="mr-2 text-primary">•</span>
                <span>Easy deployment</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="h-8 px-2 text-sm">
                Learn more
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="mt-10 flex justify-center">
          <Button asChild>
            <a href="https://github.com/banana-hammers/origins.git" target="_blank" rel="noopener noreferrer">
              Get Github Repo
            </a>
          </Button>
        </div>
        
        <div className="mt-10 flex justify-center">
          <Badge variant="outline" className="text-xs">
            April 2025 Release
          </Badge>
        </div>
      </main>
    </div>
  );
}
