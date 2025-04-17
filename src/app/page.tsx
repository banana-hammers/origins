import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import { Input } from "../components/ui/input";
import LoginForm from "../components/ui/loginForm";

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <main className="container mx-auto max-w-5xl">
        <div className="flex flex-col items-center justify-center space-y-8 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-primary">Bring Your Roleplaying Adventures to Life</h1>
          <p className="max-w-[600px] text-secondary">
            Explore limitless worlds of your own making with our TTRPG AI-empowered campaign manager.
          </p>
          <button className="px-6 py-3 mt-4 text-lg font-semibold rounded-lg bg-accent text-foreground hover:scale-105 hover:shadow-lg">
            Start Your Adventure
          </button>

          <LoginForm />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full">
            <Card>
              <CardHeader>
                <CardTitle>Modern UI</CardTitle>
                <CardDescription>Built with Shadcn UI components</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-4">
                  <Input placeholder="Type something..." />
                  <Button>Click me</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Responsive</CardTitle>
                <CardDescription>Looks great on all devices</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Fully responsive design that adapts to any screen size.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Learn more</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customizable</CardTitle>
                <CardDescription>Easy to modify and extend</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Built with customization in mind using Tailwind CSS.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="secondary" className="w-full">Explore</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
