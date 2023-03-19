// import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Header from "@components/Header";
import { ReactNode } from "react";
import Home from "../components/Home";

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
