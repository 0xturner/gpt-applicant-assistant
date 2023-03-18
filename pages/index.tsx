// import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
// import { Layout, Text, Page } from "@vercel/examples-ui";
import { ReactNode } from "react";
import Home from "../components/Home";

const Header = () => (
  <div className="navbar bg-base-100">
    <div className="flex-1">
      <a className="btn-ghost btn text-xl normal-case">GPT Assistant</a>
    </div>
    <div className="flex-none">
      <button className="btn-outline btn-ghost btn-square btn">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="inline-block h-5 w-5 stroke-current"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
          ></path>
        </svg>
      </button>
    </div>
  </div>
);

const Layout = ({ children }: { children: ReactNode }) => (
  <div className="mx-auto max-w-3xl px-4 sm:px-6 xl:max-w-5xl xl:px-0">
    <div className="flex h-screen flex-col justify-between">
      <Header />
      <main className="mb-auto">{children}</main>
      <footer className="footer">
        <span className="footer-title">Footer</span>{" "}
      </footer>
    </div>
  </div>
);

function Homepage() {
  // const session = useSession();
  // const supabase = useSupabaseClient();

  return (
    <Layout>
      <Home />
    </Layout>
    //   <Page className="flex flex-col gap-12">
    //     <section className="flex flex-col gap-3">
    //       <Text variant="h2">GPT Job Application Bot:</Text>
    //       <div className="lg:w-2/3">
    //         <Chat />
    //       </div>
    //     </section>
    //   </Page>
  );
}

export default Homepage;
