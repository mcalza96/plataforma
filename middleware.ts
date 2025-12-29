import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
                    response = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // IMPORTANTE: getUser() es la forma segura de validar la sesión en el servidor
    const { data: { user } } = await supabase.auth.getUser();

    const url = request.nextUrl.clone();
    const isAuthRoute = url.pathname.startsWith('/login') || url.pathname.startsWith('/signup');
    const isProtectedRoute =
        url.pathname.startsWith('/dashboard') ||
        url.pathname.startsWith('/parent-dashboard') ||
        url.pathname.startsWith('/gallery') ||
        url.pathname.startsWith('/lessons') ||
        url.pathname.startsWith('/admin') ||
        url.pathname.startsWith('/select-profile');

    const isAdminRoute = url.pathname.startsWith('/admin');

    // Helper para redirigir manteniendo las cookies (importante para el refresco del token)
    const redirectWithCookies = (dest: string) => {
        const redirectResponse = NextResponse.redirect(new URL(dest, request.url));
        response.cookies.getAll().forEach((cookie) => {
            redirectResponse.cookies.set(cookie.name, cookie.value, {
                path: cookie.path,
                domain: cookie.domain,
                maxAge: cookie.maxAge,
                httpOnly: cookie.httpOnly,
                secure: cookie.secure,
                sameSite: cookie.sameSite,
            });
        });
        return redirectResponse;
    };

    // 1. Si el usuario está autenticado y trata de acceder a login/signup -> Redirigir a selección de perfil
    if (user && isAuthRoute) {
        return redirectWithCookies('/select-profile');
    }

    // 2. Si el usuario NO está autenticado y trata de acceder a rutas protegidas -> Redirigir a /login
    if (!user && isProtectedRoute) {
        return redirectWithCookies('/login');
    }

    // 3. Protección de Admin (Blindaje nivel middleware)
    if (user && isAdminRoute) {
        // Consultar el perfil del usuario para verificar el rol
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        // Fallback de "Super Admin" por email (Blindaje mientras se estabiliza la DB)
        const adminEmails = ['marcelo.calzadilla@jitdata.cl', 'admin@procreatealpha.studio'];
        const isSuperAdmin = user.email && adminEmails.includes(user.email);

        if (profile?.role !== 'admin' && !isSuperAdmin) {
            console.warn(`Intento de acceso no autorizado a ruta admin por: ${user.email} (Rol: ${profile?.role})`);
            return redirectWithCookies('/dashboard');
        }
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public assets
         * - api routes (optional, usually protected separately)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
