import {
  createServerComponentClient,
  createClientComponentClient,
} from "@supabase/auth-helpers-nextjs";
import { SupabaseClient, createClient } from "@supabase/supabase-js";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

const supabaseCreateClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

type DatabaseTables = Database["public"]["Tables"];

type DatabaseOptions =
  | {
      type: "serverComponent";
      cookies(): ReadonlyRequestCookies;
    }
  | {
      type: "server" | "clientComponent";
    };

class DatabaseClient {
  instance!: SupabaseClient<Database>;

  constructor(options: DatabaseOptions) {
    const { type } = options;
    if (type === "serverComponent") {
      this.instance = createServerComponentClient({ cookies: options.cookies });
      return;
    }
    if (type === "clientComponent") {
      this.instance = createClientComponentClient<Database>();
      return;
    }
    if (type === "server") {
      this.instance = supabaseCreateClient();
    }
  }

  async getAuthUser() {
    return await this.instance.auth.getUser();
  }

  async signOutUser() {
    return await this.instance.auth.signOut();
  }

  tweets = {
    getAll: async () =>
      await this.instance.from("tweets").select(),
    insert: async (setData: DatabaseTables["tweets"]["Insert"]) =>
      await this.instance.from("tweets").insert(setData).select().single(),
    remove: async (setId: string) =>
      await this.instance.from("tweets").delete().eq("id", setId),
    update: async (
      setId: string,
      setData: DatabaseTables["tweets"]["Update"]
    ) => {
      return await this.instance
        .from("tweets")
        .update(setData)
        .eq("id", setId)
        .select()
        .single();
    },
  };

  currentUser = {
    auth: async () => this.getAuthUser(),
    profile: async () => {
      const auth = await this.getAuthUser();
      if (auth.error) return { error: auth.error };
      return await this.instance
        .from("profile")
        .select()
        .eq("id", auth.data.user.id)
        .single();
    }
  };
  //
  users = {
    getProfile: async (userId: string) =>
      await this.instance
        .from("profile")
        .select()
        .eq("id", userId)
        .select()
        .single(),
  };
}

export { supabaseCreateClient, DatabaseClient };
