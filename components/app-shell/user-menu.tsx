"use client";

import { useRouter } from "next/navigation";
import { LogOut, UserRound } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { getDictionary } from "@/lib/dictionaries";
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/utils";
import type { SessionProfile } from "@/lib/permissions";
import type { Locale } from "@/types/crm";

export function UserMenu({ locale, profile }: { locale: Locale; profile: SessionProfile }) {
  const router = useRouter();
  const dictionary = getDictionary(locale);
  const displayName = profile.full_name ?? profile.email ?? dictionary.userMenu.fallbackName;
  const avatarAlt = `${displayName} ${dictionary.userMenu.avatarAlt}`;
  const roleLabel = dictionary.roles[profile.role] ?? profile.role.replaceAll("_", " ");

  async function signOut() {
    const supabase = createClient();
    if (!supabase) {
      toast({
        title: dictionary.auth.missingEnvTitle,
        description: dictionary.auth.missingEnvDescription,
        variant: "destructive"
      });
      return;
    }
    await supabase.auth.signOut();
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 gap-2 px-2">
          <Avatar className="size-7">
            {profile.avatar_url ? <AvatarImage src={profile.avatar_url} alt={avatarAlt} /> : null}
            <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
          </Avatar>
          <span className="hidden max-w-32 truncate text-sm sm:inline">{displayName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <span className="block truncate">{displayName}</span>
          <span className="block truncate text-xs font-normal capitalize text-muted-foreground">{roleLabel}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <UserRound className="size-4" />
          {dictionary.userMenu.profile}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="size-4" />
          {dictionary.userMenu.signOut}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
