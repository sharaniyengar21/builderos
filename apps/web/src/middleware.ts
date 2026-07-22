import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = "builderos_session";

// Middleware runs on the Edge runtime, which can verify a JWT but can't reach
// Postgres — so this only checks "is there a valid session", not "who is it".
// Full user lookup happens in getCurrentUser() inside each page/route.
async function hasValidSession(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.SESSION_SECRET));
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  if (await hasValidSession(request)) {
    return NextResponse.next();
  }
  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/", "/workspaces/:path*"],
};
