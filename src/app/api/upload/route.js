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

// POST: Upload file ke Supabase Storage (Admin Only)
export async function POST(request) {
    try {
        if (!(await verifyAdmin())) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("file");
        const fileName = formData.get("fileName");

        if (!file || !fileName) {
            return NextResponse.json({ error: "Missing file or fileName" }, { status: 400 });
        }

        // Konversi File (Blob) ke Buffer untuk upload di server
        const buffer = Buffer.from(await file.arrayBuffer());

        const { data, error } = await supabaseServer.storage
            .from("portfolio-images")
            .upload(fileName, buffer, {
                contentType: file.type,
                upsert: true
            });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        // Ambil Public URL dari file yang baru saja di-upload
        const { data: { publicUrl } } = supabaseServer.storage
            .from("portfolio-images")
            .getPublicUrl(fileName);

        return NextResponse.json({ success: true, publicUrl });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
