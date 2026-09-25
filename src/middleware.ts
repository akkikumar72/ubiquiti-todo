import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse, type NextRequest } from "next/server";
import { cloudConfigured } from "./lib/config";
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  if (cloudConfigured) {
    const client = createMiddlewareClient({ req, res });
    await client.auth.getSession();
  }
  return res;
}
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
