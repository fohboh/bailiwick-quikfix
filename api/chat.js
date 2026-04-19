// api/chat.js — Vercel Edge Function
// Proxies all Claude API calls from BailiwickQuikFix (and Bailiwick | VIBE website)
// Deploy this file to /api/chat.js in your Vercel project root
//
// Setup:
//   1. Add ANTHROPIC_API_KEY to Vercel → Settings → Environment Variables
//   2. All fetch calls in the HTML point to /api/chat instead of api.anthropic.com
//
// Works for both bailiwick-vibe-website.html (Vibe chat widget)
// and BailiwickQuikFix_v1.6.1.html (AI pipeline + intake + support)

export const config = { runtime: "edge" };

export default async function handler(req) {
  // Only allow POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "API key not configured. Add ANTHROPIC_API_KEY to Vercel environment variables." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.text();

    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type":    "application/json",
        "x-api-key":       apiKey,
        "anthropic-version": "2023-06-01",
      },
      body,
    });

    const data = await upstream.text();

    return new Response(data, {
      status: upstream.status,
      headers: {
        "Content-Type": "application/json",
        // Allow calls from your domain + localhost for development
        "Access-Control-Allow-Origin":  "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Proxy error", detail: err.message }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
}
