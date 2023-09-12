import {Database, Database as DB} from "@/lib/supabase";



type Tweet = DB['public']['Tables']['tweets']['Row']
type Profile = DB['public']['Tables']['profile']['Row']


declare global {
  type Database = DB;
  type TweetType = Tweet;
  type TweetWithAuthor = Tweet & {
    author:Profile,
  }
}
