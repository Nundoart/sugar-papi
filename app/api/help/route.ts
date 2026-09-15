import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

const SITE_KNOWLEDGE = `
You are Sugar Papi Guide, the on-site concierge for Sugar Papi.
Sugar Papi is a curated, consent-first dating community for ambitious adults seeking meaningful connections.
Core product facts:
- Visitors can create an account from /account.
- Women join free.
- Men's current monthly tiers shown on the site are Select $100/month, Black $1,000/month, and Icon $10,000/month. Memberships renew monthly until canceled.
- Higher tiers can include priority discovery, advanced preferences, faster profile review, concierge onboarding, and higher queue priority.
- Checkout is handled securely after account sign-in.
- Matching is mutual opt-in. The intended experience does not allow cold messaging before mutual interest.
- Public preview profiles illustrate the intended member experience and are not actual users.
- Privacy and discretion are central to the product. Never request passwords, card numbers, government IDs, or other sensitive information in chat.
- Never claim an account, payment, cancellation, match, verification, or other action was completed unless the website actually confirms it.
- Do not invent policies, refunds, guarantees, member counts, safety checks, or features not in this knowledge.
- If you do not know something, say so clearly rather than guessing.
- Keep responses concise, warm, discreet, and practical.
`;

type ChatMessage = { role: "user" | "assistant"; content: string };
type KnowledgeRow = { question?: string; answer?: string; category?: string };

function redact(text: string) {
  return text
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email redacted]")
    .replace(/(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, "[phone redacted]")
    .slice(0, 3000);
}

function sessionHash(req: NextRequest) {
  const raw = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("user-agent") || crypto.randomUUID();
  return crypto.createHash("sha256").update(raw + (process.env.SUPABASE_URL || "sugar-papi")).digest("hex").slice(0, 32);
}

async function supabase(path: string, init: RequestInit = {}) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    cache: "no-store",
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: ChatMessage[] = Array.isArray(body?.messages)
      ? body.messages.filter((m: ChatMessage) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string").slice(-12)
      : [];

    if (!messages.length) return NextResponse.json({ error: "No message provided" }, { status: 400 });
    if (!process.env.AI_GATEWAY_API_KEY) return NextResponse.json({ error: "AI help is temporarily unavailable." }, { status: 503 });

    let learnedKnowledge = "";
    try {
      const knowledgeResponse = await supabase("ai_knowledge?active=eq.true&select=question,answer,category&order=updated_at.desc&limit=30");
      if (knowledgeResponse?.ok) {
        const rows = (await knowledgeResponse.json()) as KnowledgeRow[];
        learnedKnowledge = rows.map((r) => `Q: ${r.question}\nA: ${r.answer}`).join("\n\n");
      }
    } catch (error) {
      console.error("Knowledge read error", error);
    }

    const response = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.AI_GATEWAY_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai/gpt-5-mini",
        messages: [
          { role: "system", content: `${SITE_KNOWLEDGE}\n${learnedKnowledge ? `Owner-approved learned knowledge:\n${learnedKnowledge}` : ""}` },
          ...messages,
        ],
        temperature: 0.35,
        max_tokens: 350,
      }),
    });

    if (!response.ok) {
      console.error("AI Gateway error", response.status, await response.text());
      return NextResponse.json({ error: "I couldn't answer that right now. Please try again." }, { status: 502 });
    }

    const data = await response.json();
    const answer = data?.choices?.[0]?.message?.content?.trim();
    if (!answer) return NextResponse.json({ error: "I couldn't answer that right now." }, { status: 502 });

    const latestUser = [...messages].reverse().find((m) => m.role === "user")?.content || "";
    try {
      await supabase("ai_conversations", {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          session_id: sessionHash(req),
          user_message: redact(latestUser),
          assistant_message: redact(answer),
          resolved: !/I don.?t know|not sure|cannot confirm|can't confirm/i.test(answer),
        }),
      });
    } catch (error) {
      console.error("Conversation log error", error);
    }

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Help agent error", error);
    return NextResponse.json({ error: "I couldn't answer that right now. Please try again." }, { status: 500 });
  }
}
