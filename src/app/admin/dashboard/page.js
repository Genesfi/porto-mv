"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function getYouTubeID(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
}

function hexToRgb(hex) {
    if (!hex) return null;
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return r ? parseInt(r[1], 16) + "," + parseInt(r[2], 16) + "," + parseInt(r[3], 16) : null;
}

const TABS = [
    { id: "list", label: "All Works", icon: "▦" },
    { id: "waitlist", label: "Waitlist", icon: "☰" },
    { id: "settings", label: "Settings", icon: "⚙" },
];

const SOCIAL_ICONS = {
    YouTube: "▶", Instagram: "◉", Twitter: "𝕏", TikTok: "♪",
    Behance: "Bē", LinkedIn: "in", Facebook: "f", Discord: "⌘",
    Threads: "@", VGen: "🌐",
};
const SOCIAL_OPTIONS = Object.keys(SOCIAL_ICONS);

const CATEGORY_SUGGESTIONS = [
    "MV", "Simple MV", "Semi Complex", "Complex MV",
    "Kinetic", "Edit", "Lyric Video", "Visualizer", "Short Film", "Debut", "Trailer",
];

// ── BOARD COLUMNS ──
const BOARD_COLUMNS = [
    { key: "Waitlist", label: "Waitlist", color: "#e6c84a" },
    { key: "In Progress", label: "In Progress", color: "#a06ee6" },
    { key: "Completed", label: "Completed", color: "#4ae6b8" },
];

// ── TAG OPTIONS (multi-select) ──
const PAYMENT_OPTIONS = ["Pending", "Down Payment", "Full Payment"];
const PROGRESS_OPTIONS = ["Waiting", "In Progress", "Revision", "Done"];
const TYPE_OPTIONS = ["MV", "PV", "Lyric Video", "Short Edit", "Visualizer", "Lore", "Other"];

// ── TAG COLORS ──
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

function TagPill({ label }) {
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

function MultiCheckField({ label, options, selected, onChange }) {
    const toggle = (opt) => {
        if (selected.includes(opt)) onChange(selected.filter(x => x !== opt));
        else onChange([...selected, opt]);
    };
    return (
        <div className="field">
            <label>{label}</label>
            <div className="cat-chips-row">
                {options.map(opt => (
                    <button
                        key={opt}
                        type="button"
                        className={`cat-chip ${selected.includes(opt) ? "active" : ""}`}
                        onMouseDown={e => { e.preventDefault(); toggle(opt); }}
                    >{opt}</button>
                ))}
            </div>
        </div>
    );
}

function CategoryInput({ value, onChange }) {
    const inputVal = value || "";
    const filtered = inputVal.trim()
        ? CATEGORY_SUGGESTIONS.filter(s => s.toLowerCase().includes(inputVal.toLowerCase()))
        : CATEGORY_SUGGESTIONS;
    return (
        <div>
            <input type="text" value={inputVal} onChange={e => onChange(e.target.value)} placeholder="Type or pick a category..." autoComplete="off" />
            <div className="cat-chips-row">
                {filtered.map(s => (
                    <button key={s} type="button" className={`cat-chip ${inputVal === s ? "active" : ""}`}
                        onMouseDown={e => { e.preventDefault(); onChange(s); }}>{s}</button>
                ))}
            </div>
        </div>
    );
}

function AddWorkModal({ onClose, onSave }) {
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [videoUrl, setVideoUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [isFetchingTitle, setIsFetchingTitle] = useState(false);

    const handleUrlChange = async (e) => {
        const url = e.target.value;
        setVideoUrl(url);
        if (url.includes("youtube.com/watch") || url.includes("youtu.be/")) {
            setIsFetchingTitle(true);
            try {
                const res = await fetch(`https://noembed.com/embed?url=${url}`);
                const data = await res.json();
                if (data.title) setTitle(data.title);
            } catch { }
            setIsFetchingTitle(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onSave({ title, category, video_url: videoUrl });
        setLoading(false);
    };

    return (
        <div className="modal-bg" onClick={onClose}>
            <div className="modal-box" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
                <h2 className="modal-title">New <em>Work</em></h2>
                <p style={{ fontSize: 9, letterSpacing: "0.1em", color: "var(--muted)", marginBottom: 24 }}>Tambah karya baru ke portfolio.</p>
                <form onSubmit={handleSubmit}>
                    <div className="field">
                        <label>YouTube URL</label>
                        <input type="url" value={videoUrl} onChange={handleUrlChange} placeholder="https://youtube.com/watch?v=..." required />
                        {isFetchingTitle && <p className="field-hint">Fetching title...</p>}
                    </div>
                    <div className="field">
                        <label>Video Title</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Judul video..." required />
                    </div>
                    <div className="field">
                        <label>Category</label>
                        <CategoryInput value={category} onChange={setCategory} />
                    </div>
                    <div className="modal-btns">
                        <button type="button" className="btn-mcancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-msave" disabled={loading}>{loading ? "Saving..." : "Add to Portfolio"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── ADD COMMISSION MODAL ──
function AddCommissionModal({ onClose, onSave, defaultColumn }) {
    const [clientName, setClientName] = useState("");
    const [column, setColumn] = useState(defaultColumn || "Waitlist");
    const [paymentTags, setPaymentTags] = useState([]);
    const [progressTags, setProgressTags] = useState([]);
    const [typeTags, setTypeTags] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onSave({
            client_name: clientName,
            column,
            payment_tags: paymentTags,
            progress_tags: progressTags,
            type_tags: typeTags,
        });
        setLoading(false);
    };

    return (
        <div className="modal-bg" onClick={onClose}>
            <div className="modal-box" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
                <h2 className="modal-title">New <em>Commission</em></h2>
                <p style={{ fontSize: 9, letterSpacing: "0.1em", color: "var(--muted)", marginBottom: 24 }}>Tambah antrean komisi baru.</p>
                <form onSubmit={handleSubmit}>
                    <div className="field">
                        <label>Client Name</label>
                        <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Nama klien..." required />
                    </div>
                    <div className="field">
                        <label>Column / Stage</label>
                        <div className="cat-chips-row">
                            {BOARD_COLUMNS.map(col => (
                                <button key={col.key} type="button"
                                    className={`cat-chip ${column === col.key ? "active" : ""}`}
                                    onMouseDown={e => { e.preventDefault(); setColumn(col.key); }}
                                    style={column === col.key ? { background: col.color, color: "#080808", borderColor: col.color } : {}}
                                >{col.label}</button>
                            ))}
                        </div>
                    </div>
                    <MultiCheckField label="Payment Tags" options={PAYMENT_OPTIONS} selected={paymentTags} onChange={setPaymentTags} />
                    <MultiCheckField label="Progress Tags" options={PROGRESS_OPTIONS} selected={progressTags} onChange={setProgressTags} />
                    <MultiCheckField label="Type Tags" options={TYPE_OPTIONS} selected={typeTags} onChange={setTypeTags} />
                    <div className="modal-btns">
                        <button type="button" className="btn-mcancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-msave" disabled={loading}>{loading ? "Saving..." : "Add Commission"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── EDIT COMMISSION MODAL ──
function EditCommissionModal({ item, onClose, onSave }) {
    const [clientName, setClientName] = useState(item.client_name || "");
    const [column, setColumn] = useState(item.column || "Waitlist");
    const [paymentTags, setPaymentTags] = useState(item.payment_tags || []);
    const [progressTags, setProgressTags] = useState(item.progress_tags || []);
    const [typeTags, setTypeTags] = useState(item.type_tags || []);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onSave({ id: item.id, client_name: clientName, column, payment_tags: paymentTags, progress_tags: progressTags, type_tags: typeTags });
        setLoading(false);
    };

    return (
        <div className="modal-bg" onClick={onClose}>
            <div className="modal-box" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
                <h2 className="modal-title">Edit <em>Commission</em></h2>
                <form onSubmit={handleSubmit}>
                    <div className="field">
                        <label>Client Name</label>
                        <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} required />
                    </div>
                    <div className="field">
                        <label>Column / Stage</label>
                        <div className="cat-chips-row">
                            {BOARD_COLUMNS.map(col => (
                                <button key={col.key} type="button"
                                    className={`cat-chip ${column === col.key ? "active" : ""}`}
                                    onMouseDown={e => { e.preventDefault(); setColumn(col.key); }}
                                    style={column === col.key ? { background: col.color, color: "#080808", borderColor: col.color } : {}}
                                >{col.label}</button>
                            ))}
                        </div>
                    </div>
                    <MultiCheckField label="Payment Tags" options={PAYMENT_OPTIONS} selected={paymentTags} onChange={setPaymentTags} />
                    <MultiCheckField label="Progress Tags" options={PROGRESS_OPTIONS} selected={progressTags} onChange={setProgressTags} />
                    <MultiCheckField label="Type Tags" options={TYPE_OPTIONS} selected={typeTags} onChange={setTypeTags} />
                    <div className="modal-btns">
                        <button type="button" className="btn-mcancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-msave" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function AdminDashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [authChecked, setAuthChecked] = useState(false);
    const [portfolios, setPortfolios] = useState([]);
    const [editItem, setEditItem] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const dragItem = useRef(null);
    const dragOver = useRef(null);
    const [dragging, setDragging] = useState(null);
    const [activeTab, setActiveTab] = useState("list");
    const [commissions, setCommissions] = useState([]);
    const [showAddCommissionModal, setShowAddCommissionModal] = useState(false);
    const [addCommissionDefaultColumn, setAddCommissionDefaultColumn] = useState("Waitlist");
    const [editCommissionItem, setEditCommissionItem] = useState(null);
    const [deleteCommissionConfirm, setDeleteCommissionConfirm] = useState(null);
    const [draggedCommissionId, setDraggedCommissionId] = useState(null);
    const [notification, setNotification] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [settings, setSettings] = useState({
        accent_color: "#d4c4a8", text_color: "#ffffff",
        about_text: "", showreel_url: "", socials: [],
        about_photo_url: "", about_name: "", about_role: "",
        about_skills: "", about_stats: "",
    });
    const [settingsLoading, setSettingsLoading] = useState(false);
    const [newSocialPlatform, setNewSocialPlatform] = useState("YouTube");
    const [newSocialUrl, setNewSocialUrl] = useState("");

    const rgb = hexToRgb(settings.accent_color);
    const accentRgb = rgb || "212,196,168";
    const accentColor = settings.accent_color || "#d4c4a8";

    const fetchPortfolios = async () => {
        const { data } = await supabase.from("portfolios").select("*")
            .order("sort_order", { ascending: true }).order("id", { ascending: false });
        if (data) setPortfolios(data);
    };

    const fetchSettings = async () => {
        const { data } = await supabase.from("site_settings").select("*").eq("id", 1).single();
        if (data) {
            setSettings({
                accent_color: data.accent_color || "#d4c4a8",
                text_color: data.text_color || "#ffffff",
                about_text: data.about_text || "",
                showreel_url: data.showreel_url || "",
                socials: data.socials || [],
                about_photo_url: data.about_photo_url || "",
                about_name: data.about_name || "",
                about_role: data.about_role || "",
                about_skills: data.about_skills || "",
                about_stats: data.about_stats || "",
            });
        }
    };

    const fetchCommissions = async () => {
        const { data } = await supabase.from("commissions").select("*")
            .order("sort_order", { ascending: true }).order("created_at", { ascending: false });
        if (data) setCommissions(data);
    };

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) { router.replace("/admin"); return; }
            setUser(session.user);
            setAuthChecked(true);
            fetchPortfolios();
            fetchSettings();
            fetchCommissions();
        };
        checkSession();
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
            if (!s) router.replace("/admin");
        });
        return () => subscription.unsubscribe();
    }, [router]);

    const showNotif = (msg, type = "success") => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleUploadPhoto = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsUploading(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `profile_${Date.now()}.${fileExt}`;
        try {
            const { data, error } = await supabase.storage.from('portfolio-images').upload(fileName, file);
            if (error) throw error;
            const { data: publicUrlData } = supabase.storage.from('portfolio-images').getPublicUrl(fileName);
            setSettings(prev => ({ ...prev, about_photo_url: publicUrlData.publicUrl }));
            showNotif("Foto berhasil di-upload!");
        } catch (error) {
            showNotif("Gagal upload foto: " + error.message, "error");
        } finally {
            setIsUploading(false);
        }
    };

    // ── COMMISSION CRUD ──
    const handleAddCommission = async ({ client_name, column, payment_tags, progress_tags, type_tags }) => {
        const colItems = commissions.filter(c => c.column === column);
        const maxOrder = colItems.length > 0 ? Math.max(...colItems.map(c => c.sort_order || 0)) : 0;
        const { error } = await supabase.from("commissions").insert([{
            client_name, column,
            payment_tags: payment_tags || [],
            progress_tags: progress_tags || [],
            type_tags: type_tags || [],
            sort_order: maxOrder + 1,
        }]);
        if (error) { showNotif("Gagal menyimpan: " + error.message, "error"); }
        else { fetchCommissions(); showNotif("Antrean berhasil ditambahkan!"); setShowAddCommissionModal(false); }
    };

    const handleEditCommissionSave = async ({ id, client_name, column, payment_tags, progress_tags, type_tags }) => {
        const { error } = await supabase.from("commissions")
            .update({ client_name, column, payment_tags, progress_tags, type_tags }).eq("id", id);
        if (error) { showNotif("Gagal update: " + error.message, "error"); }
        else { fetchCommissions(); showNotif("Antrean berhasil diupdate!"); setEditCommissionItem(null); }
    };

    const handleDeleteCommission = async (id) => {
        const { error } = await supabase.from("commissions").delete().eq("id", id);
        if (!error) { fetchCommissions(); showNotif("Antrean dihapus."); }
        setDeleteCommissionConfirm(null);
    };

    // ── DRAG & DROP: move commission between columns ──
    const handleDragStartCommission = (e, id) => {
        setDraggedCommissionId(id);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOverCommission = (e) => { e.preventDefault(); };

    const handleDropCommission = async (e, newColumn) => {
        e.preventDefault();
        if (!draggedCommissionId) return;
        const item = commissions.find(c => c.id === draggedCommissionId);
        if (!item || item.column === newColumn) { setDraggedCommissionId(null); return; }
        setCommissions(prev => prev.map(c => c.id === draggedCommissionId ? { ...c, column: newColumn } : c));
        const { error } = await supabase.from("commissions").update({ column: newColumn }).eq("id", draggedCommissionId);
        if (error) { showNotif("Gagal: " + error.message, "error"); fetchCommissions(); }
        else { showNotif(`Dipindah ke ${newColumn}`); }
        setDraggedCommissionId(null);
    };

    // ── PORTFOLIO CRUD ──
    const handleAddWork = async ({ title, category, video_url }) => {
        const maxOrder = portfolios.length > 0 ? Math.max(...portfolios.map(p => p.sort_order || 0)) : 0;
        const { error } = await supabase.from("portfolios").insert([{ title, category, video_url, sort_order: maxOrder + 1 }]);
        if (error) { showNotif("Gagal menyimpan: " + error.message, "error"); }
        else { fetchPortfolios(); showNotif("Karya berhasil ditambahkan!"); setShowAddModal(false); }
    };

    const handleDelete = async (id) => {
        const { error } = await supabase.from("portfolios").delete().eq("id", id);
        if (!error) { fetchPortfolios(); showNotif("Karya dihapus."); }
        setDeleteConfirm(null);
    };

    const handleEditSave = async () => {
        const { error } = await supabase.from("portfolios")
            .update({ title: editItem.title, category: editItem.category, video_url: editItem.video_url })
            .eq("id", editItem.id);
        if (error) { showNotif("Gagal update: " + error.message, "error"); }
        else { fetchPortfolios(); showNotif("Karya berhasil diupdate!"); setEditItem(null); }
    };

    const handleDragStart = (e, index) => { dragItem.current = index; setDragging(index); e.dataTransfer.effectAllowed = "move"; };
    const handleDragEnter = (e, index) => {
        dragOver.current = index;
        if (dragItem.current === index) return;
        const newList = [...portfolios];
        const dragged = newList.splice(dragItem.current, 1)[0];
        newList.splice(index, 0, dragged);
        dragItem.current = index;
        setPortfolios(newList);
    };
    const handleDragEnd = async () => {
        setDragging(null);
        const updates = portfolios.map((p, i) => supabase.from("portfolios").update({ sort_order: i + 1 }).eq("id", p.id));
        await Promise.all(updates);
        showNotif("Urutan berhasil disimpan!");
    };

    const handleSettingsSave = async () => {
        setSettingsLoading(true);
        const { error } = await supabase.from("site_settings").upsert({ id: 1, ...settings }, { onConflict: "id" });
        if (error) { showNotif("Gagal simpan settings: " + error.message, "error"); }
        else { showNotif("Settings berhasil disimpan!"); }
        setSettingsLoading(false);
    };

    const addSocial = () => {
        if (!newSocialUrl.trim()) return;
        setSettings(s => ({ ...s, socials: [...s.socials, { platform: newSocialPlatform, url: newSocialUrl.trim() }] }));
        setNewSocialUrl("");
    };
    const removeSocial = (i) => setSettings(s => ({ ...s, socials: s.socials.filter((_, idx) => idx !== i) }));
    const updateSocial = (i, field, val) => {
        setSettings(s => { const arr = [...s.socials]; arr[i] = { ...arr[i], [field]: val }; return { ...s, socials: arr }; });
    };
    const handleLogout = async () => { await supabase.auth.signOut(); router.push("/admin"); };

    if (!authChecked) return (
        <div style={{ minHeight: "100vh", background: "#080808", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 28, height: 28, border: "1px solid rgba(212,196,168,0.2)", borderTopColor: "#d4c4a8", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    const totalCount = portfolios.length;
    const categories = Array.from(new Set(portfolios.map(p => p.category).filter(Boolean)));

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=DM+Mono:wght@300;400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #080808; --surface: #0d0d0d; --surface2: #141414;
          --border: rgba(255,255,255,0.08); --text: #f0ece4;
          --muted: rgba(240,236,228,0.45);
          --accent: ${accentColor};
          --accent-rgb: ${accentRgb};
          --error: #e07070;
        }
        body { background: var(--bg); color: var(--text); font-family: 'DM Mono', monospace; overflow: hidden; }
        button { cursor: pointer; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .dash { min-height: 100vh; height: 100vh; display: flex; overflow: hidden; }
        .sidebar { width: 210px; flex-shrink: 0; background: var(--surface); border-right: 1px solid var(--border); display: flex; flex-direction: column; height: 100vh; overflow-y: auto; }
        .sidebar-logo { padding: 28px 22px 24px; border-bottom: 1px solid var(--border); }
        .sidebar-logo h1 { font-family: 'Cormorant Garamond', serif; font-weight: 300; font-size: 20px; letter-spacing: 0.1em; color: #fff; }
        .sidebar-logo h1 em { font-style: italic; color: var(--accent); }
        .sidebar-logo p { font-size: 8px; letter-spacing: 0.3em; text-transform: uppercase; color: var(--muted); margin-top: 3px; }
        .sidebar-nav { padding: 20px 0; flex: 1; }
        .s-label { font-size: 8px; letter-spacing: 0.3em; text-transform: uppercase; color: rgba(212,196,168,0.3); padding: 0 22px; margin-bottom: 10px; }
        .s-item { display: flex; align-items: center; gap: 10px; padding: 10px 22px; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); background: none; border: none; width: 100%; text-align: left; transition: all 0.2s; position: relative; }
        .s-item:hover { color: var(--text); background: rgba(255,255,255,0.03); }
        .s-item.active { color: var(--accent); background: rgba(var(--accent-rgb),0.06); }
        .s-item.active::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 2px; background: var(--accent); }
        .s-icon { width: 16px; text-align: center; font-size: 12px; }
        .sidebar-stats { padding: 18px 22px; border-top: 1px solid var(--border); }
        .st-row { display: flex; justify-content: space-between; margin-bottom: 7px; }
        .st-l { font-size: 9px; letter-spacing: 0.1em; color: var(--muted); }
        .st-v { font-size: 9px; color: var(--accent); }
        .sidebar-user { padding: 16px 22px; border-top: 1px solid var(--border); }
        .u-email { font-size: 9px; letter-spacing: 0.04em; color: var(--muted); margin-bottom: 10px; word-break: break-all; }
        .btn-out { width: 100%; padding: 8px; font-family: 'DM Mono', monospace; font-size: 8px; letter-spacing: 0.2em; text-transform: uppercase; background: transparent; border: 1px solid rgba(255,255,255,0.08); color: var(--muted); transition: all 0.2s; }
        .btn-out:hover { border-color: var(--error); color: var(--error); }

        .main { flex: 1; overflow-y: auto; overflow-x: hidden; min-width: 0; display: flex; flex-direction: column; }
        .topbar { padding: 18px 28px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; background: rgba(8,8,8,0.96); backdrop-filter: blur(8px); z-index: 10; gap: 12px; flex-wrap: wrap; flex-shrink: 0; }
        .pg-title { font-family: 'Cormorant Garamond', serif; font-weight: 300; font-size: 28px; letter-spacing: -0.01em; color: #fff; }
        .pg-title em { font-style: italic; color: var(--accent); }
        .topbar-r { display: flex; gap: 10px; align-items: center; flex-shrink: 0; flex-wrap: wrap; }
        .badge { font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; padding: 6px 12px; border: 1px solid rgba(var(--accent-rgb),0.2); color: var(--accent); white-space: nowrap; }
        .view-site { font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(var(--accent-rgb),0.35); text-decoration: none; transition: color 0.2s; white-space: nowrap; }
        .view-site:hover { color: var(--accent); }
        .btn-add-work { padding: 8px 18px; background: var(--accent); color: #080808; font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; border: none; transition: background 0.2s; white-space: nowrap; border-radius: 4px; }
        .btn-add-work:hover { background: #fff; }

        .content { padding: 28px; flex: 1; display: flex; flex-direction: column; }

        /* FIELDS */
        .field { margin-bottom: 20px; }
        .field label { display: block; font-size: 9px; letter-spacing: 0.25em; text-transform: uppercase; color: var(--muted); margin-bottom: 7px; }
        .field input, .field select, .field textarea { width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); color: var(--text); font-family: 'DM Mono', monospace; font-size: 12px; padding: 11px 13px; outline: none; transition: border-color 0.2s, background 0.2s; letter-spacing: 0.04em; resize: none; border-radius: 6px; }
        .field input:focus, .field select:focus, .field textarea:focus { border-color: rgba(var(--accent-rgb),0.4); background: rgba(var(--accent-rgb),0.02); }
        .field input::placeholder, .field textarea::placeholder { color: rgba(240,236,228,0.15); }
        .field select option { background: #111; }
        .field-hint { font-size: 9px; letter-spacing: 0.05em; color: var(--accent); margin-top: 5px; }

        /* CHIPS */
        .cat-chips-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
        .cat-chip { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; padding: 5px 12px; background: rgba(var(--accent-rgb),0.06); border: 1px solid rgba(var(--accent-rgb),0.15); color: var(--muted); transition: all 0.15s; white-space: nowrap; border-radius: 4px; }
        .cat-chip:hover { background: rgba(var(--accent-rgb),0.15); color: var(--accent); border-color: rgba(var(--accent-rgb),0.35); }
        .cat-chip.active { background: var(--accent); color: #080808; border-color: var(--accent); }

        /* CARDS */
        .drag-hint { font-size: 9px; letter-spacing: 0.1em; color: var(--muted); margin-bottom: 16px; flex-shrink: 0; }
        .drag-hint span { color: var(--accent); }
        .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; }
        .card { background: var(--surface); border: 1px solid var(--border); overflow: hidden; transition: border-color 0.2s, opacity 0.2s; position: relative; cursor: grab; border-radius: 8px; }
        .card:active { cursor: grabbing; }
        .card.dragging { opacity: 0.4; border-color: var(--accent); }
        .card:hover { border-color: rgba(var(--accent-rgb),0.25); }
        .card-thumb { aspect-ratio: 16/9; overflow: hidden; background: #0a0a0a; position: relative; }
        .card-thumb img { width: 100%; height: 100%; object-fit: cover; opacity: 0.65; transition: opacity 0.3s, transform 0.5s; }
        .card:hover .card-thumb img { opacity: 0.9; transform: scale(1.04); }
        .card-body { padding: 12px 12px 8px; }
        .card-cat { font-size: 8px; letter-spacing: 0.3em; text-transform: uppercase; color: var(--accent); margin-bottom: 3px; }
        .card-title { font-family: 'Cormorant Garamond', serif; font-weight: 400; font-size: 15px; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 8px; }
        .card-actions { display: flex; gap: 6px; padding: 0 12px 10px; }
        .btn-edit, .btn-del { flex: 1; padding: 7px; font-family: 'DM Mono', monospace; font-size: 8px; letter-spacing: 0.2em; text-transform: uppercase; border-radius: 4px; transition: all 0.2s; }
        .btn-edit { background: rgba(var(--accent-rgb),0.08); border: 1px solid rgba(var(--accent-rgb),0.2); color: var(--accent); }
        .btn-edit:hover { background: rgba(var(--accent-rgb),0.15); }
        .btn-del { background: rgba(224,112,112,0.06); border: 1px solid rgba(224,112,112,0.2); color: var(--error); }
        .btn-del:hover { background: rgba(224,112,112,0.15); }
        .drag-handle { position: absolute; top: 8px; left: 8px; background: rgba(8,8,8,0.8); padding: 4px 6px; font-size: 10px; color: rgba(var(--accent-rgb),0.5); line-height: 1; border: 1px solid rgba(255,255,255,0.06); border-radius: 4px; }
        .card-order { position: absolute; top: 8px; right: 8px; background: rgba(8,8,8,0.8); padding: 3px 7px; font-size: 8px; letter-spacing: 0.15em; color: rgba(var(--accent-rgb),0.4); border: 1px solid rgba(255,255,255,0.06); border-radius: 4px; }

        /* SETTINGS */
        .settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .settings-panel { background: var(--surface); border: 1px solid var(--border); padding: 24px; border-radius: 12px; }
        .settings-panel.full { grid-column: 1 / -1; }
        .s-panel-title { font-family: 'Cormorant Garamond', serif; font-weight: 300; font-size: 22px; color: #fff; margin-bottom: 4px; }
        .s-panel-title em { font-style: italic; color: var(--accent); }
        .s-panel-sub { font-size: 9px; letter-spacing: 0.08em; color: var(--muted); margin-bottom: 20px; }
        .color-row { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .color-preview { width: 32px; height: 32px; border: 1px solid var(--border); flex-shrink: 0; border-radius: 6px; }
        .color-input-wrap { flex: 1; }
        .color-label { font-size: 8px; letter-spacing: 0.25em; text-transform: uppercase; color: var(--muted); margin-bottom: 5px; }
        input[type="color"] { width: 100%; height: 36px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 2px 4px; cursor: pointer; border-radius: 6px; }
        .accent-live-preview { margin-top: 16px; padding: 12px 16px; background: rgba(var(--accent-rgb),0.06); border: 1px solid rgba(var(--accent-rgb),0.15); font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--accent); border-radius: 6px; }
        .social-list { margin-bottom: 20px; display: flex; flex-direction: column; gap: 8px; }
        .social-item { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); padding: 8px 12px; border-radius: 6px; }
        .social-icon { font-size: 14px; color: var(--accent); width: 20px; text-align: center; flex-shrink: 0; }
        .social-platform { font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--muted); width: 72px; flex-shrink: 0; }
        .social-edit { flex: 1; min-width: 0; background: transparent; border: none; border-bottom: 1px solid rgba(255,255,255,0.06); color: var(--text); font-family: 'DM Mono', monospace; font-size: 11px; padding: 4px 0; outline: none; letter-spacing: 0.03em; }
        .social-edit:focus { border-bottom-color: var(--accent); }
        .btn-rm { background: none; border: none; color: rgba(224,112,112,0.4); font-size: 11px; padding: 4px; transition: color 0.2s; flex-shrink: 0; }
        .btn-rm:hover { color: var(--error); }
        .add-social-row { display: flex; gap: 10px; align-items: flex-end; flex-wrap: wrap; }
        .btn-add-social { padding: 11px 18px; background: rgba(var(--accent-rgb),0.1); border: 1px solid rgba(var(--accent-rgb),0.25); color: var(--accent); font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; white-space: nowrap; transition: all 0.2s; align-self: flex-end; margin-bottom: 20px; border-radius: 6px; }
        .btn-add-social:hover { background: var(--accent); color: #080808; }
        .settings-save-row { display: flex; justify-content: flex-end; }
        .btn-settings-save { padding: 13px 40px; background: var(--accent); color: var(--bg); font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; border: none; transition: background 0.2s, transform 0.15s; border-radius: 6px; }
        .btn-settings-save:hover:not(:disabled) { background: #fff; transform: translateY(-1px); }
        .btn-settings-save:disabled { opacity: 0.45; }

        /* ── WAITLIST BOARD ── */
        .waitlist-wrapper { flex: 1; display: flex; flex-direction: column; overflow: hidden; margin: -10px -10px 0; padding: 10px; }
        .waitlist-board { display: inline-flex; gap: 16px; align-items: flex-start; height: 100%; overflow-x: auto; padding-bottom: 16px; }
        .waitlist-board::-webkit-scrollbar { height: 8px; }
        .waitlist-board::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); border-radius: 4px; }
        .waitlist-board::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }
        .waitlist-board::-webkit-scrollbar-thumb:hover { background: rgba(var(--accent-rgb),0.5); }

        .waitlist-column { width: 320px; flex-shrink: 0; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; display: flex; flex-direction: column; max-height: 100%; transition: background 0.2s, border-color 0.2s; }
        .waitlist-column.drag-over { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.15); }

        .w-col-header { padding: 16px 16px 12px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .w-col-header h3 { font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; font-weight: 600; }
        .w-col-count { font-size: 9px; color: var(--bg); padding: 2px 8px; border-radius: 12px; font-weight: bold; }

        .w-col-body { padding: 12px; display: flex; flex-direction: column; gap: 10px; overflow-y: auto; flex: 1; min-height: 50px; }
        .w-col-body::-webkit-scrollbar { width: 6px; }
        .w-col-body::-webkit-scrollbar-track { background: transparent; }
        .w-col-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }

        .w-card { background: var(--surface2); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 14px; transition: border-color 0.2s, transform 0.2s, opacity 0.2s; box-shadow: 0 4px 12px rgba(0,0,0,0.15); cursor: grab; position: relative; overflow: hidden; }
        .w-card::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 2.5px; }
        .w-card:active { cursor: grabbing; }
        .w-card.dragging { opacity: 0.45; border: 1px dashed var(--accent); transform: scale(0.98); }
        .w-card:hover:not(.dragging) { border-color: rgba(255,255,255,0.14); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.35); }

        .w-card-tags { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 10px; pointer-events: none; }
        .w-card-client { font-family: 'Cormorant Garamond', serif; font-size: 20px; color: #fff; line-height: 1.2; margin-bottom: 14px; word-wrap: break-word; pointer-events: none; }
        .w-card-footer { display: flex; justify-content: flex-end; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 10px; gap: 6px; }

        .w-actions-mini { display: flex; gap: 4px; }
        .w-btn-icon { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); color: var(--muted); padding: 5px 8px; border-radius: 4px; font-size: 10px; transition: all 0.2s; cursor: pointer; }
        .w-btn-icon:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .w-btn-icon.del:hover { background: rgba(224,112,112,0.15); color: var(--error); border-color: rgba(224,112,112,0.3); }

        .w-col-footer { padding: 4px 12px 12px; }
        .w-btn-add-card { width: 100%; padding: 10px 12px; text-align: left; background: transparent; border: none; color: var(--muted); font-family: 'DM Mono', monospace; font-size: 10px; border-radius: 6px; transition: all 0.2s; cursor: pointer; }
        .w-btn-add-card:hover { background: rgba(255,255,255,0.05); color: var(--text); }

        /* MODAL */
        .modal-bg { position: fixed; inset: 0; z-index: 200; background: rgba(4,4,4,0.92); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; padding: 20px; animation: fi 0.25s ease; overflow-y: auto; }
        @keyframes fi { from { opacity: 0 } to { opacity: 1 } }
        .modal-box { background: #0f0f0f; border: 1px solid rgba(255,255,255,0.08); padding: 28px; width: 100%; max-width: 480px; animation: si 0.3s cubic-bezier(0.34,1.56,0.64,1); border-radius: 12px; }
        @keyframes si { from { transform: scale(0.93); opacity: 0 } to { transform: scale(1); opacity: 1 } }
        .modal-title { font-family: 'Cormorant Garamond', serif; font-weight: 300; font-size: 28px; color: #fff; margin-bottom: 20px; }
        .modal-title em { font-style: italic; color: var(--accent); }
        .modal-btns { display: flex; gap: 10px; margin-top: 24px; }
        .btn-mcancel { flex: 1; padding: 11px; font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; background: transparent; border: 1px solid rgba(255,255,255,0.08); color: var(--muted); transition: all 0.2s; border-radius: 6px; }
        .btn-mcancel:hover { border-color: rgba(255,255,255,0.2); color: var(--text); }
        .btn-msave { flex: 2; padding: 11px; font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; background: var(--accent); border: none; color: #080808; transition: background 0.2s; border-radius: 6px; }
        .btn-msave:hover { background: #fff; }
        .btn-msave:disabled { opacity: 0.45; }
        .btn-mdel { flex: 2; padding: 11px; font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; background: rgba(224,112,112,0.15); border: 1px solid rgba(224,112,112,0.3); color: var(--error); transition: all 0.2s; border-radius: 6px; }
        .btn-mdel:hover { background: var(--error); color: #fff; }

        /* NOTIFICATION */
        .notif { position: fixed; bottom: 20px; right: 20px; z-index: 300; padding: 13px 22px; font-size: 10px; letter-spacing: 0.1em; border: 1px solid; animation: nfi 0.3s ease; max-width: calc(100vw - 40px); border-radius: 6px; }
        @keyframes nfi { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }
        .notif.success { background: rgba(var(--accent-rgb),0.1); border-color: rgba(var(--accent-rgb),0.3); color: var(--accent); }
        .notif.error { background: rgba(224,112,112,0.1); border-color: rgba(224,112,112,0.3); color: var(--error); }

        @media (max-width: 768px) {
          .dash { flex-direction: column; }
          .sidebar { width: 100%; height: auto; position: relative; flex-direction: row; flex-wrap: wrap; overflow-x: auto; border-right: none; border-bottom: 1px solid var(--border); }
          .sidebar-logo { padding: 14px 18px; border-bottom: none; border-right: 1px solid var(--border); flex-shrink: 0; display: flex; flex-direction: column; justify-content: center; }
          .sidebar-logo h1 { font-size: 16px; }
          .sidebar-logo p { display: none; }
          .sidebar-nav { padding: 0; display: flex; flex-direction: row; align-items: stretch; flex: 1; min-width: 0; }
          .s-label { display: none; }
          .s-item { padding: 0 18px; height: 52px; font-size: 9px; justify-content: center; border-bottom: 2px solid transparent; flex-shrink: 0; }
          .s-item.active { border-bottom-color: var(--accent); background: none; }
          .s-item.active::before { display: none; }
          .s-icon { display: none; }
          .sidebar-stats { display: none; }
          .sidebar-user { padding: 0 14px; border-top: none; border-left: 1px solid var(--border); display: flex; align-items: center; flex-shrink: 0; }
          .u-email { display: none; }
          .btn-out { width: auto; padding: 8px 14px; margin: 0; white-space: nowrap; }
          .topbar { padding: 12px 16px; }
          .pg-title { font-size: 20px; }
          .content { padding: 16px; }
          .settings-grid { grid-template-columns: 1fr; }
          .settings-panel.full { grid-column: 1; }
          .add-social-row { flex-direction: column; }
          .btn-add-social { margin-bottom: 0; width: 100%; }
          .cards { grid-template-columns: repeat(auto-fill, minmax(155px, 1fr)); gap: 8px; }
          .view-site { display: none; }
          .waitlist-column { width: 280px; }
        }
        @media (max-width: 480px) {
          .cards { grid-template-columns: 1fr 1fr; }
          .badge { display: none; }
        }
      `}</style>

            <div className="dash">
                {/* SIDEBAR */}
                <aside className="sidebar">
                    <div className="sidebar-logo">
                        <h1>Migi <em>G</em></h1>
                        <p>Admin Panel</p>
                    </div>
                    <nav className="sidebar-nav">
                        <p className="s-label">Menu</p>
                        {TABS.map(t => (
                            <button key={t.id} className={`s-item ${activeTab === t.id ? "active" : ""}`} onClick={() => setActiveTab(t.id)}>
                                <span className="s-icon">{t.icon}</span> {t.label}
                            </button>
                        ))}
                    </nav>
                    <div className="sidebar-stats">
                        <div className="st-row"><span className="st-l">Total Works</span><span className="st-v">{totalCount}</span></div>
                        {categories.map(cat => (
                            <div className="st-row" key={cat}>
                                <span className="st-l">{cat}</span>
                                <span className="st-v">{portfolios.filter(p => p.category === cat).length}</span>
                            </div>
                        ))}
                    </div>
                    <div className="sidebar-user">
                        <p className="u-email">{user?.email}</p>
                        <button className="btn-out" onClick={handleLogout}>Sign Out</button>
                    </div>
                </aside>

                {/* MAIN */}
                <div className="main">
                    <div className="topbar">
                        <h1 className="pg-title">
                            {activeTab === "list" && <>All <em>Works</em></>}
                            {activeTab === "settings" && <>Site <em>Settings</em></>}
                            {activeTab === "waitlist" && <>Commission <em>Waitlist</em></>}
                        </h1>
                        <div className="topbar-r">
                            <span className="badge">{totalCount} Works</span>
                            {activeTab === "list" && <button className="btn-add-work" onClick={() => setShowAddModal(true)}>+ Add Work</button>}
                            {activeTab === "waitlist" && <button className="btn-add-work" onClick={() => { setAddCommissionDefaultColumn("Waitlist"); setShowAddCommissionModal(true); }}>+ Add Commission</button>}
                            <a href="/" target="_blank" rel="noopener noreferrer" className="view-site">↗ View Site</a>
                        </div>
                    </div>

                    <div className="content">
                        {/* ── WAITLIST TAB ── */}
                        {activeTab === "waitlist" && (
                            <>
                                <p className="drag-hint">Drag kartu untuk <span>pindah kolom.</span> Tag bisa lebih dari satu per kartu.</p>
                                <div className="waitlist-wrapper">
                                    <div className="waitlist-board">
                                        {BOARD_COLUMNS.map(col => {
                                            const items = commissions.filter(c => (c.column || "Waitlist") === col.key);
                                            return (
                                                <div
                                                    key={col.key}
                                                    className={`waitlist-column ${draggedCommissionId ? "drag-over" : ""}`}
                                                    onDragOver={handleDragOverCommission}
                                                    onDrop={(e) => handleDropCommission(e, col.key)}
                                                >
                                                    <div className="w-col-header">
                                                        <h3 style={{ color: col.color }}>{col.label}</h3>
                                                        <span className="w-col-count" style={{ background: col.color }}>{items.length}</span>
                                                    </div>
                                                    <div className="w-col-body">
                                                        {items.length === 0 && (
                                                            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.15)", textAlign: "center", padding: "20px 0", letterSpacing: "0.08em", fontStyle: "italic" }}>Kosong</p>
                                                        )}
                                                        {items.map(item => {
                                                            const allTags = [
                                                                ...(item.payment_tags || []),
                                                                ...(item.progress_tags || []),
                                                                ...(item.type_tags || []),
                                                            ];
                                                            return (
                                                                <div
                                                                    key={item.id}
                                                                    className={`w-card ${draggedCommissionId === item.id ? "dragging" : ""}`}
                                                                    draggable
                                                                    onDragStart={(e) => handleDragStartCommission(e, item.id)}
                                                                    onDragEnd={() => setDraggedCommissionId(null)}
                                                                    style={{ "--col-color": col.color }}
                                                                >
                                                                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "2.5px", background: col.color, opacity: 0.7 }} />
                                                                    {allTags.length > 0 && (
                                                                        <div className="w-card-tags">
                                                                            {allTags.map(t => <TagPill key={t} label={t} />)}
                                                                        </div>
                                                                    )}
                                                                    <h4 className="w-card-client">{item.client_name}</h4>
                                                                    <div className="w-card-footer">
                                                                        <div className="w-actions-mini">
                                                                            <button className="w-btn-icon" onClick={() => setEditCommissionItem(item)} title="Edit">✎</button>
                                                                            <button className="w-btn-icon del" onClick={() => setDeleteCommissionConfirm(item.id)} title="Delete">✕</button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                    <div className="w-col-footer">
                                                        <button className="w-btn-add-card" onClick={() => {
                                                            setAddCommissionDefaultColumn(col.key);
                                                            setShowAddCommissionModal(true);
                                                        }}>+ Add a card</button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ── LIST TAB ── */}
                        {activeTab === "list" && (
                            <>
                                <p className="drag-hint">Drag kartu untuk <span>ubah urutan</span> tampilan.</p>
                                <div className="cards">
                                    {portfolios.map((item, i) => {
                                        const ytID = getYouTubeID(item.video_url);
                                        return (
                                            <div key={item.id} className={`card ${dragging === i ? "dragging" : ""}`}
                                                draggable onDragStart={e => handleDragStart(e, i)}
                                                onDragEnter={e => handleDragEnter(e, i)}
                                                onDragEnd={handleDragEnd} onDragOver={e => e.preventDefault()}>
                                                <div className="drag-handle">⠿</div>
                                                <span className="card-order">#{i + 1}</span>
                                                <div className="card-thumb">
                                                    {ytID && <img src={`https://img.youtube.com/vi/${ytID}/mqdefault.jpg`} alt={item.title} />}
                                                </div>
                                                <div className="card-body">
                                                    <p className="card-cat">{item.category || "—"}</p>
                                                    <p className="card-title">{item.title}</p>
                                                </div>
                                                <div className="card-actions">
                                                    <button className="btn-edit" onClick={() => setEditItem({ ...item })}>Edit</button>
                                                    <button className="btn-del" onClick={() => setDeleteConfirm(item.id)}>Delete</button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}

                        {/* ── SETTINGS TAB ── */}
                        {activeTab === "settings" && (
                            <div className="settings-grid">
                                <div className="settings-panel">
                                    <h2 className="s-panel-title">Accent <em>Color</em></h2>
                                    <p className="s-panel-sub">Warna utama yang dipakai di seluruh tampilan.</p>
                                    <div className="color-row">
                                        <div className="color-preview" style={{ background: settings.accent_color }} />
                                        <div className="color-input-wrap">
                                            <p className="color-label">Accent Color</p>
                                            <input type="color" value={settings.accent_color} onChange={e => setSettings(s => ({ ...s, accent_color: e.target.value }))} />
                                        </div>
                                    </div>
                                    <div className="color-row">
                                        <div className="color-preview" style={{ background: settings.text_color }} />
                                        <div className="color-input-wrap">
                                            <p className="color-label">Text / Name Color</p>
                                            <input type="color" value={settings.text_color} onChange={e => setSettings(s => ({ ...s, text_color: e.target.value }))} />
                                        </div>
                                    </div>
                                    <div className="accent-live-preview">Preview — {settings.accent_color}</div>
                                </div>
                                <div className="settings-panel">
                                    <h2 className="s-panel-title">Showreel <em>URL</em></h2>
                                    <p className="s-panel-sub">Link YouTube untuk video showreel di halaman utama.</p>
                                    <div className="field"><label>YouTube URL</label><input type="url" value={settings.showreel_url} onChange={e => setSettings(s => ({ ...s, showreel_url: e.target.value }))} placeholder="https://youtube.com/watch?v=..." /></div>
                                </div>
                                <div className="settings-panel full">
                                    <h2 className="s-panel-title">About <em>Section</em></h2>
                                    <p className="s-panel-sub">Konten bagian About di halaman utama.</p>
                                    <div className="field"><label>Name</label><input type="text" value={settings.about_name} onChange={e => setSettings(s => ({ ...s, about_name: e.target.value }))} placeholder="Nama tampilan..." /></div>
                                    <div className="field"><label>Role / Title</label><input type="text" value={settings.about_role} onChange={e => setSettings(s => ({ ...s, about_role: e.target.value }))} placeholder="Motion Designer / Video Editor..." /></div>
                                    <div className="field"><label>About Text</label><textarea rows={4} value={settings.about_text} onChange={e => setSettings(s => ({ ...s, about_text: e.target.value }))} placeholder="Deskripsi singkat tentang kamu..." /></div>
                                    <div className="field">
                                        <label>Profile Photo</label>
                                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                            {settings.about_photo_url && <img src={settings.about_photo_url} alt="Preview" style={{ width: "64px", height: "64px", objectFit: "cover", borderRadius: "8px", display: "block", border: "1px solid var(--border)" }} />}
                                            <div style={{ flex: 1 }}>
                                                <input type="file" accept="image/*" onChange={handleUploadPhoto} disabled={isUploading} style={{ color: "var(--text)" }} />
                                                {isUploading && <span style={{ color: "var(--accent)", fontSize: "12px", marginLeft: "10px" }}>Uploading...</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="field"><label>Skills / Tools</label><input type="text" value={settings.about_skills} onChange={e => setSettings(s => ({ ...s, about_skills: e.target.value }))} placeholder='["After Effects", "Premiere Pro", "Illustrator"]' /><p className="field-hint">Format JSON Array</p></div>
                                    <div className="field"><label>Stats</label><input type="text" value={settings.about_stats} onChange={e => setSettings(s => ({ ...s, about_stats: e.target.value }))} placeholder='[{"label":"Years","value":"3+"}]' /><p className="field-hint">Format JSON Array Objects</p></div>
                                </div>
                                <div className="settings-panel full">
                                    <h2 className="s-panel-title">Social <em>Media</em></h2>
                                    <p className="s-panel-sub">Kelola link sosial media yang tampil di footer.</p>
                                    <div className="social-list">
                                        {settings.socials.length === 0 && <p style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.08em" }}>Belum ada social media.</p>}
                                        {settings.socials.map((s, i) => (
                                            <div className="social-item" key={i}>
                                                <span className="social-icon">{SOCIAL_ICONS[s.platform] || "•"}</span>
                                                <span className="social-platform">{s.platform}</span>
                                                <input className="social-edit" value={s.url} onChange={e => updateSocial(i, "url", e.target.value)} placeholder="https://..." />
                                                <button className="btn-rm" onClick={() => removeSocial(i)}>✕</button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="add-social-row">
                                        <div className="field" style={{ margin: 0 }}><label>Platform</label><select value={newSocialPlatform} onChange={e => setNewSocialPlatform(e.target.value)}>{SOCIAL_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
                                        <div className="field" style={{ flex: 2, margin: 0 }}><label>URL</label><input type="url" value={newSocialUrl} onChange={e => setNewSocialUrl(e.target.value)} placeholder="https://..." /></div>
                                        <button className="btn-add-social" onClick={addSocial}>+ Add</button>
                                    </div>
                                </div>
                                <div style={{ gridColumn: "1 / -1" }}>
                                    <div className="settings-save-row">
                                        <button className="btn-settings-save" onClick={handleSettingsSave} disabled={settingsLoading}>{settingsLoading ? "Saving..." : "Save All Settings"}</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MODALS */}
            {showAddModal && <AddWorkModal onClose={() => setShowAddModal(false)} onSave={handleAddWork} />}
            {showAddCommissionModal && <AddCommissionModal onClose={() => setShowAddCommissionModal(false)} onSave={handleAddCommission} defaultColumn={addCommissionDefaultColumn} />}
            {editItem && (
                <div className="modal-bg" onClick={() => setEditItem(null)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <h2 className="modal-title">Edit <em>Work</em></h2>
                        <div className="field"><label>YouTube URL</label><input type="url" value={editItem.video_url} onChange={e => setEditItem(i => ({ ...i, video_url: e.target.value }))} /></div>
                        <div className="field"><label>Video Title</label><input type="text" value={editItem.title} onChange={e => setEditItem(i => ({ ...i, title: e.target.value }))} /></div>
                        <div className="field"><label>Category</label><CategoryInput value={editItem.category} onChange={val => setEditItem(i => ({ ...i, category: val }))} /></div>
                        <div className="modal-btns">
                            <button className="btn-mcancel" onClick={() => setEditItem(null)}>Cancel</button>
                            <button className="btn-msave" onClick={handleEditSave}>Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
            {editCommissionItem && <EditCommissionModal item={editCommissionItem} onClose={() => setEditCommissionItem(null)} onSave={handleEditCommissionSave} />}
            {deleteConfirm && (
                <div className="modal-bg" onClick={() => setDeleteConfirm(null)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 360, textAlign: "center" }}>
                        <h2 className="modal-title">Hapus <em>Karya?</em></h2>
                        <p style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.05em", lineHeight: 1.8, marginBottom: 8 }}>Tindakan ini tidak bisa dibatalkan.</p>
                        <div className="modal-btns">
                            <button className="btn-mcancel" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                            <button className="btn-mdel" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
            {deleteCommissionConfirm && (
                <div className="modal-bg" onClick={() => setDeleteCommissionConfirm(null)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 360, textAlign: "center" }}>
                        <h2 className="modal-title">Hapus <em>Antrean?</em></h2>
                        <p style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.05em", lineHeight: 1.8, marginBottom: 8 }}>Tindakan ini tidak bisa dibatalkan.</p>
                        <div className="modal-btns">
                            <button className="btn-mcancel" onClick={() => setDeleteCommissionConfirm(null)}>Cancel</button>
                            <button className="btn-mdel" onClick={() => handleDeleteCommission(deleteCommissionConfirm)}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
            {notification && <div className={`notif ${notification.type}`}>{notification.msg}</div>}
        </>
    );
}