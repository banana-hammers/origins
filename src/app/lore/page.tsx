"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ScrollText } from "lucide-react";
import { ChatPanel } from "@/components/ChatPanel";

export default function LorePage() {
  const { user, loading } = useAuth();
  const [chatOpen, setChatOpen] = useState(false);

  // Redirect if user is not authenticated
  useEffect(() => {
    if (!loading && !user) {
      redirect("/auth");
    }
  }, [user, loading]);

  // Show loading state while checking authentication
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container max-w-screen-2xl py-10">
        <div className="space-y-2 pb-8 pt-4 md:space-y-4 md:pb-10">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Lore Builder
          </h1>
          <p className="text-muted-foreground max-w-[650px]">
            Design and develop your tabletop role-playing game campaign world.
          </p>
        </div>

        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Lore Builder</CardTitle>
            <CardDescription>
              Create the foundation of your TTRPG campaign.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <Button size="lg" className="w-full max-w-xs" onClick={() => setChatOpen(true)}>
              <ScrollText className="mr-2 h-5 w-5" />
              Build My Campaign
            </Button>
          </CardContent>
        </Card>
        
        <ChatPanel open={chatOpen} onOpenChange={setChatOpen} />
      </main>
    </div>
  );
}