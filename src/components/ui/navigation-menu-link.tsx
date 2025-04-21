"use client";

import { NavigationMenuLink } from "@radix-ui/react-navigation-menu";
import Link from "next/link";
import { ComponentPropsWithoutRef, forwardRef } from "react";

const NavigationMenuCustomLink = forwardRef<
  HTMLAnchorElement,
  ComponentPropsWithoutRef<typeof Link>
>(({ className, href, ...props }, ref) => {
  return (
    <NavigationMenuLink asChild>
      <Link
        href={href}
        className={className}
        ref={ref}
        {...props}
      />
    </NavigationMenuLink>
  );
});
NavigationMenuCustomLink.displayName = "NavigationMenuCustomLink";

export { NavigationMenuCustomLink };