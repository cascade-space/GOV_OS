import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * GovOS Route Protection Middleware
 * Server-side RBAC enforcement using the govos_auth cookie/header.
 *
 * Route -> Required roles mapping (matches backend @PreAuthorize annotations):
 *   /admin/*      -> SUPER_ADMIN, TENANT_ADMIN
 *   /mla/*        -> SUPER_ADMIN, TENANT_ADMIN, REP
 *   /officer/*    -> SUPER_ADMIN, TENANT_ADMIN, OFFICER
 *   /citizen/*    -> SUPER_ADMIN, TENANT_ADMIN, OFFICER, CITIZEN
 *   /superadmin/* -> SUPER_ADMIN only
 *   /public/*     -> Anyone (no auth)
 *
 * NOTE: JWT signature verification requires the secret on Edge Runtime.
 * For now we decode the payload (base64) for role check and rely on the
 * Spring Boot API to reject tampered tokens at the actual API call.
 * Full edge-side JWKS verification can be added in a future sprint.
 */

type UserRole = 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'OFFICER' | 'REP' | 'CITIZEN';

const ROUTE_POLICIES: { pattern: string; roles: UserRole[] }[] = [
    { pattern: '/superadmin', roles: ['SUPER_ADMIN'] },
    { pattern: '/admin',      roles: ['SUPER_ADMIN', 'TENANT_ADMIN'] },
    { pattern: '/mla',        roles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'REP'] },
    { pattern: '/officer',    roles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'OFFICER'] },
    { pattern: '/citizen',    roles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'OFFICER', 'CITIZEN'] },
];

/** Landing pages for each portal (where to send users if they attempt accessing a route outside their role) */
const PORTAL_LANDING: Record<UserRole, string> = {
    SUPER_ADMIN:  '/superadmin/dashboard',
    TENANT_ADMIN: '/admin/dashboard',
    OFFICER:      '/officer/dashboard',
    REP:          '/mla/dashboard',
    CITIZEN:      '/citizen/dashboard',
};

function decodeJwtPayload(token: string): Record<string, any> | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        // Edge-compatible base64 decode
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const json = atob(base64);
        return JSON.parse(json);
    } catch {
        return null;
    }
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Always allow: public routes, API routes, static files, Next.js internals
    if (
        pathname.startsWith('/api/') ||
        pathname.startsWith('/_next/') ||
        pathname.startsWith('/favicon') ||
        pathname.includes('.') || // static assets
        pathname === '/' ||
        pathname.startsWith('/tracking') ||
        pathname.startsWith('/login') ||
        pathname.endsWith('/login') ||
        pathname.endsWith('/register')
    ) {
        return NextResponse.next();
    }

    // Find matching policy
    const policy = ROUTE_POLICIES.find(p => pathname.startsWith(p.pattern));
    if (!policy) {
        return NextResponse.next(); // unprotected route
    }

    // Extract token from govos_auth cookie OR Authorization header
    // The client stores in localStorage (not cookie), so we check headers sent by app
    const authHeader = request.headers.get('authorization');
    const cookieAuth = request.cookies.get('govos_auth')?.value;

    let role: UserRole | null = null;
    let expiresAt: number = 0;

    if (authHeader?.startsWith('Bearer ')) {
        const claims = decodeJwtPayload(authHeader.slice(7));
        if (claims) {
            role = claims.rid as UserRole;
            expiresAt = (claims.exp ?? 0) * 1000;
        }
    } else if (cookieAuth) {
        try {
            let jsonStr = cookieAuth;
            try {
                jsonStr = decodeURIComponent(cookieAuth);
            } catch { /* ignore */ }
            const parsed = JSON.parse(jsonStr);
            role = parsed.role as UserRole;
            expiresAt = parsed.expiresAt ?? 0;
        } catch {
            // ignore
        }
    }

    // No auth or expired
    if (!role || Date.now() >= expiresAt) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Role not allowed for this route
    if (!policy.roles.includes(role)) {
        // Send to their correct portal
        const correctPortal = PORTAL_LANDING[role] ?? '/login';
        return NextResponse.redirect(new URL(correctPortal, request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/mla/:path*',
        '/officer/:path*',
        '/citizen/:path*',
        '/superadmin/:path*',
    ],
};
