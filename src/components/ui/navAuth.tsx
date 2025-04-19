"use client";

import Link from "next/link";
import { Button } from "./button";
import { useAuth } from "../../lib/auth";
import { useRouter } from "next/navigation";

export function NavAuth() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <Link href="/auth">
        <Button>Sign In</Button>
      </Link>
    );
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/'); // Redirect to home page after successful sign out
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-muted-foreground">
        {user.email}
      </span>
      <Button
        variant="outline"
        onClick={handleSignOut}
      >
        Sign Out
      </Button>
    </div>
  );
}