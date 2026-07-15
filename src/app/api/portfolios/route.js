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

// GET: Ambil semua portfolios (Publik)
export async function GET() {
    try {
        const { data, error } = await supabaseServer
            .from("portfolios")
            .select("*")
            .order("sort_order", { ascending: true })
            .order("id", { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ data });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST: Tambah portfolio baru (Admin Only)
export async function POST(request) {
    try {
        if (!(await verifyAdmin())) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { title, category, video_url, sort_order } = body;

        const { data, error } = await supabaseServer
            .from("portfolios")
            .insert([{ title, category, video_url, sort_order }])
            .select();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ data });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// DELETE: Hapus portfolio (Admin Only)
export async function DELETE(request) {
    try {
        if (!(await verifyAdmin())) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Missing ID" }, { status: 400 });
        }

        const { error } = await supabaseServer
            .from("portfolios")
            .delete()
            .eq("id", id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// PATCH: Update portfolio atau batch update sort_order (Admin Only)
export async function PATCH(request) {
    try {
        if (!(await verifyAdmin())) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        // Kasus 1: Batch update sort_order
        if (body.updates && Array.isArray(body.updates)) {
            const promises = body.updates.map(u => 
                supabaseServer.from("portfolios").update({ sort_order: u.sort_order }).eq("id", u.id)
            );
            const results = await Promise.all(promises);
            const failed = results.find(r => r.error);
            if (failed) {
                return NextResponse.json({ error: failed.error.message }, { status: 400 });
            }
            return NextResponse.json({ success: true });
        }

        // Kasus 2: Update single portfolio
        const { id, title, category, video_url } = body;
        if (!id) {
            return NextResponse.json({ error: "Missing ID" }, { status: 400 });
        }

        const { data, error } = await supabaseServer
            .from("portfolios")
            .update({ title, category, video_url })
            .eq("id", id)
            .select();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ data });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
