"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
    { x: -250, y: 0, z: 0, rotateZ: 15, rotateX: -20, scale: 0.45, opacity: 0.20, zIndex: 4 },
    { x: 0, y: 30, z: -50, rotateZ: 5, rotateX: -15, scale: 0.4, opacity: 0.12, zIndex: 3 },
    { x: 250, y: 50, z: -100, rotateZ: -5, rotateX: -10, scale: 0.35, opacity: 0.08, zIndex: 2 },
    { x: 500, y: 60, z: -150, rotateZ: -15, rotateX: -5, scale: 0.3, opacity: 0.03, zIndex: 1 },
  ];
  const POSITIONS_BG_MOBILE = [
    { x: -120, y: 0, z: 0, rotateZ: 15, rotateX: -20, scale: 0.45, opacity: 0.55, zIndex: 4 },
    { x: 0, y: 15, z: -40, rotateZ: 5, rotateX: -15, scale: 0.4, opacity: 0.35, zIndex: 3 },
    { x: 120, y: 25, z: -80, rotateZ: -5, rotateX: -10, scale: 0.35, opacity: 0.20, zIndex: 2 },
    { x: 230, y: 30, z: -120, rotateZ: -15, rotateX: -5, scale: 0.3, opacity: 0.08, zIndex: 1 },
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
                boxShadow: "0 10px 20px rgba(0,0,0,0.5)",
                willChange: "transform, opacity",
                transformOrigin: "center center",
                zIndex: pos.zIndex,
              }}
              initial={{ y: -100, x: -500, z: -300, rotateZ: 30, rotateX: -30, scale: 0.2, opacity: 0 }}
              animate={{ x: pos.x, y: pos.y, z: pos.z, rotateZ: pos.rotateZ, rotateX: pos.rotateX, scale: pos.scale, opacity: pos.opacity }}
              exit={{ y: 100, x: 700, z: 100, rotateZ: -30, rotateX: 10, scale: 0.5, opacity: 0, zIndex: 5 }}
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
    { x: -140, y: -20, z: 0, rotateZ: -6, rotateX: 15, rotateY: 0, scale: 1, opacity: 1, zIndex: 40 },
    { x: 80, y: 20, z: -80, rotateZ: 2, rotateX: 32, rotateY: -15, scale: 0.9, opacity: 1, zIndex: 30 },
    { x: 280, y: 90, z: -160, rotateZ: 10, rotateX: 48, rotateY: -30, scale: 0.8, opacity: 1, zIndex: 20 },
    { x: 460, y: 220, z: -240, rotateZ: 18, rotateX: 65, rotateY: -45, scale: 0.7, opacity: 1, zIndex: 10 },
  ];

  const POSITIONS_MOBILE = [
    { x: -60, y: -10, z: 0, rotateZ: -6, rotateX: 15, rotateY: 0, scale: 1, opacity: 1, zIndex: 40 },
    { x: 30, y: 10, z: -60, rotateZ: 2, rotateX: 32, rotateY: -15, scale: 0.9, opacity: 1, zIndex: 30 },
    { x: 110, y: 45, z: -120, rotateZ: 10, rotateX: 48, rotateY: -30, scale: 0.8, opacity: 1, zIndex: 20 },
    { x: 185, y: 110, z: -180, rotateZ: 18, rotateX: 65, rotateY: -45, scale: 0.7, opacity: 1, zIndex: 10 },
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
              className={`hero-card-layer hero-card-depth-${depth}`}
              onClick={isTop ? () => onCardClick(card.ytId) : undefined}
              style={{
                position: "absolute",
                left: 0, right: 0, margin: "0 auto",
                width: CARD_W, height: CARD_H,
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.15)",
                overflow: "hidden",
                cursor: isTop ? "pointer" : "default",
                transformOrigin: "center center",
                zIndex: pos.zIndex,
                pointerEvents: "auto",
                boxShadow: "none",
              }}
              initial={{ y: 200, x: isMobile ? 300 : 600, z: -400, rotateZ: 35, rotateX: 45, rotateY: -60, scale: 0.6, opacity: 0 }}
              animate={{ x: pos.x, y: pos.y, z: pos.z, rotateZ: pos.rotateZ, rotateX: pos.rotateX, rotateY: pos.rotateY, scale: pos.scale, opacity: pos.opacity }}
              exit={{ y: -250, x: isMobile ? -200 : -500, z: 200, rotateZ: -20, rotateX: 5, rotateY: 20, scale: 1.1, opacity: 0, zIndex: 50 }}
              transition={{ duration: 1.5, ease: [0.32, 0.72, 0, 1] }}
              whileHover={isTop ? {
                y: pos.y - 12, z: pos.z + 40,
                scale: 1.03, rotateZ: -1, rotateX: 10, rotateY: 0,
                boxShadow: "none",
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

export default function HomeClient({ initialPortfolios, initialSettings }) {
  const [portfolios, setPortfolios] = useState(initialPortfolios);
  const [settings, setSettings] = useState(initialSettings || DEFAULT);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loaded, setLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const cursorRef = useRef(null);
  const cursorDotRef = useRef(null);
  const rafRef = useRef(null);
  const parallaxRafRef = useRef(null);

  useEffect(() => {
    setLoaded(true);

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);

    const move = (e) => {
      const x = e.clientX, y = e.clientY;
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

  useEffect(() => {
    const CARD_SPEEDS = [0.06, 0.13, 0.22, 0.34];
    const handleParallax = () => {
      cancelAnimationFrame(parallaxRafRef.current);
      parallaxRafRef.current = requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        CARD_SPEEDS.forEach((speed, depth) => {
          document.querySelectorAll(`.hero-card-depth-${depth}`).forEach(card => {
            card.style.marginTop = `${scrollY * speed}px`;
          });
        });
        const hbg = document.querySelector('.hbg');
        if (hbg) hbg.style.transform = `translateY(${scrollY * 0.40}px)`;
        const wpSvg = document.querySelector('.wp-svg');
        if (wpSvg) wpSvg.style.transform = `translateY(${scrollY * 0.25}px)`;
        const hcontent = document.querySelector('.hcontent');
        if (hcontent) hcontent.style.transform = `translateY(${scrollY * 0.12}px)`;
      });
    };
    window.addEventListener('scroll', handleParallax, { passive: true });
    return () => { window.removeEventListener('scroll', handleParallax); cancelAnimationFrame(parallaxRafRef.current); };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const timer = setTimeout(() => {
      const items = document.querySelectorAll('.wi');
      const observer = new IntersectionObserver(
        (entries) => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('revealed'); observer.unobserve(entry.target); } }),
        { threshold: 0.10, rootMargin: '0px 0px -40px 0px' }
      );
      items.forEach((el, i) => {
        el.classList.remove('revealed');
        el.style.transitionDelay = `${(i % 4) * 80}ms`;
        observer.observe(el);
      });
      return () => observer.disconnect();
    }, 50);
    return () => clearTimeout(timer);
  }, [loaded, activeFilter]);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = () => setMenuOpen(false);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [menuOpen]);

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

  const navLinks = [
    { label: "Works", href: "#works" },
    { label: "About", href: "#about" },
    { label: "Waitlist", href: "/waitlist" },
  ];

  return (
    <>
      <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Mono:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
      :root{
        --bg:#080808;--surface:#0f0f0f;--border:rgba(255,255,255,0.1);
        --text:#f0ece4;--muted:rgba(240,236,228,0.55);
        --accent:${settings.accent_color};--am:${am};--ab:${ab};--ag:${ag};
        --white:${settings.text_color};
      }
      html,body{max-width:100vw;overflow-x:hidden;width:100%;position:relative;}
      body{background:var(--bg);color:var(--text);cursor:none;}
      .cr{position:fixed;top:0;left:0;width:32px;height:32px;border:1px solid var(--am);border-radius:50%;pointer-events:none;z-index:9999;will-change:transform}
      .cd{position:fixed;top:0;left:0;width:6px;height:6px;background:var(--accent);border-radius:50%;pointer-events:none;z-index:9999;will-change:transform}
      a,button{cursor:none}
      .page{opacity:0;transform:translateY(20px);transition:opacity .8s ease,transform .8s ease}
      .page.loaded{opacity:1;transform:translateY(0)}

      /* ── NAV ── */
      nav{
        position:fixed;top:0;left:0;right:0;z-index:100;
        padding:28px 48px;
        display:flex;justify-content:space-between;align-items:center;
        background:linear-gradient(to bottom,rgba(8,8,8,.95),transparent);
      }
      .nl{font-family:'Cormorant Garamond',serif;font-size:18px;font-weight:300;letter-spacing:.15em;color:var(--white);text-decoration:none;flex-shrink:0}
      .nl span{color:var(--accent);font-style:italic}
      .nv{display:flex;gap:36px;align-items:center}
      .nv a{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.2em;color:var(--muted);text-decoration:none;text-transform:uppercase;transition:color .2s}
      .nv a:hover,.nv a.active{color:var(--accent)}
      .nc{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.2em;text-transform:uppercase;padding:10px 22px;border:1px solid var(--ab);color:var(--accent);background:transparent;transition:all .25s;text-decoration:none}
      .nc:hover{background:var(--accent);color:var(--bg)}

      /* ── HAMBURGER ── */
      .ham{
        display:none;flex-direction:column;gap:5px;background:none;border:none;padding:10px;z-index:110;
      }
      .ham span{width:22px;height:1px;background:var(--muted);transition:all .3s ease-in-out}
      .ham.open span:nth-child(1){transform:translateY(6px) rotate(45deg);background:#fff}
      .ham.open span:nth-child(2){opacity:0}
      .ham.open span:nth-child(3){transform:translateY(-6px) rotate(-45deg);background:#fff}

      /* ── MOBILE OVERLAY MENU ── */
      .mob-menu{
        position:fixed;inset:0;z-index:105;background:rgba(8,8,8,0.98);
        display:flex;flex-direction:column;justify-content:center;align-items:center;gap:32px;
        opacity:0;pointer-events:none;transition:opacity .4s ease-in-out;
      }
      .mob-menu.open{opacity:1;pointer-events:auto}
      .mob-menu a{
        font-family:'Cormorant Garamond',serif;font-size:32px;font-weight:300;color:var(--muted);
        text-decoration:none;letter-spacing:.05em;transition:color .3s;
      }
      .mob-menu a:hover,.mob-menu a.accent{color:var(--accent)}
      .mob-menu-sub{
        position:absolute;bottom:40px;font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.15em;color:rgba(255,255,255,0.15);text-transform:uppercase;
      }

      /* ── HERO ── */
      .hero{
        min-height:100vh;height:100vh;position:relative;
        display:flex;align-items:center;
        padding:0 80px;background:#080808;
        overflow:hidden;
      }
      .hbg{position:absolute;inset:0;background:radial-gradient(ellipse 60% 60% at 75% 50%,rgba(var(--accent-rgb),0.075) 0%,transparent 80%);z-index:0;will-change:transform}
      .hl{position:absolute;left:10%;top:0;width:1px;height:100%;background:linear-gradient(to bottom,transparent,rgba(255,255,255,0.03) 30%,rgba(255,255,255,0.03) 70%,transparent);z-index:0}
      
      .wp-svg{position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;opacity:.65;will-change:transform}
      .wp-path{fill:none;stroke:rgba(255,255,255,0.015);stroke-width:1;stroke-dasharray:10 5}

      .hero-stack-wrapper{
        position:absolute;right:0;top:0;width:55%;height:100%;
        display:flex;align-items:center;justify-content:center;
        z-index:1;
      }
      @media(max-width:768px){
        .hero-stack-wrapper{
          position:relative;width:100%;height:220px;margin-top:40px;order:2;right:unset;top:unset;
        }
      }

      .hcontent{width:45%;position:relative;z-index:10;pointer-events:auto;will-change:transform}
      .he{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.35em;text-transform:uppercase;color:var(--accent);margin-bottom:20px;opacity:.9}
      .ht{font-family:'Cormorant Garamond',serif;font-weight:300;font-size:clamp(64px,7.5vw,96px);line-height:.95;color:var(--white);letter-spacing:-.03em}
      .ht em{font-style:italic;color:var(--accent);font-weight:300}
      .hd{font-family:'DM Mono',monospace;font-size:11px;line-height:1.9;color:var(--muted);margin-top:28px;max-width:440px;letter-spacing:.04em;font-weight:300}
      .hcg{margin-top:44px;display:flex;gap:20px;align-items:center}
      .bp{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.2em;text-transform:uppercase;padding:14px 28px;background:var(--accent);color:#080808;border:none;transition:all .25s;font-weight:500}
      .bp:hover{background:#fff}
      .bg{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.2em;text-transform:uppercase;padding:14px 28px;background:transparent;border:1px solid var(--border);color:var(--text);transition:all .25s}
      .bg:hover:not(:disabled){border-color:var(--accent);color:var(--accent)}
      .bg:disabled{opacity:0.3;cursor:not-allowed}

      .hs{position:absolute;bottom:48px;left:80px;font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.25em;text-transform:uppercase;color:var(--muted);display:flex;align-items:center;gap:16px;z-index:10}
      .sl{width:40px;height:1px;background:var(--border)}

      /* ── WORKS ── */
      .ws{padding:120px 80px;position:relative;z-index:10;background:#080808}
      .sh{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:60px;border-bottom:1px solid var(--border);padding-bottom:28px}
      .slb{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.3em;text-transform:uppercase;color:var(--accent);margin-bottom:12px}
      .st{font-family:'Cormorant Garamond',serif;font-weight:300;font-size:48px;line-height:1;color:var(--white);letter-spacing:-.02em}
      .st em{font-style:italic;color:var(--accent)}
      .sc{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.15em;color:var(--muted);text-transform:uppercase}

      .fb{display:flex;gap:12px;margin-bottom:48px;flex-wrap:wrap}
      .fb button{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.15em;text-transform:uppercase;padding:8px 18px;background:transparent;border:1px solid var(--border);color:var(--muted);transition:all .2s}
      .fb button:hover,.fb button.active{border-color:var(--accent);color:var(--accent);background:var(--ag)}

      .wg{display:grid;grid-template-columns:repeat(4,1fr);grid-auto-flow:dense;gap:20px}
      .wi{position:relative;background:var(--surface);border:1px solid var(--border);overflow:hidden;opacity:0;transform:translateY(30px);transition:opacity .8s cubic-bezier(0.16, 1, 0.3, 1),transform .8s cubic-bezier(0.16, 1, 0.3, 1);display:flex;flex-direction:column;justify-content:flex-end}
      .wi.revealed{opacity:1;transform:translateY(0)}
      .wi::after{content:'';position:absolute;inset:0;background:linear-gradient(to top,rgba(8,8,8,0.85) 0%,rgba(8,8,8,0.2) 50%,transparent 100%);z-index:2;opacity:.8;transition:opacity .3s}
      .wi:hover::after{opacity:.95}

      .r1-big{grid-column:span 2;grid-row:span 2;aspect-ratio:1/1}
      .r1-banner{grid-column:span 2;grid-row:span 1;aspect-ratio:21/9}
      .r-norm{grid-column:span 1;grid-row:span 1;aspect-ratio:3/4}
      .r3-banner{grid-column:span 2;grid-row:span 1;aspect-ratio:21/9}
      .r3-big{grid-column:span 2;grid-row:span 2;aspect-ratio:1/1}

      .wt{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:1;opacity:.65;filter:grayscale(15%) contrast(1.05);transition:all .6s cubic-bezier(0.16, 1, 0.3, 1)}
      .wi:hover .wt{transform:scale(1.03) rotate(0.5deg);opacity:.85;filter:grayscale(0%) contrast(1)}

      .wo{position:relative;z-index:3;padding:32px;pointer-events:none}
      .wc{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.25em;text-transform:uppercase;color:var(--accent);margin-bottom:10px}
      .wn{font-family:'Cormorant Garamond',serif;font-weight:300;font-size:28px;line-height:1.1;color:#fff;letter-spacing:-.01em}
      .wn em{font-style:italic;color:var(--muted);font-weight:300}
      .wp{position:absolute;top:32px;right:32px;z-index:3;width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;opacity:0;transform:scale(0.8);transition:all .3s;pointer-events:none}
      .wp svg{fill:var(--accent);transition:transform .3s}
      .wi:hover .wp{opacity:1;transform:scale(1)}
      .wi:hover .wp svg{transform:translateX(1px)}

      /* ── ABOUT ── */
      .as{padding:120px 80px;background:#0d0d0d;border-top:1px solid var(--border);position:relative;z-index:10}
      .ac{display:grid;grid-template-columns:1fr 1.2fr;gap:80px;max-width:1200px;margin:0 auto;align-items:center}
      .ai{position:relative;aspect-ratio:3/4;border-radius:16px;overflow:hidden;background:var(--surface);max-width:320px;margin:0 auto}
      .ai img{width:100%;height:100%;object-fit:cover;opacity:.8;filter:grayscale(20%);transition:all .5s}
      .ai:hover img{filter:grayscale(0%);opacity:1;transform:scale(1.03)}
      .at-sub{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.3em;color:var(--accent);text-transform:uppercase;margin-bottom:20px}
      .at-title{font-family:'Cormorant Garamond',serif;font-weight:300;font-size:56px;line-height:1;color:var(--white);letter-spacing:-.02em;margin-bottom:32px}
      .at-title em{font-style:italic;color:var(--accent)}
      .at-desc{font-family:'DM Mono',monospace;font-size:12px;line-height:1.9;color:var(--muted);letter-spacing:.04em;margin-bottom:48px;white-space:pre-line}
      .as-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-bottom:48px}
      .stat-val{font-family:'Cormorant Garamond',serif;font-size:42px;color:var(--white);line-height:1;margin-bottom:8px}
      .stat-lbl{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted)}
      .as-skills{display:flex;flex-wrap:wrap;gap:12px}
      .skill-tag{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.2em;text-transform:uppercase;padding:8px 16px;border:1px solid var(--border);color:var(--text);border-radius:4px;transition:all .2s}
      .skill-tag:hover{color:var(--bg);background:var(--accent);border-color:var(--accent)}

      /* ── MODAL ── */
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

      /* ── MOBILE ── */
      @media(max-width:768px){
        nav{padding:20px 24px}
        .nv{display:none}
        .ham{display:flex}
        .hero{padding:100px 24px 220px;flex-direction:column;align-items:flex-start;min-height:0;overflow:visible}
        .hcontent{width:100%;min-width:unset}
        .ht{font-size:clamp(52px,14vw,80px)}
        .hcg{margin-top:28px;gap:12px}
        .bp,.bg{padding:12px 22px;font-size:9px}
        .ws{padding:80px 24px}
        .wg{grid-template-columns:1fr}
        .r1-big,.r1-banner,.r-norm,.r3-banner,.r3-big{grid-column:1/-1;grid-row:span 1;aspect-ratio:16/9}
        .as{padding:80px 24px}
        .ac{grid-template-columns:1fr;gap:48px}
        .at-title{font-size:42px}
        .as-stats{grid-template-columns:repeat(2,1fr)}
        footer{padding:40px 24px;flex-direction:column;text-align:center}
        .hs{display:none}
        .mb{padding:16px}
      }
      `}</style>

      <div ref={cursorRef} className="cr" />
      <div ref={cursorDotRef} className="cd" />

      {/* Mobile overlay menu */}
      <div className={`mob-menu ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(false)}>
        {navLinks.map(l => (
          <a
            key={l.label}
            href={l.href}
            className={l.href === "/waitlist" ? "accent" : ""}
            onClick={() => setMenuOpen(false)}
          >{l.label}</a>
        ))}
        <span className="mob-menu-sub">© {new Date().getFullYear()} Migi Gustian</span>
      </div>

      <div className={`page ${loaded ? "loaded" : ""}`}>
        <nav>
          <a href="/" className="nl">Migi <span>Gustian</span></a>
          <div className="nv">
            {navLinks.map(l => (
              <a key={l.label} href={l.href} className={l.href === "/waitlist" ? "active" : ""}>{l.label}</a>
            ))}
            <a href="mailto:migi@email.com" className="nc">Get in Touch</a>
          </div>
          {/* Hamburger — mobile only */}
          <button
            className={`ham ${menuOpen ? "open" : ""}`}
            onClick={e => { e.stopPropagation(); setMenuOpen(o => !o); }}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>
        </nav>

        <section className="hero">
          <div className="hbg" />
          <div className="hl" />
          <svg className="wp-svg" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice">
            <path className="wp-path" d="M-50,450 C250,450 300,700 600,600 C850,500 750,200 950,250 C1150,300 1200,600 1500,450" />
          </svg>

          <div className="hero-stack-wrapper">
            {heroCards.length > 0 && <BackgroundCardStack cards={heroCards} paused={!!selectedVideo} />}
            <div style={{ position: "absolute", left: isMobile ? "20%" : "40%", top: "-10%", width: isMobile ? "120%" : "80%", height: "130%", pointerEvents: "none", zIndex: 2, overflow: "hidden" }}>
              {[
                { left: "30%", width: "180px", rotate: "25deg", opacity: 0.13, delay: "0s" },
                { left: "44%", width: "80px", rotate: "25deg", opacity: 0.09, delay: "0.4s" },
                { left: "52%", width: "320px", rotate: "25deg", opacity: 0.07, delay: "0.8s" },
              ].map((ray, i) => (
                <div key={i} style={{
                  position: "absolute", top: 0, left: ray.left, width: ray.width, height: "100%",
                  background: `linear-gradient(to bottom, rgba(${rgb || "212,180,80"}, ${ray.opacity}), transparent 70%)`,
                  transform: `rotate(${ray.rotate})`, transformOrigin: "top center",
                  animation: `rayPulse 4s ease-in-out ${ray.delay} infinite`,
                  borderRadius: "50%", filter: "blur(18px)",
                }} />
              ))}
            </div>
            {heroCards.length > 0 && <HeroCardStack cards={heroCards} onCardClick={setSelectedVideo} paused={!!selectedVideo} isMobileOverride={isMobile} />}
          </div>

          <div className="hcontent">
            <div className="he">Motion Designer</div>
            <h1 className="ht">Migi<br /><em>Gustian</em><br />Works</h1>
            <p className="hd">{settings.about_text}</p>
            <div className="hcg">
              <button className="bp" onClick={() => document.getElementById("works")?.scrollIntoView({ behavior: "smooth" })}>View Works</button>
              <button className="bg" onClick={() => window.location.href = '/waitlist'}>Waitlist</button>
              <button className="bg" onClick={handleShowReel} disabled={!settings.showreel_url}>Show Reel</button>
            </div>
          </div>

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
                <div key={item.id} className={getGridClass(i)} onClick={() => setSelectedVideo(ytID)}
                  style={(i % 14 === 0 && i + 2 >= filtered.length) ? { aspectRatio: '64/27' } : {}}>
                  <span className="wnum">{String(i + 1).padStart(2, "0")}</span>
                  {ytID && (
                    <img src={`https://img.youtube.com/vi/${ytID}/maxresdefault.jpg`} alt={item.title} className="wt"
                      onLoad={e => { if (e.currentTarget.naturalWidth === 120) e.currentTarget.src = `https://img.youtube.com/vi/${ytID}/hqdefault.jpg`; }} />
                  )}
                  <div className="wo">
                    <div>
                      <p className="wc">{item.category}</p>
                      <h3 className="wn">
                        {(() => {
                          if (!item.title) return 'Untitled';
                          const t = item.title.trim();
                          if ((t.startsWith("【") && t.includes("】")) || (t.startsWith("[") && t.includes("]"))) {
                            const cc = t.startsWith("【") ? "】" : "]";
                            const idx = t.indexOf(cc);
                            return <>{t.substring(0, idx + 1)}{t.substring(idx + 1) && <em>{t.substring(idx + 1)}</em>}</>;
                          }
                          const w = t.split(" ");
                          return <>{w.slice(0, 2).join(" ")}{w.length > 2 && <em>{' ' + w.slice(2).join(" ")}</em>}</>;
                        })()}
                      </h3>
                    </div>
                  </div>
                  <div className="wp"><svg width="14" height="16" viewBox="0 0 14 16"><path d="M0 0L14 8L0 16V0Z" /></svg></div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="as" id="about">
          <div className="ac">
            <div className="ai">
              {settings.about_photo_url
                ? <img src={settings.about_photo_url} alt={settings.about_name} />
                : <div style={{ width: "100%", height: "100%", background: "var(--surface)" }} />}
            </div>
            <div className="at">
              <p className="at-sub">Behind The Motion</p>
              <h2 className="at-title">Hello, I'm <em>{settings.about_name}</em>.</h2>
              <p className="at-sub" style={{ marginBottom: "24px", color: "var(--text)" }}>{settings.about_role}</p>
              <p className="at-desc">{settings.about_text}</p>
              {settings.about_stats?.length > 0 && (
                <div className="as-stats">
                  {settings.about_stats.map((stat, i) => (
                    <div key={i}><div className="stat-val">{stat.value}</div><div className="stat-lbl">{stat.label}</div></div>
                  ))}
                </div>
              )}
              {settings.about_skills?.length > 0 && (
                <div className="as-skills">
                  {settings.about_skills.map((skill, i) => <div key={i} className="skill-tag">{skill}</div>)}
                </div>
              )}
            </div>
          </div>
        </section>

        <footer>
          <p className="fc">© {new Date().getFullYear()} Migi Gustian. All rights reserved.</p>
          <div className="fs">
            {settings.socials.length > 0
              ? settings.socials.map((s, i) => <a key={i} href={s.url} target="_blank" rel="noopener noreferrer">{s.platform}</a>)
              : <><a href="#">YouTube</a><a href="#">Instagram</a><a href="#">Behance</a></>}
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
