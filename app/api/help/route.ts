import { NextRequest, NextResponse } from "next/server";

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
- Public preview profiles illustrate the intended member experience and are not actual users. Do not imply sample profiles are real people.
- Privacy and discretion are central to the product. Do not request passwords, card numbers, government IDs, or other sensitive information in chat.
- The agent may guide a visitor through signup, explain the site, recommend the next page/action, troubleshoot common navigation issues, and answer membership questions.
- Never claim an account, payment, cancellation, match, verification, or other action was completed unless the website actually confirms it.
- Do not invent policies, refunds, guarantees, member counts, safety checks, or features not in this knowledge.
- If you do not know something, say so clearly and direct the visitor to the appropriate site/account area rather than guessing.
- Keep responses concise, warm, discreet, and practical. When useful, give a next step.
`;

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: ChatMessage[] = Array.isArray(body?.messages)
      ? body.messages.filter((m: ChatMessage) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string").slice(-12)
      : [];

    if (!messages.length) return NextResponse.json({ error: "No message provided" }, { status: 400 });
    if (!process.env.AI_GATEWAY_API_KEY) return NextResponse.json({ error: "AI help is temporarily unavailable." }, { status: 503 });

    const response = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.AI_GATEWAY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5-mini",
        messages: [{ role: "system", content: SITE_KNOWLEDGE }, ...messages],
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
    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Help agent error", error);
    return NextResponse.json({ error: "I couldn't answer that right now. Please try again." }, { status: 500 });
  }
}
