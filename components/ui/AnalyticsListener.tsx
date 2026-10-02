"use client";

import { useAnalytics } from "@/hooks/useAnalytics";

export function AnalyticsListener() {
  useAnalytics();
  return null;
}
