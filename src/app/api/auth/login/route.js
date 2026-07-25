import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabaseServer";
import { checkRateLimit, getClientIp, sanitizeInput } from "@/lib/security";

export async function POST(request) {
    try {
        const clientIp = getClientIp(request);
        // Rate limit: max 5 login attempts per 15 minutes per IP
        const rateCheck = checkRateLimit(`login_${clientIp}`, { limit: 5, windowMs: 15 * 60 * 1000 });

        if (!rateCheck.allowed) {
            return NextResponse.json({
                error: `Terlalu banyak percobaan login (Brute-Force Protection). Coba lagi dalam ${rateCheck.resetInSeconds} detik.`
            }, { status: 429 });
        }

        const body = await request.json();
        const email = sanitizeInput(body?.email);
        const password = body?.password;

        if (!email || !password) {
            return NextResponse.json({ error: "Email dan password wajib diisi." }, { status: 400 });
        }

        const { data, error } = await supabaseServer.auth.signInWithPassword({ email, password });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        const { session } = data;
        const cookieStore = await cookies();

        // Set access token cookie
        cookieStore.set("sb-access-token", session.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: session.expires_in,
            path: "/",
        });

        // Set refresh token cookie
        cookieStore.set("sb-refresh-token", session.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        });

        return NextResponse.json({ success: true, user: session.user });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

