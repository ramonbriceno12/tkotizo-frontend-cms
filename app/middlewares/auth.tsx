import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    const token = req.cookies.get('token'); // Retrieve the JWT from cookies

    const protectedRoutes = ['/dashboard', '/users/list', '/providers/list'];

    if (protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', req.url)); // Redirect to login if no token
        }
    }

    return NextResponse.next(); // Allow the request
}

export const config = {
    matcher: ['/dashboard/:path*', '/users/list', '/providers/list'], // Define protected routes
};
