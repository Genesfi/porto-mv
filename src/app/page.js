import { supabaseServer } from "@/lib/supabaseServer";
import HomeClient from "@/components/HomeClient";

// Menonaktifkan cache otomatis Next.js agar selalu mengambil data segar
export const revalidate = 0;

export default async function Home() {
    const [{ data: portfolios }, { data: settings }] = await Promise.all([
        supabaseServer
            .from("portfolios")
            .select("*")
            .order("sort_order", { ascending: true })
            .order("id", { ascending: false }),
        supabaseServer
            .from("site_settings")
            .select("*")
            .eq("id", 1)
            .single()
    ]);

    const safeParse = (val, fallback) => {
        if (!val) return fallback;
        if (Array.isArray(val)) return val;
        try { return JSON.parse(val); } catch (e) { return fallback; }
    };

    const DEFAULT = {
        accent_color: "#d4c4a8",
        text_color: "#ffffff",
        about_text: "Music videos, kinetic typography, and visual storytelling that moves audiences and artists alike.",
        showreel_url: "",
        socials: [],
        about_name: "Migi Gustian",
        about_role: "Motion Designer",
        about_photo_url: "",
        about_skills: [],
        about_stats: [],
    };

    const initialSettings = {
        accent_color: settings?.accent_color || DEFAULT.accent_color,
        text_color: settings?.text_color || DEFAULT.text_color,
        about_text: settings?.about_text || DEFAULT.about_text,
        showreel_url: settings?.showreel_url || "",
        socials: safeParse(settings?.socials, []),
        about_name: settings?.about_name || DEFAULT.about_name,
        about_role: settings?.about_role || DEFAULT.about_role,
        about_photo_url: settings?.about_photo_url || DEFAULT.about_photo_url,
        about_skills: safeParse(settings?.about_skills, DEFAULT.about_skills),
        about_stats: safeParse(settings?.about_stats, DEFAULT.about_stats),
    };

    return (
        <HomeClient 
            initialPortfolios={portfolios || []} 
            initialSettings={initialSettings} 
        />
    );
}
