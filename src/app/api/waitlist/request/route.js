import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { checkRateLimit, getClientIp, sanitizeInput, isHuman } from "@/lib/security";
import { Resend } from "resend";

export async function POST(request) {
    try {
        const clientIp = getClientIp(request);
        // Rate limit: Max 3 waitlist requests per 10 minutes per IP
        const rateCheck = checkRateLimit(`waitlist_request_${clientIp}`, { limit: 3, windowMs: 10 * 60 * 1000 });

        if (!rateCheck.allowed) {
            return NextResponse.json({
                error: `Too many submission attempts. Please wait ${rateCheck.resetInSeconds} seconds before trying again.`
            }, { status: 429 });
        }

        const body = await request.json();

        // Bot / Honeypot check
        if (!isHuman(body?.website_hp)) {
            return NextResponse.json({ error: "Spam detected." }, { status: 400 });
        }

        const client_name = sanitizeInput(body?.client_name);
        const contact_info = sanitizeInput(body?.contact_info);
        const project_type = sanitizeInput(body?.project_type);
        const budget_range = sanitizeInput(body?.budget_range);
        const description = sanitizeInput(body?.description);

        if (!client_name || !contact_info || !project_type) {
            return NextResponse.json({
                error: "Name/Handle, Contact Info, and Project Type are required."
            }, { status: 400 });
        }

        // Insert into waitlist_requests table with status 'pending' (Awaiting Admin ACC)
        let { data, error } = await supabaseServer
            .from("waitlist_requests")
            .insert([{
                client_name,
                contact_info,
                project_type,
                budget_range: budget_range || "Flexible",
                description: description || "",
                status: "pending"
            }])
            .select();

        if (error) {
            // If table waitlist_requests does not exist in Supabase SQL yet
            if (error.code === "42P01") {
                return NextResponse.json({
                    error: "Waitlist database table missing. Please run the SQL migration in Supabase SQL Editor."
                }, { status: 500 });
            }
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        // Send Email Notification to Admin via Resend (with safety timeout)
        const resendApiKey = process.env.RESEND_API_KEY;
        const notificationEmail = process.env.NOTIFICATION_EMAIL || "gn.migi@gmail.com";

        if (resendApiKey) {
            try {
                const resend = new Resend(resendApiKey);
                const sendPromise = resend.emails.send({
                    from: "Migi Portfolio <onboarding@resend.dev>",
                    to: notificationEmail,
                    subject: `[New Waitlist Request] ${client_name} - ${project_type}`,
                    html: `
                        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0c0c0e; color: #f0ece4; padding: 32px; border-radius: 12px; max-width: 560px; margin: auto; border: 1px solid #222;">
                            <div style="border-bottom: 1px solid #222; padding-bottom: 16px; margin-bottom: 24px;">
                                <h2 style="margin: 0; color: #d4c4a8; font-size: 20px; letter-spacing: 0.05em;">New Waitlist Request 📩</h2>
                                <p style="margin: 4px 0 0; color: #888; font-size: 12px;">Ada calon klien yang mengajukan slot komisi baru di website Anda.</p>
                            </div>

                            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                                <tr>
                                    <td style="padding: 10px 0; color: #888; width: 140px;">Client Name</td>
                                    <td style="padding: 10px 0; font-weight: 600; color: #fff;">${client_name}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; color: #888;">Contact Info</td>
                                    <td style="padding: 10px 0; color: #d4c4a8;">${contact_info}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; color: #888;">Project Type</td>
                                    <td style="padding: 10px 0; color: #fff;">${project_type}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; color: #888;">Budget Range</td>
                                    <td style="padding: 10px 0; color: #4ae6b8; font-weight: 600;">${budget_range || "Flexible"}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; color: #888; vertical-align: top;">Description</td>
                                    <td style="padding: 10px 0; color: #ddd; line-height: 1.6; white-space: pre-wrap;">${description || "—"}</td>
                                </tr>
                            </table>

                            <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #222; text-align: center;">
                                <p style="font-size: 11px; color: #666; margin: 0;">Buka Admin Dashboard untuk menyetujui (Approve) atau menolak request ini.</p>
                            </div>
                        </div>
                    `,
                });

                // Safety timeout: max 3.5s so external email delays never hang the API
                const timeoutPromise = new Promise((resolve) =>
                    setTimeout(() => resolve({ timeout: true }), 3500)
                );
                await Promise.race([sendPromise, timeoutPromise]);
            } catch (emailErr) {
                console.error("Resend notification error:", emailErr);
            }
        }

        return NextResponse.json({
            success: true,
            message: "Your waitlist request has been submitted! It will be reviewed by Migi Gustian before appearing on the queue.",
            data
        });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
