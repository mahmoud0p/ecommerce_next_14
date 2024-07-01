'use client';
import { ReactNode, useEffect, useState } from "react";
import Navbar from "@/app/components/Navbar";
import { ThemeProvider } from "next-themes";
import Error from "@/app/components/Error";
import Success from "@/app/components/success";
import { Provider } from "jotai";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

export default function App({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient();
  const [clientSide, setClientSide] = useState(false);

  useEffect(() => {
    setClientSide(true);
  }, []);

  if (!clientSide) {
    // Return a placeholder or nothing while the client determines the screen size
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Provider>
        <ThemeProvider attribute="class">
          <Navbar />
          {children}
          <Error />
          <Success />
        </ThemeProvider>
      </Provider>
    </QueryClientProvider>
  );
}
