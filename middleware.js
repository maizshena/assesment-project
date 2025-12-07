import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Admin routes - butuh role admin
    if (path.startsWith("/admin") && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        
        // Login/register pages bisa diakses semua orang
        if (path === '/login' || path === '/register') {
          return true;
        }
        
        // Protected pages butuh authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*", 
    "/admin/:path*", 
    "/books/:path*", 
    "/loans/:path*", 
    "/wishlist/:path*",
    "/login",
    "/register"
  ],
};