"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function hexToRgb(hex) {
    if (!hex) return null;
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return r ? parseInt(r[1], 16) + "," + parseInt(r[2], 16) + "," + parseInt(r[3], 16) : null;
}

const BOARD_COLUMNS = [
    { key: "Waitlist", label: "Waitlist", sub: "Queued", accent: "#e6c84a" },
    { key: "In Progress", label: "In Progress", sub: "Active", accent: "#a06ee6" },
    { key: "Completed", label: "Completed", sub: "Finished", accent: "#4ae6b8" },
];

const TAG_STYLES = {
    "Pending": { bg: "#2a2a1a", color: "#e6c84a", border: "#e6c84a40" },
    "Down Payment": { bg: "#1a2a1a", color: "#4ae680", border: "#4ae68040" },
    "Full Payment": { bg: "#1a2635", color: "#4ab8e6", border: "#4ab8e640" },
    "Waiting": { bg: "#2a1a1a", color: "#e67a4a", border: "#e67a4a40" },
    "In Progress": { bg: "#1f1a2a", color: "#a06ee6", border: "#a06ee640" },
    "Revision": { bg: "#2a1a22", color: "#e64a8a", border: "#e64a8a40" },
    "Done": { bg: "#1a2a24", color: "#4ae6b8", border: "#4ae6b840" },
    "MV": { bg: "#1e1a2a", color: "#b88aff", border: "#b88aff40" },
    "PV": { bg: "#1a2228", color: "#6ab4e6", border: "#6ab4e640" },
    "Lyric Video": { bg: "#221a1a", color: "#e6a06a", border: "#e6a06a40" },
    "Short Edit": { bg: "#1a2228", color: "#6ae6d4", border: "#6ae6d440" },
    "Visualizer": { bg: "#221a26", color: "#d46ae6", border: "#d46ae640" },
    "Lore": { bg: "#1a221a", color: "#7ae66a", border: "#7ae66a40" },
    "Other": { bg: "#1e1e1e", color: "#888", border: "#88888840" },
};

function Tag({ label }) {
    const s = TAG_STYLES[label] || { bg: "#1e1e1e", color: "#888", border: "#88888840" };
    return (
        <span style={{
            display: "inline-flex", alignItems: "center",
            padding: "3px 9px", borderRadius: "5px",
            fontSize: "9px", fontFamily: "'DM Mono', monospace",
            letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 500,
            background: s.bg, color: s.color, border: `1px solid ${s.border}`,
            whiteSpace: "nowrap",
        }}>{label}</span>
    );
}

export default function WaitlistPage() {
    const [commissions, setCommissions] = useState([]);
    const [settings, setSettings] = useState({ accent_color: "#d4c4a8", text_color: "#ffffff" });
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const fetchAll = async () => {
            const [{ data: cd }, { data: sd }] = await Promise.all([
                supabase.from("commissions").select("*")
                    .order("sort_order", { ascending: true })
                    .order("created_at", { ascending: false }),
                supabase.from("site_settings").select("*").eq("id", 1).single(),
            ]);
            if (cd) setCommissions(cd);
            if (sd) setSettings({ accent_color: sd.accent_color || "#d4c4a8", text_color: sd.text_color || "#ffffff" });
            setTimeout(() => setLoaded(true), 100);
        };
        fetchAll();
    }, []);

    const rgb = hexToRgb(settings.accent_color);
    const accentRgb = rgb || "212,196,168";
    const accentColor = settings.accent_color || "#d4c4a8";

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Mono:wght@300;400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --bg:#080808;--surface:#0f0f0f;--surface2:#141414;
          --border:rgba(255,255,255,0.07);--border2:rgba(255,255,255,0.04);
          --text:#f0ece4;--muted:rgba(240,236,228,0.45);
          --accent:${accentColor};--accent-rgb:${accentRgb};--white:${settings.text_color};
        }
        html,body{height:100%}
        body{background:var(--bg);color:var(--text);font-family:'DM Mono',monospace;min-height:100vh;display:flex;flex-direction:column;}
        .page{opacity:0;transform:translateY(16px);transition:opacity .7s ease,transform .7s ease;flex:1;display:flex;flex-direction:column;}
        .page.loaded{opacity:1;transform:translateY(0)}

        nav{padding:28px 48px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border2);}
        .nl{font-family:'Cormorant Garamond',serif;font-size:18px;font-weight:300;letter-spacing:.15em;color:var(--white);text-decoration:none}
        .nl span{color:var(--accent);font-style:italic}
        .nv{display:flex;gap:36px;align-items:center}
        .nv a{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.2em;color:var(--muted);text-decoration:none;text-transform:uppercase;transition:color .2s}
        .nv a:hover{color:var(--accent)}

        .header{padding:52px 48px 40px;text-align:center;}
        .h-sub{font-size:9px;letter-spacing:.35em;text-transform:uppercase;color:var(--accent);margin-bottom:14px;opacity:.9}
        .h-title{font-family:'Cormorant Garamond',serif;font-size:58px;font-weight:300;line-height:1;color:var(--white);letter-spacing:-.02em}
        .h-title em{font-style:italic;color:var(--accent)}
        .h-desc{font-size:11px;color:var(--muted);margin-top:20px;max-width:420px;margin-inline:auto;line-height:1.9;letter-spacing:.04em}

        .stats{display:flex;justify-content:center;gap:48px;padding:0 48px 44px}
        .stat{text-align:center}
        .stat-num{font-family:'Cormorant Garamond',serif;font-size:36px;font-weight:300;line-height:1}
        .stat-label{font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);margin-top:4px}
        .stat-divider{width:1px;background:var(--border);align-self:stretch;margin:4px 0}

        .board{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;padding:0 48px 80px;flex:1;align-items:start}

        .col{background:var(--surface);border:1px solid var(--border);border-radius:14px;overflow:hidden;display:flex;flex-direction:column}
        .c-head{padding:18px 20px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border)}
        .c-head-left{display:flex;flex-direction:column;gap:4px}
        .c-head h3{font-size:11px;letter-spacing:.2em;text-transform:uppercase;font-weight:500}
        .c-sub{font-size:9px;letter-spacing:.1em;color:var(--muted)}
        .c-count{font-size:11px;font-weight:500;background:rgba(255,255,255,0.05);border:1px solid var(--border);padding:5px 12px;border-radius:20px;color:var(--muted)}

        .c-body{padding:16px;display:flex;flex-direction:column;gap:10px;min-height:80px}
        .c-card{background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:16px 16px 14px;position:relative;overflow:hidden;transition:border-color .2s,transform .2s,box-shadow .2s;cursor:default}
        .c-card:hover{border-color:rgba(255,255,255,0.12);transform:translateY(-1px);box-shadow:0 8px 24px rgba(0,0,0,0.4)}
        .cc-tags{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:10px}
        .cc-name{font-family:'Cormorant Garamond',serif;font-size:21px;font-weight:300;color:var(--white);line-height:1.2;letter-spacing:.01em}

        .c-empty{font-size:10px;letter-spacing:.1em;color:rgba(255,255,255,0.15);text-align:center;padding:24px 0;font-style:italic}

        @media(max-width:900px){
          nav{padding:20px 24px}
          .nv{display:none}
          .header{padding:36px 24px 32px}
          .h-title{font-size:42px}
          .stats{gap:24px;padding:0 24px 32px}
          .board{grid-template-columns:1fr;padding:0 24px 60px}
        }
      `}</style>

            <div className={`page ${loaded ? "loaded" : ""}`}>
                <nav>
                    <Link href="/" className="nl">Migi <span>Gustian</span></Link>
                    <div className="nv">
                        <Link href="/#works">Works</Link>
                        <Link href="/#about">About</Link>
                        <Link href="/waitlist" style={{ color: "var(--accent)" }}>Waitlist</Link>
                    </div>
                </nav>

                <div className="header">
                    <p className="h-sub">Commission Status</p>
                    <h1 className="h-title">Current <em>Waitlist</em></h1>
                    <p className="h-desc">An overview of ongoing commissions and projects. Thank you for your patience!</p>
                </div>

                {/* Stats */}
                <div className="stats">
                    {BOARD_COLUMNS.map((col, i) => {
                        const count = commissions.filter(c => (c.column || "Waitlist") === col.key).length;
                        return (
                            <div key={col.key} style={{ display: "contents" }}>
                                {i > 0 && <div className="stat-divider" />}
                                <div className="stat">
                                    <div className="stat-num" style={{ color: col.accent }}>{count}</div>
                                    <div className="stat-label">{col.label}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="board">
                    {BOARD_COLUMNS.map(col => {
                        const items = commissions.filter(c => (c.column || "Waitlist") === col.key);
                        return (
                            <div key={col.key} className="col">
                                <div className="c-head">
                                    <div className="c-head-left">
                                        <h3 style={{ color: col.accent }}>{col.label}</h3>
                                        <span className="c-sub">{col.sub}</span>
                                    </div>
                                    <span className="c-count">{items.length}</span>
                                </div>
                                <div className="c-body">
                                    <AnimatePresence>
                                        {items.length === 0 && <p className="c-empty">No entries yet.</p>}
                                        {items.map((item, i) => {
                                            // Gabung semua tag jadi satu array
                                            const allTags = [
                                                ...(item.payment_tags || []),
                                                ...(item.progress_tags || []),
                                                ...(item.type_tags || []),
                                            ];
                                            return (
                                                <motion.div
                                                    key={item.id}
                                                    className="c-card"
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.97 }}
                                                    transition={{ delay: i * 0.04, duration: 0.3 }}
                                                >
                                                    {/* Accent bar kiri */}
                                                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "2.5px", background: col.accent, opacity: 0.7 }} />
                                                    {allTags.length > 0 && (
                                                        <div className="cc-tags">
                                                            {allTags.map(t => <Tag key={t} label={t} />)}
                                                        </div>
                                                    )}
                                                    <h4 className="cc-name">{item.client_name}</h4>
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}