export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profile: {
        Row: {
          avatar_url: string | null;
          id: string;
          name: string | null;
          username: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          id: string;
          name?: string | null;
          username?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          id?: string;
          name?: string | null;
          username?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profile_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      tweets: {
        Row: {
          notes: string;
          project: string;
          priority: "high" | "medium" | "low";
          status: "todo" | "progress" | "done";
          due_date: string | null;
          created_at: string;
          id: string;
          is_completed: boolean;
          title: string;
          user_id: string;
        };
        Insert: {
          notes?: string;
          project?: string;
          priority?: "high" | "medium" | "low";
          status?: "todo" | "progress" | "done";
          due_date?: string | null;
          created_at?: string;
          id?: string;
          is_completed?: boolean;
          title: string;
          user_id: string;
        };
        Update: {
          notes?: string;
          project?: string;
          priority?: "high" | "medium" | "low";
          status?: "todo" | "progress" | "done";
          due_date?: string | null;
          created_at?: string;
          id?: string;
          is_completed?: boolean;
          title?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tweets_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profile";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
