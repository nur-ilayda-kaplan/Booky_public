"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initGA, trackPageView, getTrafficSource } from "@/lib/analytics";

export function useAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    initGA();
    getTrafficSource();
  }, []);

  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);
}
