"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function PrefetchRoutes({ routes }: { routes: string[] }) {
  const router = useRouter();
  useEffect(() => {
    routes.forEach((r) => router.prefetch(r));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
