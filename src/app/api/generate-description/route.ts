import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const CATEGORY_VOICE: Record<string, string> = {
  heels: 'Speak about silhouette, heel height, comfort, and the occasion. Reference outfit pairings.',
  flats: 'Mention comfort, ease, footbed, and where they fit best — home, errands, long days.',
  handbags: 'Highlight structure, hardware, daily versatility, and what fits inside.',
  tote: 'Mention capacity, what it carries, and how it holds its shape through the day.',
  crossbody: 'Speak about hands-free ease, strap, silhouette, and day-to-evening versatility.',
  mini: 'Be poetic about presence-over-size. Reference evenings, finishing touches, the essentials it holds.',
};

const STYLE_OPTIONS: Record<string, { hint: string; words: number }> = {
  poetic: {
    hint: 'Lyrical and emotional. Two short rhythmic sentences that paint a picture. Focus on feeling, not features.',
    words: 50,
  },
  punchy: {
    hint: 'Two confident sentences. Lead with the strongest hook, follow with why it matters.',
    words: 45,
  },
  detailed: {
    hint: 'Three sentences. Open with intrigue, describe the key features concretely, end with how it makes the customer feel or look.',
    words: 80,
  },
};

const VARIATION_HINTS = [
  '',
  'Use a completely different opening angle than you normally would.',
  'Start with a scene or moment the customer might find themselves in.',
  'Lead with the benefit, not the product.',
  'Open with a sensory detail — touch, sight, or movement.',
];

export async function POST(req: NextRequest) {
  try {
    const { productName, whatMakesItSpecial, category, style, attempt } = await req.json();

    const voice = CATEGORY_VOICE[category as string] ?? 'Balanced and warm. Skip generic language.';
    const { hint: styleHint, words: wordLimit } = STYLE_OPTIONS[style as string] ?? STYLE_OPTIONS.punchy;
    const variationHint = VARIATION_HINTS[Math.min(attempt ?? 0, VARIATION_HINTS.length - 1)];

    const userMessage = [
      `Product name: ${productName}`,
      category ? `Category: ${category}` : '',
      whatMakesItSpecial ? `Special details: ${whatMakesItSpecial}` : '',
      variationHint ? `Angle: ${variationHint}` : '',
    ].filter(Boolean).join('\n');

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a senior copywriter for Luxury Steps Boutique, a premium shoes & bags boutique in Ghana. Write product descriptions that make people want to buy.

CATEGORY VOICE: ${voice}

STYLE: ${styleHint}

HARD RULES — never break these:
- Never mention any person by name. Brand is "Luxury Steps Boutique" only.
- No em-dashes (—) or en-dashes (–). Use commas or short hyphens only.
- Banned words: "elevate", "discover", "indulge", "immerse", "curated", "embodies", "embraces", "exquisite", "timeless", "epitome", "essence", "transcends", "reimagined", "craftsmanship", "meticulously", "luxurious", "elegant".
- Never start with "Introducing", "Discover", "Step into", or "Experience".
- No bullet points or lists. Flowing prose only.
- No clichés: "must-have", "iconic", "statement piece", "wardrobe staple", "game-changer".
- Use specific, vivid words. Show don't tell.
- Sound like a knowledgeable friend, not a marketing robot.
- Maximum ${wordLimit} words.

OUTPUT: Just the description. No quotes, no preamble, no explanation.`,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
      temperature: attempt > 0 ? 0.95 : 0.82,
      max_tokens: 250,
    });

    const description = completion.choices[0]?.message?.content?.trim();
    if (!description) throw new Error('Empty response');

    const cleaned = description
      .replace(/[—–]/g, ',')
      .replace(/,\s*,/g, ',')
      .replace(/^["']|["']$/g, '');

    return NextResponse.json({ description: cleaned });
  } catch {
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
