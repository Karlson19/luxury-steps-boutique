import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SHOE_FALLBACK = { material: 'Premium upper',    care: ['Wipe clean with a dry cloth', 'Air dry away from heat', 'Condition leather regularly'] };
const BAG_FALLBACK  = { material: 'Quality material', care: ['Spot clean only', 'Store stuffed to keep shape', 'Keep in the dust bag'] };

const FALLBACK: Record<string, { material: string; care: string[] }> = {
  heels:     SHOE_FALLBACK,
  flats:     SHOE_FALLBACK,
  handbags:  BAG_FALLBACK,
  tote:      BAG_FALLBACK,
  crossbody: BAG_FALLBACK,
  mini:      BAG_FALLBACK,
};

export async function POST(req: NextRequest) {
  let category = 'heels';
  try {
    const body = await req.json();
    const { productName, details } = body;
    category = body.category ?? 'heels';

    const detailsText = Array.isArray(details) && details.length > 0
      ? `Product details: ${details.join(', ')}`
      : '';

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a product care expert for Luxury Steps Boutique, a premium shoes & bags boutique in Ghana.

Given a product name, category, and details, return a JSON object with:
- "material": a short (2–5 word) material label inferred from the product name/category/details
- "care": an array of exactly 3 care instruction strings. Each must be a complete, grammatically correct sentence under 10 words. Real, practical advice only.

CATEGORY-SPECIFIC CARE RULES — follow these exactly:

heels (stilettos, pointed-toe, platform heels):
  → Wipe clean with a barely-damp cloth
  → Air dry away from direct heat
  → Use a conditioner or protector spray regularly

flats (flat slippers, slide sandals, home slippers):
  → Wipe clean with a soft damp cloth
  → Air dry — never use the dryer
  → Store in a cool, dry place away from sunlight

handbags (classic structured bags):
  → Spot clean only with a soft damp cloth
  → Stuff with tissue to keep the shape
  → Keep in the dust bag away from moisture

tote (tote bags, roomy everyday carries):
  → Spot clean gently with a soft damp cloth
  → Store empty and upright to keep the shape
  → Keep in the dust bag away from sunlight

crossbody (crossbody & shoulder bags):
  → Wipe with a soft, barely-damp cloth
  → Store the strap inside to avoid creasing
  → Keep in the dust bag away from moisture

mini (clutches and mini bags):
  → Spot clean only — avoid soaking
  → Store flat in the dust bag
  → Keep chains tucked inside to prevent scratching

HARD RULES:
- Output ONLY raw JSON. No markdown, no code fences, no explanation.
- Every care string must be grammatically correct and make real-world sense.
- Never use vague phrases like "handle with care" alone, "store out reach", or "wash hands".
- material must be honest — not marketing language.

Example: {"material":"Stainless steel","care":["Wipe dry with a soft cloth after wearing","Avoid perfume, lotion, and water contact","Store in a pouch away from other pieces"]}`,
        },
        {
          role: 'user',
          content: `Product: ${productName}\nCategory: ${category}\n${detailsText}`,
        },
      ],
      temperature: 0.4,
      max_tokens: 200,
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? '';
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    if (!parsed.material || !Array.isArray(parsed.care)) throw new Error('Invalid shape');

    return NextResponse.json({
      material: String(parsed.material),
      care: (parsed.care as unknown[]).slice(0, 4).map(String),
    });
  } catch {
    // Always return something usable — never a 500 that breaks the UI
    const fallback = FALLBACK[category] ?? FALLBACK.heels;
    return NextResponse.json(fallback);
  }
}
