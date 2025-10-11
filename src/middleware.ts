import { MiddlewareConfig, NextRequest, NextResponse } from "next/server";

const Routes = [
    { path: "/", private: false, whenAuthenticated: "next" },
    { path: "/facetexture", private: false, whenAuthenticated: "redirect", to: "/internal/facetexture" },
    { path: "/rank", private: false, whenAuthenticated: "next" },
    { path: "/news", private: false, whenAuthenticated: "next" },
    { path: "/internal", private: true, whenAuthenticated: "next" },
    { path: "/admin", private: true, whenAuthenticated: "next" },
    { path: "/financial", private: true, whenAuthenticated: "next" },
] as const;

const REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE = "/signout";

export function middleware(request: NextRequest) {
    const path = getPrefixRequestPathname(request);
    const route = Routes.find((route) => route.path === path);
    const authenticated = !!request.cookies.get("lifetimetoken");

    if (!authenticated && route?.private)
        return redirectToPathname(request, REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE);

    if (authenticated && !route?.private && route?.whenAuthenticated === "redirect")
        return redirectToPathname(request, route.to);

    if (authenticated && route?.private) return NextResponse.next();

    return NextResponse.next();
}

function redirectToPathname(request: NextRequest, pathname: string, searchParams?: string) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = pathname;

    if (searchParams) {
        redirectUrl.search = searchParams;
    }

    return NextResponse.redirect(redirectUrl);
}

function getPrefixRequestPathname(request: NextRequest): string {
    const path = request.nextUrl.pathname;
    const splitPath = path
        .split(/\/([^\/]+)/)
        .slice(1, 3)
        .map((segment) => `/${segment}`)[0];

    return splitPath;
}

export const config: MiddlewareConfig = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         */
        "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
    ],
};
