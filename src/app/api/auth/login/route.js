import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(request) {
    try {
        const { email, password } = await request.json();
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
