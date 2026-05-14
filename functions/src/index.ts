import { onSchedule } from 'firebase-functions/v2/scheduler';
import { defineSecret } from 'firebase-functions/params';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import OpenAI from 'openai';
import { Resend } from 'resend';

initializeApp();

const DB_ID = 'ai-studio-98cc1847-0c7c-4588-a90d-cc490c697013';
const USER_EMAIL = 'mumblejinx@gmail.com';
const MODEL = 'llama-3.3-70b-versatile';

const resendKey = defineSecret('RESEND_API_KEY');
const groqKey = defineSecret('GROQ_API_KEY');
const tavilyKey = defineSecret('TAVILY_API_KEY');

const STOIC_QUOTES = [
  'Confine yourself to the present.',
  'Waste no more time arguing what a good man should be. Be one.',
  'If it is not right, do not do it; if it is not true, do not say it.',
  'You have power over your mind — not outside events. Realize this, and you will find strength.',
  'The obstacle is the way.',
  'He who fears death will never do anything worthy of a living man.',
  'It never troubles the wolf how many the sheep may be.',
];

const fmtDate = (d: Date) => d.toISOString().split('T')[0];

function isFirstSundayOfMonth(): boolean {
  const now = new Date();
  return now.getDay() === 0 && now.getDate() <= 7;
}

async function searchWeb(q: string, apiKey: string): Promise<string> {
  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: apiKey, query: q, search_depth: 'basic', max_results: 5 }),
  });
  const data = await res.json() as any;
  return ((data.results ?? []) as any[])
    .map(r => `${r.title}: ${(r.content ?? '').slice(0, 200)}`)
    .join('\n');
}

async function generateMonthlyRecs(
  uid: string,
  db: FirebaseFirestore.Firestore,
  groq: OpenAI,
  tavily: string,
  artifacts: any[],
  memories: any[],
  anchors: any[]
): Promise<any[]> {
  const month = new Date().toISOString().slice(0, 7); // YYYY-MM

  // Skip if already generated this month
  const existing = await db.collection('users').doc(uid).collection('recommendations')
    .where('source', '==', 'monthly').where('month', '==', month).get();
  if (!existing.empty) {
    console.log('Monthly recs already exist for', month);
    return existing.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  // Pull previous ratings for context
  const ratedSnap = await db.collection('users').doc(uid).collection('recommendations')
    .where('rated', '==', true).orderBy('createdAt', 'desc').limit(10).get();
  const ratedContext = ratedSnap.empty
    ? 'No previous ratings yet.'
    : ratedSnap.docs.map(d => {
        const r = d.data();
        return `${r.title} (${r.category}): rated ${r.rating}/5${r.ratingText ? ` — "${r.ratingText}"` : ''}`;
      }).join('\n');

  const interests = artifacts.slice(0, 8).map((a: any) => a.name).join(', ') || 'general culture';
  const monthLabel = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Tavily searches in parallel
  const [moviesSearch, musicSearch, booksSearch, eventsSearch] = await Promise.all([
    searchWeb(`new and upcoming movies ${monthLabel}`, tavily),
    searchWeb(`new music releases ${monthLabel} ${interests}`, tavily),
    searchWeb(`new books published ${monthLabel}`, tavily),
    searchWeb(`upcoming events and experiences ${monthLabel}`, tavily),
  ]);

  const searchContext = [
    `MOVIES:\n${moviesSearch}`,
    `MUSIC:\n${musicSearch}`,
    `BOOKS:\n${booksSearch}`,
    `EVENTS:\n${eventsSearch}`,
  ].join('\n\n---\n\n');

  const prompt = `You are ANAIS generating personalized monthly recommendations.

About this person:
- Favorites: ${artifacts.map((a: any) => `${a.name} (${a.type})`).join(', ') || 'none saved'}
- Recent journal themes: ${memories.slice(0, 3).map((m: any) => (m.text ?? '').slice(0, 80)).join(' | ') || 'none'}
- Places they love: ${anchors.map((a: any) => a.name).join(', ') || 'none'}

What they've previously rated:
${ratedContext}

Current web search results for new and upcoming content in ${monthLabel}:
${searchContext}

Generate exactly 5 recommendations. Prioritise NEW or UPCOMING content from the search results above.
Use different categories across: movie, book, comic, music, place, event, website.
Each description must explain specifically WHY it fits this person based on their actual data (max 25 words).
Factor in their previous ratings — avoid things similar to what they rated 1 or 2.

Return valid JSON only — a plain array (no wrapper object):
[{"category":"movie","title":"string","description":"why it fits them","url":"optional string","resonanceScore":85}]`;

  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });

  const raw = response.choices[0].message.content ?? '[]';
  let parsed: any[];
  try {
    const obj = JSON.parse(raw);
    parsed = Array.isArray(obj) ? obj : (obj.recommendations ?? obj.results ?? obj.data ?? []);
  } catch {
    console.error('Failed to parse monthly recs JSON:', raw);
    return [];
  }

  const saved: any[] = [];
  for (const rec of parsed.slice(0, 5)) {
    const ref = await db.collection('users').doc(uid).collection('recommendations').add({
      ...rec,
      source: 'monthly',
      month,
      rated: false,
      rating: null,
      ratingText: null,
      createdAt: FieldValue.serverTimestamp(),
    });
    saved.push({ id: ref.id, ...rec, source: 'monthly', month });
  }

  console.log(`Saved ${saved.length} monthly recommendations for ${month}`);
  return saved;
}

// ─── Scheduled function ───────────────────────────────────────────────────────

export const weeklyDigest = onSchedule(
  {
    schedule: '0 9 * * 0', // Every Sunday at 9am
    timeZone: 'America/New_York',
    secrets: [resendKey, groqKey, tavilyKey],
  },
  async () => {
    const db = getFirestore(DB_ID);
    const userRecord = await getAuth().getUserByEmail(USER_EMAIL);
    const uid = userRecord.uid;

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const sevenDaysAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const ref = (col: string) => db.collection('users').doc(uid).collection(col);

    // ── Weekly data ─────────────────────────────────────────────────────────

    const memoriesSnap = await ref('memories')
      .where('createdAt', '>=', Timestamp.fromDate(sevenDaysAgo))
      .orderBy('createdAt', 'desc').get();
    const memories = memoriesSnap.docs
      .map(d => (d.data().text as string) ?? '').filter(Boolean);

    const completedSnap = await ref('goals')
      .where('completed', '==', true)
      .where('targetDate', '>=', fmtDate(sevenDaysAgo))
      .where('targetDate', '<=', fmtDate(now)).get();
    const completedGoals = completedSnap.docs.map(d => d.data().title as string);

    const upcomingSnap = await ref('goals')
      .where('completed', '==', false)
      .where('targetDate', '>=', fmtDate(now))
      .where('targetDate', '<=', fmtDate(sevenDaysAhead))
      .orderBy('targetDate', 'asc').get();
    const upcomingGoals = upcomingSnap.docs.map(d => ({
      title: d.data().title as string,
      date: d.data().targetDate as string,
    }));

    const groq = new OpenAI({ apiKey: groqKey.value(), baseURL: 'https://api.groq.com/openai/v1' });

    // ── Weekly AI summary ────────────────────────────────────────────────────

    const summaryPrompt = `You are ANAIS writing a warm, honest weekly summary email (3-4 sentences, plain prose).
Journal entries this week (${memories.length}): ${memories.slice(0, 5).map(m => `"${m.slice(0, 100)}"`).join('; ') || 'None.'}
Goals completed: ${completedGoals.join(', ') || 'None.'}
Upcoming goals: ${upcomingGoals.map(g => `${g.title} on ${g.date}`).join(', ') || 'None set.'}
Reference what they actually did. End by acknowledging what's coming up. No flattery, no bullet points.`;

    const summaryRes = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: summaryPrompt }],
    });
    const aiSummary = summaryRes.choices[0].message.content ?? '';

    // ── Monthly recommendations (first Sunday only) ──────────────────────────

    let monthlyRecs: any[] = [];
    if (isFirstSundayOfMonth()) {
      const artifactsSnap = await ref('artifacts').get();
      const anchorsSnap = await ref('spatial_anchors').get();
      const recentMemSnap = await ref('memories').orderBy('createdAt', 'desc').limit(5).get();

      monthlyRecs = await generateMonthlyRecs(
        uid, db, groq, tavilyKey.value(),
        artifactsSnap.docs.map(d => d.data()),
        recentMemSnap.docs.map(d => d.data()),
        anchorsSnap.docs.map(d => d.data())
      );
    }

    // ── Send email ───────────────────────────────────────────────────────────

    const quote = STOIC_QUOTES[Math.floor(Math.random() * STOIC_QUOTES.length)];
    const weekStart = sevenDaysAgo.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    const weekEnd = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const html = buildEmail({
      weekRange: `${weekStart} – ${weekEnd}`,
      aiSummary,
      memories,
      completedGoals,
      upcomingGoals,
      quote,
      monthlyRecs,
    });

    const resend = new Resend(resendKey.value());
    await resend.emails.send({
      from: 'ANAIS <onboarding@resend.dev>',
      to: USER_EMAIL,
      subject: `Your week with ANAIS — ${weekEnd}`,
      html,
    });

    console.log(`Weekly digest sent to ${USER_EMAIL}. Monthly recs: ${monthlyRecs.length}`);
  }
);

// ─── Email template ───────────────────────────────────────────────────────────

interface EmailData {
  weekRange: string;
  aiSummary: string;
  memories: string[];
  completedGoals: string[];
  upcomingGoals: { title: string; date: string }[];
  quote: string;
  monthlyRecs: any[];
}

function buildEmail({ weekRange, aiSummary, memories, completedGoals, upcomingGoals, quote, monthlyRecs }: EmailData): string {
  const green = '#5BBF35';
  const bg = '#0e0e0e';
  const surface = '#131313';
  const muted = '#757575';
  const text = '#e4e4e4';
  const subtle = '#b0b0b0';

  const memoriesHtml = memories.length
    ? memories.slice(0, 5).map(m =>
        `<li style="margin-bottom:10px;color:${subtle};font-size:13px;line-height:1.6;">"${m.slice(0, 180)}${m.length > 180 ? '…' : ''}"</li>`
      ).join('')
    : `<li style="color:${muted};font-size:13px;">No entries this week.</li>`;

  const completedHtml = completedGoals.length
    ? completedGoals.map(g =>
        `<li style="margin-bottom:8px;color:${green};font-size:13px;">✓ ${g}</li>`
      ).join('')
    : `<li style="color:${muted};font-size:13px;">None this week.</li>`;

  const upcomingHtml = upcomingGoals.length
    ? upcomingGoals.map(g => {
        const label = new Date(g.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return `<li style="margin-bottom:8px;color:${subtle};font-size:13px;">${g.title} <span style="color:${green};font-size:11px;margin-left:6px;">${label}</span></li>`;
      }).join('')
    : `<li style="color:${muted};font-size:13px;">Nothing set yet.</li>`;

  const monthlySection = monthlyRecs.length === 0 ? '' : `
        <!-- Monthly Picks -->
        <tr>
          <td style="padding:32px 40px 0;background:${bg};">
            <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:${green};">This Month's Picks</p>
            <p style="margin:0 0 20px;font-size:12px;color:${muted};">Rate these in the app under Chat → Discover so ANAIS can learn your taste.</p>
            ${monthlyRecs.map(r => `
            <div style="margin-bottom:16px;padding:16px;border-left:4px solid ${green};background:${surface};">
              <p style="margin:0 0 4px;font-size:10px;font-weight:700;text-transform:uppercase;color:${green};">${r.category}</p>
              <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:${text};">${r.title}</p>
              <p style="margin:0;font-size:12px;color:${subtle};font-style:italic;">${r.description}</p>
              ${r.url ? `<a href="${r.url}" style="font-size:11px;color:${green};text-decoration:none;display:inline-block;margin-top:6px;">View →</a>` : ''}
            </div>`).join('')}
          </td>
        </tr>`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:${bg};font-family:Arial,sans-serif;color:${text};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${bg};padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:${bg};border-bottom:4px solid ${green};padding:32px 40px 24px;">
            <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:${green};font-weight:700;">ANAIS</p>
            <h1 style="margin:0 0 6px;font-size:30px;font-weight:800;letter-spacing:-1px;color:${text};">Weekly Summary</h1>
            <p style="margin:0;font-size:12px;color:${muted};text-transform:uppercase;letter-spacing:0.1em;">${weekRange}</p>
          </td>
        </tr>

        <!-- AI Summary -->
        <tr>
          <td style="background:${surface};padding:32px 40px;border-left:4px solid ${green};">
            <p style="margin:0;font-size:15px;line-height:1.75;color:${text};">${aiSummary}</p>
          </td>
        </tr>

        <!-- Journal -->
        <tr>
          <td style="padding:32px 40px 0;background:${bg};">
            <p style="margin:0 0 14px;font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:${green};">Journal This Week</p>
            <ul style="margin:0;padding-left:16px;">${memoriesHtml}</ul>
          </td>
        </tr>

        <!-- Completed Goals -->
        <tr>
          <td style="padding:32px 40px 0;background:${bg};">
            <p style="margin:0 0 14px;font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:${green};">Goals Completed</p>
            <ul style="margin:0;padding-left:16px;">${completedHtml}</ul>
          </td>
        </tr>

        <!-- Upcoming Goals -->
        <tr>
          <td style="padding:32px 40px 0;background:${bg};">
            <p style="margin:0 0 14px;font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:${green};">Coming Up</p>
            <ul style="margin:0;padding-left:16px;">${upcomingHtml}</ul>
          </td>
        </tr>

        ${monthlySection}

        <!-- Quote -->
        <tr>
          <td style="padding:32px 40px;background:${bg};">
            <p style="margin:0;font-size:13px;font-style:italic;color:${muted};border-top:1px solid #262626;padding-top:24px;">"${quote}"</p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px;background:${bg};border-top:1px solid #191919;">
            <p style="margin:0;font-size:10px;color:#484848;text-transform:uppercase;letter-spacing:0.1em;">ANAIS — Your personal AI assistant</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
