"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

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

const FILTER_TAGS = ["All", "MV", "PV", "Lyric Video", "Visualizer", "Short Edit"];

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

export default function WaitlistClient({ initialCommissions, initialSettings }) {
    const [commissions, setCommissions] = useState(initialCommissions);
    const [settings, setSettings] = useState(initialSettings || { accent_color: "#d4c4a8", text_color: "#ffffff" });
    const [loaded, setLoaded] = useState(false);
    
    // Search, Filter & Limit state
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTag, setSelectedTag] = useState("All");
    const [showAllCompleted, setShowAllCompleted] = useState(false);

    // Form & Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        client_name: "",
        contact_info: "",
        project_type: "MV",
        budget_range: "$200 - $500",
        description: "",
        website_hp: "" // Honeypot
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitResult, setSubmitResult] = useState(null);

    useEffect(() => {
        setLoaded(true);
    }, []);

    const rgb = hexToRgb(settings.accent_color);
    const accentRgb = rgb || "212,196,168";
    const accentColor = settings.accent_color || "#d4c4a8";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitResult(null);

        try {
            const res = await fetch("/api/waitlist/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (!res.ok) {
                setSubmitResult({ success: false, error: data.error || "Failed to submit request." });
            } else {
                setSubmitResult({ success: true, message: data.message });
                setFormData({
                    client_name: "",
                    contact_info: "",
                    project_type: "MV",
                    budget_range: "$200 - $500",
                    description: "",
                    website_hp: ""
                });
            }
        } catch (err) {
            setSubmitResult({ success: false, error: err.message });
        } finally {
            setSubmitting(false);
        }
    };

    // Filter items based on Search Query and Selected Tag
    const filterItems = (items) => {
        return items.filter(item => {
            const matchesSearch = searchQuery.trim() === "" ||
                (item.client_name && item.client_name.toLowerCase().includes(searchQuery.toLowerCase()));

            const allTags = [
                ...(item.payment_tags || []),
                ...(item.progress_tags || []),
                ...(item.type_tags || []),
            ];

            const matchesTag = selectedTag === "All" || allTags.includes(selectedTag);

            return matchesSearch && matchesTag;
        });
    };

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Mono:wght@300;400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
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
        .nl{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:300;letter-spacing:.15em;color:var(--white);text-decoration:none}
        .nl span{color:var(--accent);font-style:italic}
        .nv{display:flex;gap:36px;align-items:center}
        .nv a{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.2em;color:var(--muted);text-decoration:none;text-transform:uppercase;transition:color .2s}
        .nv a:hover{color:var(--accent)}

        .header{padding:52px 48px 24px;text-align:center;}
        .h-sub{font-size:9px;letter-spacing:.35em;text-transform:uppercase;color:var(--accent);margin-bottom:14px;opacity:.9}
        .h-title{font-family:'Cormorant Garamond',serif;font-size:58px;font-weight:300;line-height:1;color:var(--white);letter-spacing:-.02em}
        .h-title em{font-style:italic;color:var(--accent)}
        .h-desc{font-size:11px;color:var(--muted);margin-top:16px;max-width:460px;margin-inline:auto;line-height:1.9;letter-spacing:.04em}

        .req-btn-container{text-align:center;margin-bottom:32px}
        .req-btn{
            background: linear-gradient(135deg, var(--accent) 0%, #b89d74 100%);
            color:#000000;
            border:none;
            padding:14px 32px;
            border-radius:999px;
            font-size:11px;
            font-family:'DM Mono',monospace;
            font-weight:600;
            letter-spacing:.15em;
            text-transform:uppercase;
            cursor:pointer;
            box-shadow:0 10px 30px rgba(212,196,168,0.25);
            transition:all .3s ease;
        }
        .req-btn:hover{
            transform:translateY(-2px);
            box-shadow:0 14px 40px rgba(212,196,168,0.4);
        }

        /* Search & Filter Bar */
        .filter-bar {
            max-width: 960px;
            margin: 0 auto 36px;
            padding: 0 48px;
            display: flex;
            gap: 16px;
            align-items: center;
            flex-wrap: wrap;
            justify-content: space-between;
            width: 100%;
        }
        .search-input-wrap {
            position: relative;
            flex: 1;
            min-width: 240px;
        }
        .search-input {
            width: 100%;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid var(--border);
            border-radius: 999px;
            padding: 10px 18px 10px 38px;
            color: var(--text);
            font-family: 'DM Mono', monospace;
            font-size: 11px;
            outline: none;
            transition: all 0.2s ease;
        }
        .search-input:focus {
            border-color: rgba(var(--accent-rgb), 0.5);
            background: rgba(var(--accent-rgb), 0.04);
        }
        .search-icon {
            position: absolute;
            left: 14px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--muted);
            font-size: 12px;
            pointer-events: none;
        }
        .filter-pills {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }
        .filter-pill {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid var(--border);
            border-radius: 999px;
            padding: 6px 14px;
            font-size: 9px;
            color: var(--muted);
            font-family: 'DM Mono', monospace;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .filter-pill:hover {
            color: var(--text);
            border-color: rgba(255, 255, 255, 0.2);
        }
        .filter-pill.active {
            background: var(--accent);
            color: #080808;
            border-color: var(--accent);
            font-weight: 600;
        }

        .stats{display:flex;justify-content:center;gap:48px;padding:0 48px 36px}
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

        .c-body{padding:16px;display:flex;flex-direction:column;gap:10px;max-height:520px;overflow-y:auto;}
        .c-body::-webkit-scrollbar { width: 5px; }
        .c-body::-webkit-scrollbar-track { background: transparent; }
        .c-body::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.12); border-radius: 10px; }
        .c-body::-webkit-scrollbar-thumb:hover { background: rgba(var(--accent-rgb), 0.4); }

        .c-card{background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:16px 16px 14px;position:relative;overflow:hidden;transition:border-color .2s,transform .2s,box-shadow .2s;cursor:default;flex-shrink:0;}
        .c-card:hover{border-color:rgba(255,255,255,0.12);transform:translateY(-1px);box-shadow:0 8px 24px rgba(0,0,0,0.4)}
        .cc-tags{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:10px}
        .cc-name{font-family:'Cormorant Garamond',serif;font-size:21px;font-weight:300;color:var(--white);line-height:1.2;letter-spacing:.01em}

        .c-empty{font-size:10px;letter-spacing:.1em;color:rgba(255,255,255,0.15);text-align:center;padding:24px 0;font-style:italic}

        .show-more-btn {
            width: calc(100% - 32px);
            margin: 0 16px 16px;
            padding: 10px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px dashed var(--border);
            border-radius: 8px;
            color: var(--accent);
            font-family: 'DM Mono', monospace;
            font-size: 10px;
            letter-spacing: 0.1em;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .show-more-btn:hover {
            background: rgba(var(--accent-rgb), 0.1);
            border-color: rgba(var(--accent-rgb), 0.3);
        }

        /* Modal Overlay */
        .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(12px);
            z-index: 999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
        }
        .modal-card {
            background: #111111;
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 20px;
            width: 100%;
            max-width: 520px;
            padding: 32px;
            position: relative;
            box-shadow: 0 24px 60px rgba(0, 0, 0, 0.8);
        }
        .modal-input {
            width: 100%;
            background: #080808;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 12px 14px;
            color: #ffffff;
            font-family: 'DM Mono', monospace;
            font-size: 12px;
            margin-top: 6px;
            outline: none;
            transition: border-color 0.2s;
        }
        .modal-input:focus {
            border-color: var(--accent);
        }
        .modal-label {
            font-size: 10px;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            color: var(--muted);
            margin-top: 14px;
            display: block;
        }

        @media(max-width:900px){
          nav{padding:20px 24px}
          .nv{display:none}
          .header{padding:36px 24px 24px}
          .h-title{font-size:42px}
          .filter-bar{padding:0 24px 24px;flex-direction:column;align-items:stretch}
          .stats{gap:24px;padding:0 24px 24px}
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
                    <p className="h-sub">Commission Queue & Request</p>
                    <h1 className="h-title">Current <em>Waitlist</em></h1>
                    <p className="h-desc">An overview of ongoing commissions and active project slots. Click below to request a new waitlist slot!</p>
                </div>

                <div className="req-btn-container">
                    <button onClick={() => setIsModalOpen(true)} className="req-btn">
                        ✨ Request Waitlist Slot
                    </button>
                </div>

                {/* Filter & Search Bar */}
                <div className="filter-bar">
                    <div className="search-input-wrap">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search client name or project..."
                            className="search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="filter-pills">
                        {FILTER_TAGS.map(tag => (
                            <button
                                key={tag}
                                className={`filter-pill ${selectedTag === tag ? "active" : ""}`}
                                onClick={() => setSelectedTag(tag)}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
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
                        const rawItems = commissions.filter(c => (c.column || "Waitlist") === col.key);
                        const filteredItems = filterItems(rawItems);

                        // Limit completed column items unless expanded
                        const displayLimit = col.key === "Completed" && !showAllCompleted ? 6 : filteredItems.length;
                        const visibleItems = filteredItems.slice(0, displayLimit);
                        const hasMoreCompleted = col.key === "Completed" && filteredItems.length > 6;

                        return (
                            <div key={col.key} className="col">
                                <div className="c-head">
                                    <div className="c-head-left">
                                        <h3 style={{ color: col.accent }}>{col.label}</h3>
                                        <span className="c-sub">{col.sub}</span>
                                    </div>
                                    <span className="c-count">{rawItems.length}</span>
                                </div>
                                <div className="c-body">
                                    <AnimatePresence>
                                        {visibleItems.length === 0 && <p className="c-empty">No entries found.</p>}
                                        {visibleItems.map((item, i) => {
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

                                {hasMoreCompleted && (
                                    <button
                                        className="show-more-btn"
                                        onClick={() => setShowAllCompleted(!showAllCompleted)}
                                    >
                                        {showAllCompleted ? "Collapse List ▲" : `+ Show All (${filteredItems.length}) ▼`}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Waitlist Request Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            className="modal-card"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", color: accentColor }}>
                                    Request Waitlist Slot
                                </h3>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    style={{ background: "none", border: "none", color: "#888", fontSize: "20px", cursor: "pointer" }}
                                >
                                    ✕
                                </button>
                            </div>

                            {submitResult && (
                                <div style={{
                                    padding: "12px 16px",
                                    borderRadius: "8px",
                                    marginBottom: "16px",
                                    fontSize: "11px",
                                    background: submitResult.success ? "rgba(74, 230, 184, 0.1)" : "rgba(230, 74, 74, 0.1)",
                                    border: `1px solid ${submitResult.success ? "rgba(74, 230, 184, 0.3)" : "rgba(230, 74, 74, 0.3)"}`,
                                    color: submitResult.success ? "#4ae6b8" : "#e64a4a"
                                }}>
                                    {submitResult.success ? submitResult.message : submitResult.error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                {/* Honeypot field - invisible to humans */}
                                <input
                                    type="text"
                                    name="website_hp"
                                    value={formData.website_hp}
                                    onChange={(e) => setFormData({ ...formData, website_hp: e.target.value })}
                                    style={{ display: "none" }}
                                    tabIndex={-1}
                                    autoComplete="off"
                                />

                                <label className="modal-label">Name / Twitter Handle *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. @vtuber_name or Client Name"
                                    className="modal-input"
                                    value={formData.client_name}
                                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                                />

                                <label className="modal-label">Contact (Twitter DM / Email) *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. email@domain.com or @twitter"
                                    className="modal-input"
                                    value={formData.contact_info}
                                    onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                                />

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                    <div>
                                        <label className="modal-label">Project Type *</label>
                                        <select
                                            className="modal-input"
                                            value={formData.project_type}
                                            onChange={(e) => setFormData({ ...formData, project_type: e.target.value })}
                                        >
                                            <option value="MV">Music Video (MV)</option>
                                            <option value="PV">Promotional Video (PV)</option>
                                            <option value="Lyric Video">Lyric Video</option>
                                            <option value="Visualizer">Visualizer</option>
                                            <option value="Debut / Stinger">Debut / Stinger</option>
                                            <option value="Short Edit">Short Edit</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="modal-label">Estimated Budget</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. $300 - $500 or Flexible"
                                            className="modal-input"
                                            value={formData.budget_range}
                                            onChange={(e) => setFormData({ ...formData, budget_range: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Preset Quick Budget Chips */}
                                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
                                    {["$200 - $500", "$500 - $1000", "$1000+", "Flexible"].map(preset => (
                                        <button
                                            key={preset}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, budget_range: preset })}
                                            style={{
                                                background: formData.budget_range === preset ? accentColor : "rgba(255,255,255,0.05)",
                                                color: formData.budget_range === preset ? "#000" : "#aaa",
                                                border: "1px solid rgba(255,255,255,0.1)",
                                                borderRadius: "4px",
                                                padding: "3px 8px",
                                                fontSize: "9px",
                                                cursor: "pointer",
                                                fontFamily: "'DM Mono', monospace"
                                            }}
                                        >
                                            {preset}
                                        </button>
                                    ))}
                                </div>

                                <label className="modal-label">Project Description / Notes</label>
                                <textarea
                                    rows="3"
                                    placeholder="Tell me about your song, deadline, visual references, or specific animation ideas..."
                                    className="modal-input"
                                    style={{ resize: "vertical" }}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />

                                <p style={{ fontSize: "10px", color: "var(--muted)", marginTop: "12px", fontStyle: "italic" }}>
                                    ℹ️ Submitted requests will be reviewed and approved by Migi Gustian before appearing on the public queue.
                                </p>

                                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "20px" }}>
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        style={{
                                            padding: "10px 20px",
                                            borderRadius: "8px",
                                            background: "rgba(255, 255, 255, 0.05)",
                                            color: "#fff",
                                            border: "1px solid rgba(255,255,255,0.1)",
                                            fontSize: "11px",
                                            cursor: "pointer"
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        style={{
                                            padding: "10px 24px",
                                            borderRadius: "8px",
                                            background: accentColor,
                                            color: "#000",
                                            border: "none",
                                            fontSize: "11px",
                                            fontWeight: 600,
                                            cursor: submitting ? "not-allowed" : "pointer"
                                        }}
                                    >
                                        {submitting ? "Sending..." : "Submit Request"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
