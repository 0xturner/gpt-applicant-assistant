import { Analytics } from "@vercel/analytics/react";
import type { AppProps } from "next/app";

import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import "../styles/global.css";
import { ChakraProvider } from "@chakra-ui/react";

const queryClient = new QueryClient();

function App({ Component, pageProps }: AppProps) {
  const [supabase] = useState(() => createBrowserSupabaseClient());

  return (
    <ChakraProvider>
      <QueryClientProvider client={queryClient}>
        <SessionContextProvider
          supabaseClient={supabase}
          initialSession={pageProps.initialSession}
        >
          <Component {...pageProps} />
          <Analytics />
        </SessionContextProvider>
      </QueryClientProvider>
    </ChakraProvider>
  );
}

export default App;
