"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function getYouTubeID(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2]?.length === 11) ? match[2] : null;
}

function hexToRgb(hex) {
  if (!hex) return null;
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? parseInt(r[1], 16) + "," + parseInt(r[2], 16) + "," + parseInt(r[3], 16) : null;
}

const DEFAULT = {
  accent_color: "#d4c4a8",
  text_color: "#ffffff",
  about_text: "Music videos, kinetic typography, and visual storytelling that moves audiences and artists alike.",
  showreel_url: "",
  socials: [],
  // Tambahan default value buat jaga-jaga kalau data kosong
  about_name: "Migi Gustian",
  about_role: "Motion Designer",
  about_photo_url: "",
  about_skills: [],
  about_stats: [],
};

function getGridClass(index) {
  const pos = index % 14;
  if (pos === 0) return "wi r1-big";
  if (pos === 1 || pos === 2) return "wi r1-banner";
  if (pos >= 3 && pos <= 6) return "wi r-norm";
  if (pos === 7 || pos === 8) return "wi r3-banner";
  if (pos === 9) return "wi r3-big";
  if (pos >= 10 && pos <= 13) return "wi r-norm";
  return "wi r-norm";
}

// ── Background CardStack Component (Hiasan Parallax) ──
function BackgroundCardStack({ cards, paused }) {
  const [index, setIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (cards.length < 2 || paused) return;
    const t = setInterval(() => {
      setIndex(i => (i - 1 + cards.length) % cards.length);
    }, 3500);
    return () => clearInterval(t);
  }, [cards.length, paused]);

  if (!cards.length) return null;

  const visible = [0, 1, 2, 3].map(offset => cards[(index + offset + 2) % cards.length]);

  const POSITIONS_BG_DESKTOP = [
    { x: -250, y: 0, rotateZ: 15, rotateX: -20, scale: 0.45, opacity: 0.20, zIndex: 4 },
    { x: 0, y: 30, rotateZ: 5, rotateX: -15, scale: 0.4, opacity: 0.12, zIndex: 3 },
    { x: 250, y: 50, rotateZ: -5, rotateX: -10, scale: 0.35, opacity: 0.08, zIndex: 2 },
    { x: 500, y: 60, rotateZ: -15, rotateX: -5, scale: 0.3, opacity: 0.03, zIndex: 1 },
  ];
  const POSITIONS_BG_MOBILE = [
    { x: -120, y: 0, rotateZ: 15, rotateX: -20, scale: 0.45, opacity: 0.55, zIndex: 4 },
    { x: 0, y: 15, rotateZ: 5, rotateX: -15, scale: 0.4, opacity: 0.35, zIndex: 3 },
    { x: 120, y: 25, rotateZ: -5, rotateX: -10, scale: 0.35, opacity: 0.20, zIndex: 2 },
    { x: 230, y: 30, rotateZ: -15, rotateX: -5, scale: 0.3, opacity: 0.08, zIndex: 1 },
  ];
  const POSITIONS = isMobile ? POSITIONS_BG_MOBILE : POSITIONS_BG_DESKTOP;

  return (
    <div style={{
      position: "absolute",
      left: isMobile ? "50%" : "45%",
      top: isMobile ? "90%" : "90%",
      transform: "translate(-50%, -50%)",
      width: isMobile ? 380 : 1000,
      height: isMobile ? 220 : 300,
      perspective: "1400px",
      transformStyle: "preserve-3d",
      zIndex: 0,
      pointerEvents: "none",
    }}>
      <AnimatePresence>
        {visible.map((card, depth) => {
          const pos = POSITIONS[depth];

          return (
            <motion.div
              key={card.key + "-bg"}
              style={{
                position: "absolute",
                left: 0, right: 0, margin: "0 auto",
                width: isMobile ? 160 : 400, height: isMobile ? 90 : 225,
                borderRadius: 12,
                overflow: "hidden",
                filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.5))",
                transformOrigin: "center center",
                zIndex: pos.zIndex,
              }}
              initial={{ y: -100, x: -500, rotateZ: 30, rotateX: -30, scale: 0.2, opacity: 0 }}
              animate={{ x: pos.x, y: pos.y, rotateZ: pos.rotateZ, rotateX: pos.rotateX, scale: pos.scale, opacity: pos.opacity }}
              exit={{ y: 100, x: 700, rotateZ: -30, rotateX: 10, scale: 0.5, opacity: 0, zIndex: 5 }}
              transition={{ duration: 1.5, ease: [0.32, 0.72, 0, 1] }}
            >
              <img src={card.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.65)" }} />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// ── Hero CardStack Component (Utama) ──
function HeroCardStack({ cards, onCardClick, paused, isMobileOverride }) {
  const [index, setIndex] = useState(0);
  const [isMobileInternal, setIsMobileInternal] = useState(false);
  const isMobile = isMobileOverride !== undefined ? isMobileOverride : isMobileInternal;

  useEffect(() => {
    const handleResize = () => setIsMobileInternal(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (cards.length < 2 || paused) return;
    const t = setInterval(() => {
      setIndex(i => (i + 1) % cards.length);
    }, 3500);
    return () => clearInterval(t);
  }, [cards.length, paused]);

  if (!cards.length) return null;

  const visible = [0, 1, 2, 3].map(offset => cards[(index + offset) % cards.length]);

  const POSITIONS_DESKTOP = [
    { x: -140, y: -20, rotateZ: -5, rotateX: 18, scale: 1, opacity: 1, zIndex: 40 },
    { x: 80, y: 40, rotateZ: 6, rotateX: 25, scale: 0.9, opacity: 1, zIndex: 30 },
    { x: 260, y: 100, rotateZ: 18, rotateX: 30, scale: 0.8, opacity: 1, zIndex: 20 },
    { x: 420, y: 150, rotateZ: 28, rotateX: 34, scale: 0.7, opacity: 1, zIndex: 10 },
  ];

  const POSITIONS_MOBILE = [
    { x: -60, y: -10, rotateZ: -5, rotateX: 18, scale: 1, opacity: 1, zIndex: 40 },
    { x: 30, y: 20, rotateZ: 6, rotateX: 25, scale: 0.9, opacity: 1, zIndex: 30 },
    { x: 110, y: 50, rotateZ: 18, rotateX: 30, scale: 0.8, opacity: 1, zIndex: 20 },
    { x: 185, y: 75, rotateZ: 28, rotateX: 34, scale: 0.7, opacity: 1, zIndex: 10 },
  ];

  const POSITIONS = isMobile ? POSITIONS_MOBILE : POSITIONS_DESKTOP;
  const CARD_W = isMobile ? 260 : 560;
  const CARD_H = isMobile ? 146 : 315;

  return (
    <div style={{
      position: "absolute",
      left: isMobile ? "35%" : "55%",
      top: isMobile ? "45%" : "50%",
      transform: "translate(-50%, -50%)",
      width: isMobile ? 600 : 1000,
      height: isMobile ? 400 : 600,
      perspective: "1400px",
      transformStyle: "preserve-3d",
      zIndex: 1,
      pointerEvents: "none",
    }}>
      <AnimatePresence>
        {visible.map((card, depth) => {
          const isTop = depth === 0;
          const pos = POSITIONS[depth];

          return (
            <motion.div
              key={card.key}
              onClick={isTop ? () => onCardClick(card.ytId) : undefined}
              style={{
                position: "absolute",
                left: 0, right: 0, margin: "0 auto",
                width: CARD_W, height: CARD_H,
                borderRadius: 16,
                overflow: "hidden",
                cursor: isTop ? "pointer" : "default",
                transformOrigin: "center center",
                zIndex: pos.zIndex,
                pointerEvents: "auto",
                filter: isTop ? "drop-shadow(0 30px 40px rgba(0,0,0,0.55))" : "drop-shadow(0 8px 16px rgba(0,0,0,0.35))",
                transition: "filter 0.3s ease",
              }}
              initial={{ y: 200, x: isMobile ? 300 : 600, rotateZ: 35, rotateX: 45, scale: 0.6, opacity: 0 }}
              animate={{ x: pos.x, y: pos.y, rotateZ: pos.rotateZ, rotateX: pos.rotateX, scale: pos.scale, opacity: pos.opacity }}
              exit={{ y: -250, x: isMobile ? -200 : -500, rotateZ: -20, rotateX: 5, scale: 1.1, opacity: 0, zIndex: 50 }}
              transition={{ duration: 1.5, ease: [0.32, 0.72, 0, 1] }}
              whileHover={isTop ? {
                y: pos.y - 12, scale: 1.03, rotateZ: -1, rotateX: 10,
                filter: "drop-shadow(0 40px 60px rgba(0,0,0,0.7))",
                transition: { duration: 0.3, ease: "easeOut" }
              } : {}}
            >
              <img src={card.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} loading="lazy" />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%)", pointerEvents: "none" }} />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export default function Home() {
  const [portfolios, setPortfolios] = useState([]);
  const [settings, setSettings] = useState(DEFAULT);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loaded, setLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const cursorRef = useRef(null);
  const cursorDotRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const fetchAll = async () => {
      const [{ data: pd }, { data: sd }] = await Promise.all([
        supabase.from("portfolios").select("*").order("sort_order", { ascending: true }).order("id", { ascending: false }),
        supabase.from("site_settings").select("*").eq("id", 1).single(),
      ]);

      if (pd) setPortfolios(pd);
      if (sd) {
        // ALAT PENERJEMAH: Ubah string jadi Array dengan aman
        const safeParse = (val, fallback) => {
          if (!val) return fallback;
          if (Array.isArray(val)) return val;
          try { return JSON.parse(val); } catch (e) { return fallback; }
        };

        setSettings({
          accent_color: sd.accent_color || DEFAULT.accent_color,
          text_color: sd.text_color || DEFAULT.text_color,
          about_text: sd.about_text || DEFAULT.about_text,
          showreel_url: sd.showreel_url || "",
          socials: safeParse(sd.socials, []),
          about_name: sd.about_name || DEFAULT.about_name,
          about_role: sd.about_role || DEFAULT.about_role,
          about_photo_url: sd.about_photo_url || DEFAULT.about_photo_url,

          // Gunakan alat penerjemah di sini
          about_skills: safeParse(sd.about_skills, DEFAULT.about_skills),
          about_stats: safeParse(sd.about_stats, DEFAULT.about_stats),
        });
      }
      setTimeout(() => setLoaded(true), 100);
    };
    fetchAll();

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);

    const move = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        if (cursorRef.current) cursorRef.current.style.transform = `translate(${x - 16}px,${y - 16}px)`;
        if (cursorDotRef.current) cursorDotRef.current.style.transform = `translate(${x - 3}px,${y - 3}px)`;
      });
    };
    window.addEventListener("mousemove", move);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const categories = ["All", ...Array.from(new Set(portfolios.map(p => p.category).filter(Boolean)))];
  const filtered = activeFilter === "All" ? portfolios : portfolios.filter(p => p.category === activeFilter);
  const rgb = hexToRgb(settings.accent_color);
  const am = rgb ? `rgba(${rgb},0.3)` : "rgba(212,196,168,0.3)";
  const ab = rgb ? `rgba(${rgb},0.25)` : "rgba(212,196,168,0.25)";
  const ag = rgb ? `rgba(${rgb},0.06)` : "rgba(212,196,168,0.06)";

  const handleShowReel = () => {
    if (!settings.showreel_url) return;
    const ytID = getYouTubeID(settings.showreel_url);
    if (ytID) setSelectedVideo(ytID);
    else window.open(settings.showreel_url, "_blank");
  };

  const heroCards = portfolios
    .map(p => { const id = getYouTubeID(p.video_url); return id ? { key: String(p.id), ytId: id, src: `https://img.youtube.com/vi/${id}/mqdefault.jpg` } : null; })
    .filter(Boolean);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Mono:wght@300;400&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --bg:#080808;--surface:#0f0f0f;--border:rgba(255,255,255,0.1);
          --text:#f0ece4;--muted:rgba(240,236,228,0.55);
          --accent:${settings.accent_color};--am:${am};--ab:${ab};--ag:${ag};
          --white:${settings.text_color};
        }
        body{background:var(--bg);color:var(--text);cursor:none;overflow-x:hidden}
        .cr{position:fixed;top:0;left:0;width:32px;height:32px;border:1px solid var(--am);border-radius:50%;pointer-events:none;z-index:9999;will-change:transform}
        .cd{position:fixed;top:0;left:0;width:6px;height:6px;background:var(--accent);border-radius:50%;pointer-events:none;z-index:9999;will-change:transform}
        a,button{cursor:none}
        .page{opacity:0;transform:translateY(20px);transition:opacity .8s ease,transform .8s ease}
        .page.loaded{opacity:1;transform:translateY(0)}
        nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:28px 48px;display:flex;justify-content:space-between;align-items:center;background:linear-gradient(to bottom,rgba(8,8,8,.95),transparent)}
        .nl{font-family:'Cormorant Garamond',serif;font-size:18px;font-weight:300;letter-spacing:.15em;color:var(--white);text-decoration:none}
        .nl span{color:var(--accent);font-style:italic}
        .nv{display:flex;gap:36px;align-items:center}
        .nv a{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.2em;color:var(--muted);text-decoration:none;text-transform:uppercase;transition:color .2s}
        .nv a:hover{color:var(--accent)}
        .nc{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.2em;text-transform:uppercase;padding:10px 22px;border:1px solid var(--ab);color:var(--accent);background:transparent;transition:all .25s;text-decoration:none}
        .nc:hover{background:var(--accent);color:var(--bg)}
        
        .hero{min-height:100vh;display:flex;flex-direction:row;align-items:center;padding:130px 48px 80px;position:relative;overflow:hidden}
        .hbg{position:absolute;inset:0;z-index:0;background:radial-gradient(ellipse 80% 60% at 70% 40%,var(--ag) 0%,transparent 70%),radial-gradient(ellipse 40% 40% at 20% 80%,var(--ag) 0%,transparent 60%)}
        .hl{position:absolute;top:0;left:48px;width:1px;height:40%;background:linear-gradient(to bottom,transparent,var(--border))}
        .hcontent{display:flex;flex-direction:column;justify-content:center;flex:0 0 auto;width:clamp(340px,40%,520px);position:relative;z-index:2}
        .he{font-family:'DM Mono',monospace;font-size:11px;letter-spacing:.3em;color:var(--accent);text-transform:uppercase;margin-bottom:28px}
        .ht{font-family:'Cormorant Garamond',serif;font-weight:300;font-size:clamp(70px,9vw,148px);line-height:.9;letter-spacing:-.02em;color:var(--white)}
        .ht em{font-style:italic;color:var(--accent)}
        .hd{font-family:'DM Mono',monospace;font-size:12px;line-height:1.9;color:var(--muted);max-width:360px;letter-spacing:.04em;margin-top:36px}
        .hcg{display:flex;gap:16px;margin-top:48px}
        .bp{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.25em;text-transform:uppercase;padding:14px 32px;background:var(--accent);color:var(--bg);border:none;transition:all .25s}
        .bp:hover{background:var(--white)}
        .bg{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.25em;text-transform:uppercase;padding:14px 32px;background:transparent;color:var(--muted);border:1px solid var(--border);transition:all .25s}
        .bg:hover:not(:disabled){border-color:var(--accent);color:var(--accent)}
        .bg:disabled{opacity:.3}
        .hs{display:flex;align-items:center;gap:14px;font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.3em;color:var(--muted);text-transform:uppercase;writing-mode:vertical-rl;position:absolute;right:48px;bottom:80px}
        .sl{width:1px;height:60px;background:linear-gradient(to bottom,var(--accent),transparent);animation:sla 2s ease-in-out infinite}
        @keyframes sla{0%,100%{opacity:.3;transform:scaleY(1)}50%{opacity:1;transform:scaleY(1.3)}}
        
        .ws{padding:120px 48px}
        .sh{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:64px;padding-bottom:24px;border-bottom:1px solid var(--border)}
        .slb{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.3em;color:var(--accent);text-transform:uppercase;margin-bottom:10px}
        .st{font-family:'Cormorant Garamond',serif;font-weight:300;font-size:56px;line-height:1;color:var(--white);letter-spacing:-.02em}
        .st em{font-style:italic;color:var(--accent)}
        .sc{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.2em;color:var(--muted)}
        .fb{display:flex;gap:4px;margin-bottom:48px;flex-wrap:wrap}
        .fb button{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.2em;text-transform:uppercase;padding:8px 20px;background:transparent;color:var(--muted);border:1px solid transparent;transition:all .2s}
        .fb button:hover{color:var(--text);border-color:var(--border)}
        .fb button.active{color:var(--bg);background:var(--accent);border-color:var(--accent)}
        .wg{display:grid;grid-template-columns:repeat(12,1fr);grid-auto-flow:dense;gap:2px}
        .wi{position:relative;overflow:hidden;background:var(--surface);cursor:none;min-height:0}
        .wt{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .7s cubic-bezier(.25,.46,.45,.94),opacity .4s;opacity:.55}
        .wi:hover .wt{transform:scale(1.06);opacity:.85}
        .r1-big{grid-column:1/9;grid-row:span 2}
        .r1-banner{grid-column:9/13;aspect-ratio:64/27}
        .r-norm{grid-column:span 3;aspect-ratio:16/9}
        .r3-banner{grid-column:1/5;aspect-ratio:64/27}
        .r3-big{grid-column:5/13;grid-row:span 2}
        .wo{position:absolute;inset:0;background:linear-gradient(to top,rgba(8,8,8,.9) 0%,transparent 50%);opacity:0;transition:opacity .4s;display:flex;align-items:flex-end;padding:28px}
        .wi:hover .wo{opacity:1}
        .wc{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.3em;color:var(--accent);text-transform:uppercase;margin-bottom:6px}
        .wn{font-family:'Cormorant Garamond',serif;font-weight:400;font-size:26px;color:var(--white);letter-spacing:-.01em}
        .wp{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:52px;height:52px;border:1px solid var(--am);border-radius:50%;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .3s,transform .3s}
        .wp svg{fill:var(--accent);margin-left:4px}
        .wi:hover .wp{opacity:1;transform:translate(-50%,-50%) scale(1.1)}
        .wnum{position:absolute;top:16px;left:16px;font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.15em;color:var(--am);z-index:2}
        
        /* ── CSS TAMBAHAN UNTUK ABOUT SECTION ── */
        .as { padding: 120px 48px; border-top: 1px solid var(--border); display: flex; justify-content: center; }
        .ac { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; max-width: 1200px; width: 100%; align-items: center; }
        .ai { position: relative; aspect-ratio: 3/4; border-radius: 16px; overflow: hidden; background: var(--surface); }
        .ai img { width: 100%; height: 100%; object-fit: cover; opacity: 0.8; filter: grayscale(20%); transition: all 0.5s; }
        .ai:hover img { filter: grayscale(0%); opacity: 1; transform: scale(1.03); }
        .at-sub { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.3em; color: var(--accent); text-transform: uppercase; margin-bottom: 20px; }
        .at-title { font-family: 'Cormorant Garamond', serif; font-weight: 300; font-size: 56px; line-height: 1; color: var(--white); letter-spacing: -0.02em; margin-bottom: 32px; }
        .at-title em { font-style: italic; color: var(--accent); }
        .at-desc { font-family: 'DM Mono', monospace; font-size: 12px; line-height: 1.9; color: var(--muted); letter-spacing: 0.04em; margin-bottom: 48px; white-space: pre-line; }
        .as-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 48px; }
        .stat-val { font-family: 'Cormorant Garamond', serif; font-size: 42px; color: var(--white); line-height: 1; margin-bottom: 8px; }
        .stat-lbl { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--muted); }
        .as-skills { display: flex; flex-wrap: wrap; gap: 12px; }
        .skill-tag { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; padding: 8px 16px; border: 1px solid var(--border); color: var(--text); border-radius: 4px; transition: all 0.2s; }
        .skill-tag:hover { color: var(--bg); background: var(--accent); border-color: var(--accent); }

        .mb{position:fixed;inset:0;z-index:200;background:rgba(4,4,4,.97);display:flex;align-items:center;justify-content:center;padding:40px;animation:fi .3s ease}
        @keyframes fi{from{opacity:0}to{opacity:1}}
        .mi{width:100%;max-width:1000px;animation:si .35s cubic-bezier(.34,1.56,.64,1)}
        @keyframes si{from{transform:scale(.93);opacity:0}to{transform:scale(1);opacity:1}}
        .mt{display:flex;justify-content:flex-end;margin-bottom:16px}
        .mc{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.3em;text-transform:uppercase;color:var(--muted);background:none;border:none;transition:color .2s}
        .mc:hover{color:var(--accent)}
        .mv{position:relative;aspect-ratio:16/9;background:#000}
        .mv iframe{position:absolute;inset:0;width:100%;height:100%;border:none}
        footer{padding:60px 48px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:20px}
        .fc{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.15em;color:var(--muted)}
        .fs{display:flex;gap:24px;flex-wrap:wrap}
        .fs a{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.2em;color:var(--muted);text-decoration:none;text-transform:uppercase;transition:color .2s}
        .fs a:hover{color:var(--accent)}
        
        @media(max-width:768px){
          nav{padding:24px}
          .hero{padding:100px 24px 220px;flex-direction:column;align-items:flex-start;min-height:0;overflow:hidden}
          .hcontent{width:100%;min-width:unset}
          .ht{font-size:clamp(52px,14vw,80px)}
          .hcg{margin-top:28px;gap:12px}
          .bp,.bg{padding:12px 22px;font-size:9px}
          .ws{padding:80px 24px}
          .wg{grid-template-columns:1fr}
          .r1-big,.r1-banner,.r-norm,.r3-banner,.r3-big{grid-column:1/-1;grid-row:span 1;aspect-ratio:16/9}
          .as { padding: 80px 24px; }
          .ac { grid-template-columns: 1fr; gap: 48px; }
          .at-title { font-size: 42px; }
          .as-stats { grid-template-columns: repeat(2, 1fr); }
          footer{padding:40px 24px;flex-direction:column;text-align:center}.nv{display:none}.hs{display:none}
        }
      `}</style>

      <div ref={cursorRef} className="cr" />
      <div ref={cursorDotRef} className="cd" />

      <div className={`page ${loaded ? "loaded" : ""}`}>
        <nav>
          <a href="/" className="nl">Migi <span>Gustian</span></a>
          <div className="nv">
            <a href="#works">Works</a>
            <a href="#about">About</a>
            <a href="mailto:migi@email.com" className="nc">Get in Touch</a>
          </div>
        </nav>

        <section className="hero">
          <div className="hbg" />
          <div className="hl" />

          {heroCards.length > 0 && (
            <BackgroundCardStack cards={heroCards} paused={!!selectedVideo} />
          )}

          <div className="hcontent">
            <div className="he">Motion Designer</div>
            <h1 className="ht">Migi<br /><em>Gustian</em><br />Works</h1>
            <p className="hd">{settings.about_text}</p>
            <div className="hcg">
              <button className="bp" onClick={() => document.getElementById("works")?.scrollIntoView({ behavior: "smooth" })}>View Works</button>
              <button className="bg" onClick={handleShowReel} disabled={!settings.showreel_url}>Show Reel</button>
            </div>
          </div>

          {heroCards.length > 0 && (
            <HeroCardStack cards={heroCards} onCardClick={setSelectedVideo} paused={!!selectedVideo} isMobileOverride={isMobile} />
          )}

          <div className="hs"><div className="sl" />Scroll</div>
        </section>

        <section className="ws" id="works">
          <div className="sh">
            <div>
              <p className="slb">Selected Works</p>
              <h2 className="st">Portfolio <em>&</em> Projects</h2>
            </div>
            <span className="sc">{String(filtered.length).padStart(2, "0")} works</span>
          </div>
          <div className="fb">
            {categories.map(cat => (
              <button key={cat} className={activeFilter === cat ? "active" : ""} onClick={() => setActiveFilter(cat)}>{cat}</button>
            ))}
          </div>
          <div className="wg">
            {filtered.map((item, i) => {
              const ytID = getYouTubeID(item.video_url);
              return (
                <div key={item.id} className={getGridClass(i)} onClick={() => setSelectedVideo(ytID)}>
                  <span className="wnum">{String(i + 1).padStart(2, "0")}</span>
                  {ytID && <img src={`https://img.youtube.com/vi/${ytID}/maxresdefault.jpg`} alt={item.title} className="wt" />}
                  <div className="wo">
                    <div><p className="wc">{item.category}</p><h3 className="wn">{item.title}</h3></div>
                  </div>
                  <div className="wp"><svg width="14" height="16" viewBox="0 0 14 16"><path d="M0 0L14 8L0 16V0Z" /></svg></div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── BAGIAN ABOUT SECTION BARU ── */}
        <section className="as" id="about">
          <div className="ac">
            <div className="ai">
              {settings.about_photo_url ? (
                <img src={settings.about_photo_url} alt={settings.about_name} />
              ) : (
                <div style={{ width: "100%", height: "100%", background: "var(--surface)" }} />
              )}
            </div>
            <div className="at">
              <p className="at-sub">Behind The Motion</p>
              <h2 className="at-title">Hello, I'm <em>{settings.about_name}</em>.</h2>
              <p className="at-sub" style={{ marginBottom: "24px", color: "var(--text)" }}>{settings.about_role}</p>
              <p className="at-desc">{settings.about_text}</p>

              {/* Looping Stats JSON dari Supabase */}
              {settings.about_stats && settings.about_stats.length > 0 && (
                <div className="as-stats">
                  {settings.about_stats.map((stat, i) => (
                    <div key={i}>
                      <div className="stat-val">{stat.value}</div>
                      <div className="stat-lbl">{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Looping Skills dari Supabase */}
              {settings.about_skills && settings.about_skills.length > 0 && (
                <div className="as-skills">
                  {settings.about_skills.map((skill, i) => (
                    <div key={i} className="skill-tag">{skill}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ID 'about' udah dipindah ke section atas, footer sekarang bebas */}
        <footer>
          <p className="fc">© {new Date().getFullYear()} Migi Gustian. All rights reserved.</p>
          <div className="fs">
            {settings.socials.length > 0
              ? settings.socials.map((s, i) => <a key={i} href={s.url} target="_blank" rel="noopener noreferrer">{s.platform}</a>)
              : <><a href="#">YouTube</a><a href="#">Instagram</a><a href="#">Behance</a></>
            }
          </div>
        </footer>
      </div>

      {selectedVideo && (
        <div className="mb" onClick={() => setSelectedVideo(null)}>
          <div className="mi" onClick={e => e.stopPropagation()}>
            <div className="mt"><button className="mc" onClick={() => setSelectedVideo(null)}>Close ✕</button></div>
            <div className="mv">
              <iframe src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`} allow="autoplay; encrypted-media" allowFullScreen />
            </div>
          </div>
        </div>
      )}
    </>
  );
}