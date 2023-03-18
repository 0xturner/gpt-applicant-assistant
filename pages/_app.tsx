import type { AppProps } from "next/app";
import { Analytics } from "@vercel/analytics/react";

import "@vercel/examples-ui/globals.css";
import { useState } from "react";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";

function App({ Component, pageProps }: AppProps) {
  const [supabase] = useState(() => createBrowserSupabaseClient());

  return (
    <SessionContextProvider
      supabaseClient={supabase}
      initialSession={pageProps.initialSession}
    >
      <Component {...pageProps} />
      <Analytics />
    </SessionContextProvider>
  );
}

export default App;
