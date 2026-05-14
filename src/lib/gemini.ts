import OpenAI from 'openai';

const getClient = () => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey || apiKey === 'PASTE_YOUR_KEY_HERE') {
    throw new Error('VITE_GROQ_API_KEY is missing. Add it to your .env file and restart the dev server.');
  }
  return new OpenAI({
    apiKey,
    baseURL: 'https://api.groq.com/openai/v1',
    dangerouslyAllowBrowser: true
  });
};

const MODEL = 'llama-3.3-70b-versatile';

// ─── Oracle chat ─────────────────────────────────────────────────────────────

export const getOracleResponse = async (
  userMessage: string,
  profile: any,
  context?: { anchors: any[], expeditions: any[], memories?: any[], artifacts?: any[], bridges?: any[] },
  _currentImage?: { mimeType: string, data: string }
) => {
  const client = getClient();

  const anchorsText = context?.anchors?.map((a: any) => `- ${a.name}${a.impact ? `: ${a.impact}` : ''}`).join('\n') || 'None saved.';
  const activitiesText = context?.expeditions?.map((e: any) => `- ${e.activity}${e.resonance ? `: ${e.resonance}` : ''}`).join('\n') || 'None logged.';
  const memoriesText = context?.memories?.map((m: any) => `- ${m.text}`).join('\n') || 'No journal entries yet.';
  const artifactsText = context?.artifacts?.map((a: any) => `- [${a.type}] ${a.name}`).join('\n') || 'No favorites saved.';
  const bridgesText = context?.bridges?.map((b: any) => `- ${b.platform}: ${b.url}`).join('\n') || 'No links saved.';

  const systemPrompt = `You are ANAIS, a personal AI assistant. You are honest, thoughtful, and direct — not flattering, not preachy.
You know this person well because you have access to their journal entries, favorite things, saved places, activities, and personal links below.
Use that context to give relevant, specific responses rather than generic ones.

What you know about this person:
- Favorite things (movies, music, books, etc.): ${artifactsText}
- Journal entries: ${memoriesText}
- Places that matter to them: ${anchorsText}
- Activities they do: ${activitiesText}
- Their online profiles and links: ${bridgesText}
- App level: ${profile?.lvl}

How to respond:
- Be clear and direct. Plain sentences, no jargon.
- Reference their actual data when it's relevant — their real favorites, entries, and places, not generic examples.
- If they share something personal, engage with it honestly. Ask a follow-up if something seems worth exploring.
- Keep responses focused — a paragraph or two is usually right. Don't over-explain.
- Never be sycophantic. Don't say "great question" or "absolutely!".`;

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ]
  });

  return response.choices[0].message.content || 'No response.';
};

// ─── Reflective diary conversation ───────────────────────────────────────────

export const getDiaryReflection = async (
  entry: string,
  conversationHistory: { role: 'user' | 'ai', content: string }[],
  stage: 'questions' | 'reflect' | 'followup'
): Promise<string> => {
  const client = getClient();

  const stageInstruction =
    stage === 'questions'
      ? `This is your FIRST response to this entry. You must ONLY ask clarifying questions — no observations, no reflection yet.
Ask 2 to 3 genuine questions that will help you understand the situation more fully before you comment on anything.
The questions should invite the user to expand on their own thinking. Keep them brief and conversational.
Do not explain that you are asking questions — just ask them.`
      : stage === 'reflect'
      ? `The user has answered your questions. Now offer your reflection.
You are watching for four patterns: closed thinking (dismissing other perspectives), distrust without evidence, vanity (prioritising self-image over the situation), and selfishness (considering only how things affect yourself).
When you notice these patterns, name them gently and with curiosity — not as conclusions, but as possibilities worth considering.
Frame things as: "I notice...", "I'm curious whether...", "It might be worth asking yourself..."
Be specific to what they actually wrote — not generic. Limit to 2-3 observations.
Your goal is to help them become more open, more trusting of others, and more genuinely confident in themselves.`
      : `Continue the conversation honestly.
If the user pushes back and says you misread something, accept the correction directly and adjust your thinking.
If they add new context, incorporate it into your understanding.
Never repeat an observation you have already made in this conversation.`;

  const systemPrompt = `You are a private reflective thinking partner. Your role is to help the user examine their own thinking with honesty and care.
You are never harsh, never preachy, and you never lecture. You ask before you conclude.

The user's diary entry:
---
${entry}
---

${stageInstruction}`;

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt }
  ];

  for (const msg of conversationHistory) {
    messages.push({
      role: msg.role === 'ai' ? 'assistant' : 'user',
      content: msg.content
    });
  }

  if (stage === 'questions') {
    messages.push({ role: 'user', content: 'Please read my entry.' });
  }

  const response = await client.chat.completions.create({
    model: MODEL,
    messages
  });

  return response.choices[0].message.content || "I'm having trouble responding right now. Please try again.";
};

// ─── Discovery recommendations ────────────────────────────────────────────────

export const generateRecommendations = async (
  profile: any,
  context: { anchors: any[], expeditions: any[], memories: any[], artifacts: any[], bridges: any[] }
) => {
  const client = getClient();

  const anchorsText = context.anchors.map((a: any) => a.name).join(', ') || 'none';
  const memoriesText = context.memories.slice(0, 5).map((m: any) => m.text).join('; ') || 'none';
  const artifactsText = context.artifacts.map((a: any) => `${a.name} (${a.type})`).join(', ') || 'none';
  const bridgesText = context.bridges.map((b: any) => b.platform).join(', ') || 'none';

  const systemPrompt = `You are ANAIS, a personal AI assistant. Generate 4-5 recommendations tailored to this specific person based on their data below.

What you know about this person:
- Favorite things: ${artifactsText}
- Recent journal entries: ${memoriesText}
- Places they love: ${anchorsText}
- Their online profiles: ${bridgesText}

Generate recommendations across different categories (movie, book, comic, website, music, place, event).
Each recommendation should be something genuinely good that fits their taste — not generic, not obvious.
The description should explain in plain language why it matches them specifically, based on their actual data.

Return valid JSON only, as an array matching this structure exactly:
[
  {
    "category": "movie",
    "title": "string",
    "description": "One sentence explaining why this fits them (max 20 words)",
    "url": "optional URL string or omit the field",
    "resonanceScore": 85
  }
]`;

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: 'Generate my recommendations.' }
    ],
    response_format: { type: 'json_object' }
  });

  const raw = response.choices[0].message.content || '[]';

  try {
    const parsed = JSON.parse(raw);
    // Handle both { recommendations: [...] } and plain array responses
    return Array.isArray(parsed) ? parsed : (parsed.recommendations || parsed.results || []);
  } catch {
    console.error('Failed to parse recommendations JSON:', raw);
    return [];
  }
};
