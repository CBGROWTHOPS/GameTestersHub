/**
 * Proxy to Supabase submit-lead. Same-origin = no CORS.
 * Adds auth headers server-side so the form never needs them.
 */
const SUPABASE_URL = "https://rovbqnncmzltdyeeldxz.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvdmJxbm5jbXpsdGR5ZWVsZHh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3Mjc1OTYsImV4cCI6MjA4NzMwMzU5Nn0.bZL4NnaSACULm8GGQV9mnC7gwFTtN_0Qewz-DUJDlbQ";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/submit-lead`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error("submit-lead proxy error:", err);
    res.status(500).json({ error: "Failed to submit" });
  }
}
