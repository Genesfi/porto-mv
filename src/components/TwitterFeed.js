"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export default function TwitterFeed({ accentColor = "#d4c4a8", latestTweetUrl = "" }) {
    const tweetContainerRef = useRef(null);
    const timelineContainerRef = useRef(null);
    const [scriptReady, setScriptReady] = useState(false);

    // Extract Tweet ID from URL if provided (e.g. https://x.com/migi_gn/status/123456789)
    const getTweetId = (url) => {
        if (!url) return null;
        const match = url.match(/status\/(\d+)/);
        return match ? match[1] : null;
    };

    const tweetId = getTweetId(latestTweetUrl);

    useEffect(() => {
        const scriptId = "twitter-wjs";
        const initTwitter = () => {
            if (window.twttr && window.twttr.widgets) {
                setScriptReady(true);
                if (tweetId && tweetContainerRef.current) {
                    tweetContainerRef.current.innerHTML = "";
                    window.twttr.widgets.createTweet(tweetId, tweetContainerRef.current, {
                        theme: "dark",
                        conversation: "none"
                    });
                } else if (timelineContainerRef.current) {
                    window.twttr.widgets.load(timelineContainerRef.current);
                }
            }
        };

        if (!document.getElementById(scriptId)) {
            const script = document.createElement("script");
            script.id = scriptId;
            script.src = "https://platform.twitter.com/widgets.js";
            script.async = true;
            script.onload = initTwitter;
            document.head.appendChild(script);
        } else {
            initTwitter();
            const interval = setInterval(() => {
                if (window.twttr && window.twttr.widgets) {
                    initTwitter();
                    clearInterval(interval);
                }
            }, 600);
            return () => clearInterval(interval);
        }
    }, [tweetId]);

    return (
        <section style={{
            margin: "60px auto",
            maxWidth: "960px",
            padding: "0 24px"
        }}>
            <style>{`
                .x-card {
                    background: rgba(15, 15, 15, 0.7);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 20px;
                    overflow: hidden;
                    backdrop-filter: blur(12px);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
                    transition: transform 0.3s ease, border-color 0.3s ease;
                }
                .x-card:hover {
                    border-color: rgba(212, 196, 168, 0.3);
                }
                .x-banner {
                    height: 140px;
                    background: linear-gradient(135deg, #16181c 0%, #0d0e11 50%, #201e18 100%);
                    position: relative;
                    background-image: radial-gradient(circle at 80% 20%, rgba(212, 196, 168, 0.15), transparent 50%);
                }
                .x-avatar-container {
                    position: absolute;
                    bottom: -36px;
                    left: 28px;
                    padding: 4px;
                    background: #080808;
                    border-radius: 50%;
                }
                .x-avatar {
                    width: 76px;
                    height: 76px;
                    border-radius: 50%;
                    object-fit: cover;
                    background: #1a1a1a;
                    border: 2px solid rgba(255, 255, 255, 0.1);
                }
                .x-body {
                    padding: 44px 28px 24px;
                }
                .x-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 4px 10px;
                    border-radius: 999px;
                    background: rgba(212, 196, 168, 0.1);
                    border: 1px solid rgba(212, 196, 168, 0.25);
                    color: ${accentColor};
                    font-size: 11px;
                    font-weight: 500;
                    margin-bottom: 10px;
                }
                .x-pulse {
                    width: 7px;
                    height: 7px;
                    border-radius: 50%;
                    background: ${accentColor};
                    box-shadow: 0 0 8px ${accentColor};
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0% { transform: scale(0.95); opacity: 0.8; }
                    50% { transform: scale(1.2); opacity: 1; }
                    100% { transform: scale(0.95); opacity: 0.8; }
                }
                .x-actions {
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                    margin-top: 18px;
                }
                .x-btn {
                    padding: 8px 18px;
                    border-radius: 999px;
                    font-size: 11px;
                    font-weight: 600;
                    letter-spacing: 0.05em;
                    text-decoration: none;
                    transition: all 0.2s ease;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                }
                .x-btn-primary {
                    background: #ffffff;
                    color: #000000;
                }
                .x-btn-primary:hover {
                    background: ${accentColor};
                    color: #000000;
                    transform: translateY(-2px);
                }
                .x-btn-secondary {
                    background: rgba(255, 255, 255, 0.06);
                    color: #e1e1e1;
                    border: 1px solid rgba(255, 255, 255, 0.12);
                }
                .x-btn-secondary:hover {
                    background: rgba(255, 255, 255, 0.12);
                    border-color: rgba(255, 255, 255, 0.25);
                    transform: translateY(-2px);
                }
            `}</style>

            <motion.div
                className="x-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                {/* Banner & Avatar Header */}
                <div className="x-banner">
                    <div className="x-avatar-container">
                        <img
                            src="https://unavatar.io/x/migi_gn"
                            alt="Migi Gustian Twitter Avatar"
                            className="x-avatar"
                            onError={(e) => {
                                e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80";
                            }}
                        />
                    </div>
                </div>

                {/* Profile Details */}
                <div className="x-body">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                        <div>
                            <div className="x-badge">
                                <span className="x-pulse"></span>
                                <span>Commission Slot Aug (1/4)</span>
                            </div>
                            <h3 style={{ fontSize: "22px", fontWeight: 700, color: "#ffffff", fontFamily: "'Cormorant Garamond', serif" }}>
                                Migi Gustian
                            </h3>
                            <p style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)", fontFamily: "'DM Mono', monospace", marginTop: "2px" }}>
                                @migi_gn • UTC+08:00
                            </p>
                        </div>

                        <div className="x-actions">
                            <a
                                href="https://x.com/migi_gn"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="x-btn x-btn-primary"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                </svg>
                                Follow @migi_gn
                            </a>
                            <a
                                href="https://vgen.co/migi_gn"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="x-btn x-btn-secondary"
                            >
                                🎨 VGen Store
                            </a>
                            <a
                                href="https://linktr.ee/migign"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="x-btn x-btn-secondary"
                            >
                                🔗 Linktree
                            </a>
                        </div>
                    </div>

                    <p style={{
                        fontSize: "13px",
                        lineHeight: "1.6",
                        color: "rgba(240, 236, 228, 0.8)",
                        marginTop: "16px",
                        fontFamily: "system-ui, -apple-system, sans-serif"
                    }}>
                        vgen: <a href="https://vgen.co/migi_gn" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: "underline" }}>vgen.co/migi_gn</a> | <strong>Motion Graphic</strong> | Open commission MV, Debut, intro, Stinger, etc check my work here <a href="https://linktr.ee/migign" target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: "underline" }}>linktr.ee/migign</a>
                    </p>

                    {/* Official Twitter Embedded Live Feed or Tweet */}
                    <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                            <span style={{ fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: accentColor, fontFamily: "'DM Mono', monospace" }}>
                                ⚡ LATEST POST FROM TWITTER / X
                            </span>
                            <a
                                href="https://x.com/migi_gn"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", textDecoration: "none", fontFamily: "'DM Mono', monospace" }}
                            >
                                View Profile ↗
                            </a>
                        </div>

                        {tweetId ? (
                            <div ref={tweetContainerRef} style={{ display: "flex", justifyContent: "center", minHeight: "180px" }} />
                        ) : (
                            <div ref={timelineContainerRef} className="twitter-embed-container" style={{ minHeight: "180px" }}>
                                <a
                                    className="twitter-timeline"
                                    data-theme="dark"
                                    data-chrome="noheader nofooter noborders transparent"
                                    data-height="350"
                                    data-tweet-limit="2"
                                    href="https://twitter.com/migi_gn?ref_src=twsrc%5Etfw"
                                >
                                    Posts by @migi_gn
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
