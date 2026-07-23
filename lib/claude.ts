// Shared Anthropic Messages client.
//
// app/api/chatbot/route.ts and app/api/jobs/resume/route.ts each carry their
// own near-identical copy of this logic. Both can be switched to import from
// here whenever you next touch them - the signatures match.

const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
const CLAUDE_API_VERSION = "2023-06-01";

export const CLAUDE_MODEL =
  process.env.CLAUDE_MODEL || "claude-haiku-4-5-20251001";

export type ChatTurn = { role: "user" | "assistant"; content: string };

export async function callClaudeWithRetry(
  systemPrompt: string,
  messages: ChatTurn[],
  { maxTokens = 1600, maxRetries = 2 } = {},
) {
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(CLAUDE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY as string,
          "anthropic-version": CLAUDE_API_VERSION,
        },
        body: JSON.stringify({
          model: CLAUDE_MODEL,
          max_tokens: maxTokens,
          system: systemPrompt,
          messages,
        }),
      });

      const data = await response.json();
      if (response.ok) return { data, ok: true as const };

      // 429 = rate limited, 529 = overloaded, 5xx = transient.
      if (
        (response.status === 429 ||
          response.status === 529 ||
          response.status >= 500) &&
        attempt < maxRetries
      ) {
        await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempt)));
        lastError = data;
        continue;
      }

      console.error("Claude error:", data);
      return { data, ok: false as const };
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempt)));
        continue;
      }
    }
  }

  console.error("Claude error after retries:", lastError);
  return { data: null, ok: false as const };
}

export function getAssistantText(data: unknown): string | null {
  const maybe = data as { content?: { type?: string; text?: string }[] };
  const text =
    maybe.content
      ?.filter((b) => b.type === "text")
      .map((b) => b.text ?? "")
      .join("") ?? "";
  return text.trim().length > 0 ? text : null;
}

// Pull the first {...} object out of model text, tolerating stray prose or
// ```json fences.
export function extractJson(text: string): string | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  return candidate.slice(start, end + 1);
}
