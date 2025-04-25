"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./button";
import { useAuth } from "../../lib/auth";
import { Icons } from "./icons";
import { siteConfig } from "@/config/site";
import { cn } from "../../lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "./navigation-menu";

interface MainNavProps {
  items?: Array<{
    title: string;
    href: string;
  }>;
}

export function MainNav({ items }: MainNavProps = {}) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  return (
    <NavigationMenu viewport={false} className="max-w-full px-4">
      <NavigationMenuList className="w-full justify-between space-x-6 md:space-x-12">
        <div className="flex items-center space-x-4 md:space-x-8 lg:space-x-12">
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link href="/" className={cn(
                navigationMenuTriggerStyle(), 
                "flex items-center space-x-2 text-foreground"
              )}>
                <Icons.logo className="h-5 w-5 md:h-6 md:w-6" />
                <span className="hidden font-bold sm:inline-block">
                  {siteConfig.name}
                </span>
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          
          {items?.map((item, index) => (
            <NavigationMenuItem key={index}>
              <NavigationMenuLink asChild>
                <Link 
                  href={item.href}
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "transition-colors",
                    item.href === pathname 
                      ? "text-foreground" 
                      : "text-muted-foreground hover:text-foreground/90"
                  )}
                >
                  {item.title}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}

          {user ? (
            <>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Account</NavigationMenuTrigger>
                <NavigationMenuContent className="left-1/2 -translate-x-1/2">
                  <div className="w-[200px] p-3">
                    <div className="mb-2 text-sm text-muted-foreground">
                      {user.email}
                    </div>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left hover:bg-muted/50 transition-colors"
                      onClick={() => signOut()}
                    >
                      Sign Out
                    </Button>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </>
          ) : (
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/auth" className={navigationMenuTriggerStyle()}>
                  Sign In
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          )}
        </div>

        <NavigationMenuItem>
          <ThemeToggle />
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}