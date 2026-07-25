"use client";

import { useEffect } from "react";

export default function SecurityShield() {
    useEffect(() => {
        // 1. Disable Right Click Context Menu (Image & Content protection)
        const handleContextMenu = (e) => {
            e.preventDefault();
        };

        // 2. Block Inspect Element & Source Code Hotkeys (F12, Ctrl+Shift+I/J/C, Ctrl+U)
        const handleKeyDown = (e) => {
            // F12
            if (e.keyCode === 123) {
                e.preventDefault();
                return false;
            }
            // Ctrl+Shift+I (Inspect), Ctrl+Shift+J (Console), Ctrl+Shift+C (Inspect Element)
            if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
                e.preventDefault();
                return false;
            }
            // Ctrl+U (View Source)
            if (e.ctrlKey && e.keyCode === 85) {
                e.preventDefault();
                return false;
            }
            // Cmd+Option+I/J (Mac Inspect/Console)
            if (e.metaKey && e.altKey && (e.keyCode === 73 || e.keyCode === 74)) {
                e.preventDefault();
                return false;
            }
        };

        document.addEventListener("contextmenu", handleContextMenu);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("contextmenu", handleContextMenu);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    return null;
}
