import type { AppProps } from "next/app";
import { Analytics } from "@vercel/analytics/react";

import "../styles/global.css";
import { useState } from "react";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";

function App({ Component, pageProps }: AppProps) {
  const [supabase] = useState(() => createBrowserSupabaseClient());

  return (
    <div data-theme="light">
      <SessionContextProvider
        supabaseClient={supabase}
        initialSession={pageProps.initialSession}
      >
        <Component {...pageProps} />
        <Analytics />
      </SessionContextProvider>
    </div>
  );
}

export default App;
