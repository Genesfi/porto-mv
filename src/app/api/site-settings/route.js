import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabaseServer";

async function verifyAdmin() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("sb-access-token")?.value;
    if (!accessToken) return false;
    const { data: { user }, error } = await supabaseServer.auth.getUser(accessToken);
    if (error || !user) return false;
    return true;
}

// GET: Ambil site settings id = 1 (Publik)
export async function GET() {
    try {
        const { data, error } = await supabaseServer
            .from("site_settings")
            .select("*")
            .eq("id", 1)
            .single();

        if (error && error.code !== "PGRST116") { // PGRST116 means no row found, which is fine
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ data: data || null });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST: Simpan/Upsert site settings id = 1 (Admin Only)
export async function POST(request) {
    try {
        if (!(await verifyAdmin())) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const settings = await request.json();
        
        // Hapus field id untuk menghindari penggantian manual yang tidak diinginkan
        delete settings.id;

        const { data, error } = await supabaseServer
            .from("site_settings")
            .upsert({ id: 1, ...settings }, { onConflict: "id" })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ data });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
