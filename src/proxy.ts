import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/api/chat(.*)',
    '/debug(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
    const { userId } = await auth();
    const pathname = request.nextUrl.pathname;

    console.log(`[PROXY] ${request.method} ${pathname} | User: ${userId || 'guest'}`);

    if (!isPublicRoute(request)) {
        // If it's an API route and not authenticated, return 401 instead of redirecting
        if (!userId && pathname.startsWith('/api')) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        await auth.protect();
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};