import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { ReactNode } from "react";

const Header = ({ children }: { children: ReactNode }) => {
  const supabase = useSupabaseClient();

  return (
    <div className="navbar bg-base-100">
      <div className="flex-1">
        <a className="btn-ghost btn text-xl normal-case">GPT Assistant</a>
      </div>
      <div>{children}</div>
    </div>
  );
};

export default Header;
