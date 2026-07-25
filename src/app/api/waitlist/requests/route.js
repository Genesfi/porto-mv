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

// GET: Ambil daftar request waitlist (Admin Only)
export async function GET() {
    try {
        if (!(await verifyAdmin())) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data, error } = await supabaseServer
            .from("waitlist_requests")
            .select("*")
            .order("id", { ascending: false });

        if (error && error.code === "42P01") {
            // Table doesn't exist yet
            return NextResponse.json({ data: [] });
        } else if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ data: data || [] });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// PATCH: Setujui (Approve) atau Ubah Status Request (Admin Only)
export async function PATCH(request) {
    try {
        if (!(await verifyAdmin())) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { id, action, status } = body;

        if (!id) {
            return NextResponse.json({ error: "Missing ID" }, { status: 400 });
        }

        // If action is "approve", convert request to active commission slot in `commissions` table
        if (action === "approve") {
            const { data: reqData, error: reqErr } = await supabaseServer
                .from("waitlist_requests")
                .select("*")
                .eq("id", id)
                .single();

            if (reqErr || !reqData) {
                return NextResponse.json({ error: "Request not found" }, { status: 404 });
            }

            // Insert into commissions table
            const { data: commData, error: commErr } = await supabaseServer
                .from("commissions")
                .insert([{
                    client_name: reqData.client_name,
                    column: "Waitlist",
                    payment_tags: ["Pending"],
                    progress_tags: ["Waiting"],
                    type_tags: [reqData.project_type || "MV"],
                    sort_order: 1
                }])
                .select();

            if (commErr) {
                return NextResponse.json({ error: commErr.message }, { status: 400 });
            }

            // Update status in waitlist_requests to 'approved'
            await supabaseServer
                .from("waitlist_requests")
                .update({ status: "approved" })
                .eq("id", id);

            return NextResponse.json({ success: true, commission: commData });
        }

        // Standard status update
        const { data, error } = await supabaseServer
            .from("waitlist_requests")
            .update({ status: status || "rejected" })
            .eq("id", id)
            .select();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, data });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// DELETE: Hapus request waitlist (Admin Only)
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
            .from("waitlist_requests")
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
