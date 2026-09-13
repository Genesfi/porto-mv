"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function SecurityShield() {
    const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        // Allow developer bypass via query param (?debug=1) or localStorage
        if (typeof window !== "undefined") {
            const searchParams = new URLSearchParams(window.location.search);
            if (searchParams.get("debug") === "1" || localStorage.getItem("admin_dev_mode") === "true") {
                return;
            }
        }

        // 1. Disable Right Click Context Menu
        const handleContextMenu = (e) => {
            e.preventDefault();
        };

        // 2. Prevent dragging images / media
        const handleDragStart = (e) => {
            if (e.target.tagName === "IMG" || e.target.tagName === "VIDEO") {
                e.preventDefault();
            }
        };

        // 3. Block Inspect Element & Source Code Hotkeys (Capture phase)
        const handleKeyDown = (e) => {
            // F12
            if (e.keyCode === 123 || e.key === "F12") {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            // Ctrl+Shift+I / J / C (DevTools & Console)
            if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67 || e.key === "I" || e.key === "J" || e.key === "C")) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            // Ctrl+U (View Source)
            if (e.ctrlKey && (e.keyCode === 85 || e.key === "u" || e.key === "U")) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            // Ctrl+S (Save Page)
            if (e.ctrlKey && (e.keyCode === 83 || e.key === "s" || e.key === "S")) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            // Mac: Cmd+Option+I / J / C / U
            if (e.metaKey && e.altKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67 || e.keyCode === 85)) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        };

        // 4. Active DevTools Detection
        let detected = false;

        const setShieldState = (state) => {
            if (detected !== state) {
                detected = state;
                setIsDevToolsOpen(state);
                if (state) {
                    document.body.style.overflow = "hidden";
                } else {
                    document.body.style.overflow = "";
                }
            }
        };

        const detectDevTools = () => {
            let isOpen = false;

            // Method A: Dimension Delta (Docked DevTools bottom/right/left)
            const threshold = 160;
            const widthDiff = window.outerWidth - window.innerWidth > threshold;
            const heightDiff = window.outerHeight - window.innerHeight > threshold;

            if (widthDiff || heightDiff) {
                isOpen = true;
            }

            // Method B: Execution Timing with Debugger (Detached / Undocked DevTools)
            // When DevTools is closed, debugger takes ~0.001ms (no pause)
            // When DevTools is open, execution pauses and takes > 100ms
            if (!isOpen) {
                const startTime = performance.now();
                // eslint-disable-next-line no-debugger
                debugger;
                const endTime = performance.now();
                if (endTime - startTime > 100) {
                    isOpen = true;
                }
            }

            // Method C: Console Object Getter Evaluation (Chromium / WebKit)
            if (!isOpen) {
                const img = new Image();
                Object.defineProperty(img, "id", {
                    get: function () {
                        isOpen = true;
                    }
                });
                console.log(img);
                console.clear();
            }

            setShieldState(isOpen);

            // If DevTools is open, activate anti-debugger loop to freeze inspection
            if (isOpen) {
                try {
                    (function () {
                        return false;
                    }["constructor"]("debugger")["call"]());
                } catch (e) { }
            }
        };

        // Run detection every 400ms
        const intervalId = setInterval(detectDevTools, 400);

        // Immediate detection on window events
        const handleWindowChange = () => {
            detectDevTools();
        };

        const handleBlur = () => {
            // When iframe (e.g. YouTube) steals focus, check immediately after
            setTimeout(detectDevTools, 300);
        };

        document.addEventListener("contextmenu", handleContextMenu);
        document.addEventListener("dragstart", handleDragStart);
        window.addEventListener("keydown", handleKeyDown, true);
        window.addEventListener("resize", handleWindowChange);
        window.addEventListener("focus", handleWindowChange);
        window.addEventListener("blur", handleBlur);

        return () => {
            clearInterval(intervalId);
            document.body.style.overflow = "";
            document.removeEventListener("contextmenu", handleContextMenu);
            document.removeEventListener("dragstart", handleDragStart);
            window.removeEventListener("keydown", handleKeyDown, true);
            window.removeEventListener("resize", handleWindowChange);
            window.removeEventListener("focus", handleWindowChange);
            window.removeEventListener("blur", handleBlur);
        };
    }, [pathname]);

    if (!isDevToolsOpen) return null;

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 99999999,
                backgroundColor: "#0a0a0c",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "#d4c4a8",
                fontFamily: "var(--font-sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)",
                textAlign: "center",
                padding: "32px",
                userSelect: "none"
            }}
        >
            <div style={{ fontSize: "56px", marginBottom: "20px", filter: "drop-shadow(0 0 24px rgba(212,196,168,0.25))" }}>
                🛡️
            </div>
            <h2 style={{ fontSize: "24px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "12px", color: "#fff" }}>
                Security Notice
            </h2>
            <p style={{ color: "#888", maxWidth: "460px", fontSize: "14px", lineHeight: "1.7", margin: 0 }}>
                Developer Tools / Inspect Element is restricted on this portfolio to protect intellectual property and video assets.
            </p>
            <p style={{ color: "#555", fontSize: "12px", marginTop: "16px", fontStyle: "italic" }}>
                Please close Developer Tools to continue browsing.
            </p>
        </div>
    );
}
