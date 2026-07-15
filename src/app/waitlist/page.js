import { supabaseServer } from "@/lib/supabaseServer";
import WaitlistClient from "@/components/WaitlistClient";

// Menonaktifkan cache otomatis Next.js agar selalu mengambil data segar
export const revalidate = 0;

export default async function WaitlistPage() {
    const [{ data: commissions }, { data: settings }] = await Promise.all([
        supabaseServer
            .from("commissions")
            .select("*")
            .order("sort_order", { ascending: true })
            .order("created_at", { ascending: false }),
        supabaseServer
            .from("site_settings")
            .select("*")
            .eq("id", 1)
            .single()
    ]);

    const initialSettings = {
        accent_color: settings?.accent_color || "#d4c4a8",
        text_color: settings?.text_color || "#ffffff"
    };

    return (
        <WaitlistClient 
            initialCommissions={commissions || []} 
            initialSettings={initialSettings} 
        />
    );
}