// import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Layout, Text, Page } from "@vercel/examples-ui";
import { Chat } from "../components/Chat";

function Home() {
  // const session = useSession();
  // const supabase = useSupabaseClient();
  return (
    <Page className="flex flex-col gap-12">
      <section className="flex flex-col gap-3">
        <Text variant="h2">GPT Job Application Bot:</Text>
        <div className="lg:w-2/3">
          <Chat />
        </div>
      </section>
    </Page>
  );
}

Home.Layout = Layout;

export default Home;
