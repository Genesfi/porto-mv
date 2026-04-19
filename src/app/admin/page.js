"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function AdminLogin() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [checkingSession, setCheckingSession] = useState(true);

    // Kalau sudah login, langsung redirect ke dashboard
    useEffect(() => {
        const check = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                router.replace("/admin/dashboard");
            } else {
                setCheckingSession(false);
            }
        };
        check();
    }, [router]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setErrorMsg("Email atau password salah. Silakan coba lagi.");
        } else {
            router.push("/admin/dashboard");
        }

        setLoading(false);
    };

    if (checkingSession) {
        return (
            <div style={{ minHeight: "100vh", background: "#080808", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 24, height: 24, border: "1px solid rgba(201,185,154,0.3)", borderTopColor: "#c9b99a", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=DM+Mono:wght@300;400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080808; }

        .login-wrap {
          min-height: 100vh; background: #080808;
          display: flex; align-items: stretch;
          font-family: 'DM Mono', monospace;
        }

        /* LEFT PANEL - decorative */
        .login-left {
          flex: 1; display: none;
          flex-direction: column; justify-content: space-between;
          padding: 48px; position: relative; overflow: hidden;
          border-right: 1px solid rgba(255,255,255,0.06);
        }
        @media (min-width: 900px) { .login-left { display: flex; } }

        .login-left-bg {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 60% 60% at 50% 40%, rgba(201,185,154,0.06) 0%, transparent 70%);
        }
        .left-logo {
          font-family: 'Cormorant Garamond', serif; font-weight: 300;
          font-size: 22px; letter-spacing: 0.15em; color: #f5f2ed;
          position: relative; z-index: 1;
        }
        .left-logo span { font-style: italic; color: #c9b99a; }

        .left-tagline { position: relative; z-index: 1; }
        .left-tagline h2 {
          font-family: 'Cormorant Garamond', serif; font-weight: 300;
          font-size: 52px; line-height: 1; letter-spacing: -0.02em;
          color: rgba(245,242,237,0.15);
        }
        .left-tagline h2 em { font-style: italic; color: rgba(201,185,154,0.3); }

        .left-lines {
          position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          pointer-events: none; z-index: 0; overflow: hidden;
        }
        .left-lines::before, .left-lines::after {
          content: ''; position: absolute;
          background: rgba(201,185,154,0.06);
        }
        .left-lines::before { width: 1px; height: 100%; left: 30%; top: 0; }
        .left-lines::after { width: 100%; height: 1px; top: 40%; left: 0; }

        /* RIGHT PANEL - form */
        .login-right {
          width: 100%; max-width: 480px;
          display: flex; align-items: center; justify-content: center;
          padding: 48px 40px;
        }
        @media (min-width: 900px) { .login-right { width: 480px; flex: none; } }

        .login-form-wrap { width: 100%; }

        .form-eyebrow {
          font-size: 9px; letter-spacing: 0.35em; text-transform: uppercase;
          color: #c9b99a; margin-bottom: 20px;
        }
        .form-title {
          font-family: 'Cormorant Garamond', serif; font-weight: 300;
          font-size: 42px; letter-spacing: -0.02em; line-height: 1;
          color: #f5f2ed; margin-bottom: 8px;
        }
        .form-title em { font-style: italic; color: #c9b99a; }
        .form-subtitle {
          font-size: 10px; letter-spacing: 0.08em; color: rgba(232,228,220,0.3);
          margin-bottom: 48px; line-height: 1.7;
        }

        .form-divider {
          width: 40px; height: 1px; background: rgba(201,185,154,0.3); margin-bottom: 40px;
        }

        .field { margin-bottom: 28px; }
        .field label {
          display: block; font-size: 9px; letter-spacing: 0.3em;
          text-transform: uppercase; color: rgba(232,228,220,0.4); margin-bottom: 10px;
        }
        .field input {
          width: 100%; background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          color: #e8e4dc; font-family: 'DM Mono', monospace;
          font-size: 13px; padding: 14px 16px;
          outline: none; transition: border-color 0.25s, background 0.25s;
          letter-spacing: 0.05em;
        }
        .field input:focus {
          border-color: rgba(201,185,154,0.5);
          background: rgba(201,185,154,0.03);
        }
        .field input::placeholder { color: rgba(232,228,220,0.15); }

        .error-box {
          background: rgba(180,60,60,0.08); border: 1px solid rgba(180,60,60,0.3);
          color: #e07070; font-size: 10px; letter-spacing: 0.05em;
          padding: 12px 16px; margin-bottom: 24px; line-height: 1.6;
        }

        .btn-login {
          width: 100%; padding: 16px;
          background: #c9b99a; color: #080808;
          font-family: 'DM Mono', monospace; font-size: 10px;
          letter-spacing: 0.3em; text-transform: uppercase;
          border: none; transition: background 0.25s, transform 0.15s;
          margin-top: 8px;
        }
        .btn-login:hover:not(:disabled) { background: #f5f2ed; transform: translateY(-1px); }
        .btn-login:disabled { opacity: 0.5; }

        .form-footer {
          margin-top: 40px; padding-top: 28px; border-top: 1px solid rgba(255,255,255,0.06);
          font-size: 9px; letter-spacing: 0.15em; color: rgba(232,228,220,0.2);
          text-align: center;
        }
        .form-footer a { color: rgba(201,185,154,0.5); text-decoration: none; }
        .form-footer a:hover { color: #c9b99a; }
      `}</style>

            <div className="login-wrap">
                {/* LEFT */}
                <div className="login-left">
                    <div className="login-left-bg" />
                    <div className="left-lines" />
                    <div className="left-logo">Migi <span>Gustian</span></div>
                    <div className="left-tagline">
                        <h2>Motion<br /><em>Design</em><br />Studio</h2>
                    </div>
                    <div style={{ fontSize: 9, letterSpacing: "0.25em", color: "rgba(201,185,154,0.3)", textTransform: "uppercase", position: "relative", zIndex: 1 }}>
                        Portfolio Management System
                    </div>
                </div>

                {/* RIGHT */}
                <div className="login-right">
                    <div className="login-form-wrap">
                        <p className="form-eyebrow">Admin Area</p>
                        <h1 className="form-title">Welcome<br /><em>Back</em></h1>
                        <p className="form-subtitle">
                            Sign in to manage your<br />portfolio and projects.
                        </p>
                        <div className="form-divider" />

                        {errorMsg && <div className="error-box">{errorMsg}</div>}

                        <form onSubmit={handleLogin}>
                            <div className="field">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@email.com"
                                    required
                                    autoComplete="email"
                                />
                            </div>
                            <div className="field">
                                <label>Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••"
                                    required
                                    autoComplete="current-password"
                                />
                            </div>
                            <button type="submit" className="btn-login" disabled={loading}>
                                {loading ? "Signing in..." : "Sign In"}
                            </button>
                        </form>

                        <div className="form-footer">
                            <a href="/">← Back to portfolio</a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}