"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

type NavigationProgressContextValue = {
  startNavigation: () => void;
};

const NavigationProgressContext = createContext<NavigationProgressContextValue | null>(null);

export function NavigationProgressProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPending = useCallback((delay = 120) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setPending(false), delay);
  }, []);

  const startNavigation = useCallback(() => {
    setPending(true);
    clearPending(3500);
  }, [clearPending]);

  useEffect(() => {
    clearPending();
  }, [pathname, searchParams, clearPending]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const value = useMemo(() => ({ startNavigation }), [startNavigation]);

  return (
    <NavigationProgressContext.Provider value={value}>
      <div
        className={cn(
          "pointer-events-none fixed inset-x-0 top-0 z-[90] h-0.5 origin-left bg-primary shadow-[0_0_18px_hsl(var(--primary)/0.35)] transition-all duration-300",
          pending ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
        )}
      />
      {children}
    </NavigationProgressContext.Provider>
  );
}

export function useNavigationProgress() {
  const context = useContext(NavigationProgressContext);
  if (!context) {
    return {
      startNavigation: () => undefined
    };
  }
  return context;
}
