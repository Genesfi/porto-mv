import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { checkRateLimit, getClientIp, sanitizeInput, isHuman } from "@/lib/security";

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

        return NextResponse.json({
            success: true,
            message: "Your waitlist request has been submitted! It will be reviewed by Migi Gustian before appearing on the queue.",
            data
        });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
