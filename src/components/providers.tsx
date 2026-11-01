"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient, setQueryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  }));

  // Persist the client across renders; useEffect ensures it's created once.
  useEffect(() => {
    // no-op – the state initializer already runs once.
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}