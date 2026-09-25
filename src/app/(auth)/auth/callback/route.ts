import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { cloudConfigured } from "@/lib/config";
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!cloudConfigured || !code)
    return NextResponse.redirect(new URL("/signin?error=callback", url));
  try {
    const client = createRouteHandlerClient<Database>({ cookies });
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (error)
      return NextResponse.redirect(new URL("/signin?error=callback", url));
  } catch {
    return NextResponse.redirect(new URL("/signin?error=callback", url));
  }
  return NextResponse.redirect(url.origin);
}
