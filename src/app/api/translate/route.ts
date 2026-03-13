import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/translate
 * Body: { texts: Record<string, string> }
 * Returns: { translations: Record<string, string> }
 *
 * Translates multiple Korean texts to English using Google Translate.
 * Keys are preserved so the caller can map results back to fields.
 */
export async function POST(req: NextRequest) {
  try {
    const { texts } = (await req.json()) as { texts: Record<string, string> };

    if (!texts || typeof texts !== 'object') {
      return NextResponse.json({ error: 'texts object required' }, { status: 400 });
    }

    const entries = Object.entries(texts).filter(([, v]) => v.trim());
    if (entries.length === 0) {
      return NextResponse.json({ translations: {} });
    }

    const translations: Record<string, string> = {};

    // Translate each text individually to preserve mapping
    await Promise.all(
      entries.map(async ([key, text]) => {
        try {
          const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ko&tl=en&dt=t&q=${encodeURIComponent(text)}`;
          const res = await fetch(url);
          const data = await res.json();
          // Response format: [[["translated text","original text",...],...],...]
          const translated = (data[0] as Array<[string]>)
            .map((seg: [string]) => seg[0])
            .join('');
          translations[key] = translated;
        } catch {
          translations[key] = '';
        }
      }),
    );

    return NextResponse.json({ translations });
  } catch {
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
