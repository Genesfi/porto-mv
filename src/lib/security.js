/**
 * Security utilities for rate-limiting, XSS sanitization, and Honeypot verification.
 */

// In-memory rate limiting store (IP => { count, resetTime })
const rateLimitStore = new Map();

/**
 * Rate Limiter helper
 * @param {string} ip Client IP address
 * @param {object} options { limit: max requests, windowMs: duration in ms }
 * @returns {object} { allowed: boolean, remaining: number, resetInSeconds: number }
 */
export function checkRateLimit(ip = "unknown-ip", options = { limit: 5, windowMs: 15 * 60 * 1000 }) {
    const now = Date.now();
    const cleanIp = String(ip).trim();

    // Clean up expired entries periodically
    if (rateLimitStore.size > 1000) {
        for (const [key, value] of rateLimitStore.entries()) {
            if (value.resetTime < now) {
                rateLimitStore.delete(key);
            }
        }
    }

    const record = rateLimitStore.get(cleanIp);

    if (!record || record.resetTime < now) {
        rateLimitStore.set(cleanIp, {
            count: 1,
            resetTime: now + options.windowMs,
        });
        return {
            allowed: true,
            remaining: options.limit - 1,
            resetInSeconds: Math.ceil(options.windowMs / 1000),
        };
    }

    if (record.count >= options.limit) {
        return {
            allowed: false,
            remaining: 0,
            resetInSeconds: Math.ceil((record.resetTime - now) / 1000),
        };
    }

    record.count += 1;
    return {
        allowed: true,
        remaining: options.limit - record.count,
        resetInSeconds: Math.ceil((record.resetTime - now) / 1000),
    };
}

/**
 * Sanitize string input to prevent XSS / script injection attacks
 * @param {string} input 
 * @returns {string}
 */
export function sanitizeInput(input) {
    if (typeof input !== "string") return "";
    return input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;")
        .replace(/\//g, "&#x2F;")
        .trim();
}

/**
 * Extract Client IP from Request Headers safely
 * @param {Request} request 
 * @returns {string}
 */
export function getClientIp(request) {
    const xForwardedFor = request.headers.get("x-forwarded-for");
    if (xForwardedFor) {
        return xForwardedFor.split(",")[0].trim();
    }
    const xRealIp = request.headers.get("x-real-ip");
    if (xRealIp) {
        return xRealIp.trim();
    }
    return "127.0.0.1";
}

/**
 * Check honeypot field (bots usually fill hidden fields)
 * @param {string} honeypotFieldValue 
 * @returns {boolean} True if clean human, False if suspected bot
 */
export function isHuman(honeypotFieldValue) {
    return !honeypotFieldValue || String(honeypotFieldValue).trim() === "";
}
