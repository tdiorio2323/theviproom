import { NextResponse, type NextRequest } from "next/server";
import { VIP_COOKIE_NAME } from "./lib/env";

const PROTECTED_PREFIXES = ["/vip", "/vip/", "/viproom", "/viproom/"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const protect = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p));
  const hasSession = req.cookies.get(VIP_COOKIE_NAME)?.value === "1";

  if (protect && !hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/vip-access";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/vip/:path*", "/viproom/:path*"],
};
