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

// GET: Ambil semua antrean/commissions (Publik)
export async function GET() {
    try {
        const { data, error } = await supabaseServer
            .from("commissions")
            .select("*")
            .order("sort_order", { ascending: true })
            .order("created_at", { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ data });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST: Tambah antrean baru (Admin Only)
export async function POST(request) {
    try {
        if (!(await verifyAdmin())) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { client_name, column, payment_tags, progress_tags, type_tags, sort_order } = body;

        const { data, error } = await supabaseServer
            .from("commissions")
            .insert([{
                client_name,
                column,
                payment_tags: payment_tags || [],
                progress_tags: progress_tags || [],
                type_tags: type_tags || [],
                sort_order
            }])
            .select();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ data });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// DELETE: Hapus antrean (Admin Only)
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
            .from("commissions")
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

// PATCH: Update antrean (Admin Only)
export async function PATCH(request) {
    try {
        if (!(await verifyAdmin())) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { id, client_name, column, payment_tags, progress_tags, type_tags } = body;

        if (!id) {
            return NextResponse.json({ error: "Missing ID" }, { status: 400 });
        }

        // Siapkan objek update dinamis
        const updateFields = {};
        if (client_name !== undefined) updateFields.client_name = client_name;
        if (column !== undefined) updateFields.column = column;
        if (payment_tags !== undefined) updateFields.payment_tags = payment_tags;
        if (progress_tags !== undefined) updateFields.progress_tags = progress_tags;
        if (type_tags !== undefined) updateFields.type_tags = type_tags;

        const { data, error } = await supabaseServer
            .from("commissions")
            .update(updateFields)
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
