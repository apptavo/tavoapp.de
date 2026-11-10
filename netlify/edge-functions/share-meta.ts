// Netlify Edge Function: schreibt für die Teilen-Seiten /r/…, /u/…, /l/…, /i/… die Link-Vorschau (Open Graph + Twitter Card)
// direkt ins HTML – WhatsApp, iMessage, Telegram & Co. führen kein JavaScript aus.
// Titel, Beschreibung und Bild kommen von der Supabase-Funktion link-preview (nur öffentliche Daten, wie share.js).
// Die Seite selbst ist weiterhin 404.html (netlify.toml schreibt die Pfade mit Status 200 dorthin um), share.js zeigt den Inhalt.

const PREVIEW = 'https://lvfypkvaiextsmyrchxr.supabase.co/functions/v1/link-preview';
const SITE = 'https://tavoapp.de';

type Meta = { found: boolean; error?: boolean; title: string; description: string; image: string; imageAlt: string; url: string };

const FALLBACK: Meta = {
  found: false,
  error: true,
  title: 'Tavo – Dein Restaurant-Tagebuch',
  description: 'Restaurants bewerten, Lieblingsläden merken und Leuten mit gutem Geschmack folgen.',
  image: `${SITE}/og.jpg`,
  imageAlt: 'Tavo – Dein Restaurant-Tagebuch',
  url: SITE,
};

const esc = (s: string) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

async function loadMeta(path: string): Promise<Meta> {
  try {
    const r = await fetch(`${PREVIEW}?mode=meta&path=${encodeURIComponent(path)}`, { signal: AbortSignal.timeout(3500) });
    if (!r.ok) return { ...FALLBACK, url: SITE + path };
    const m = await r.json();
    if (typeof m?.title !== 'string' || typeof m?.image !== 'string') return { ...FALLBACK, url: SITE + path };
    // Bild nur von uns selbst bzw. der eigenen Supabase-Funktion
    if (!m.image.startsWith(`${PREVIEW}?`) && m.image !== `${SITE}/og.jpg`) m.image = `${SITE}/og.jpg`;
    return m as Meta;
  } catch {
    return { ...FALLBACK, url: SITE + path };
  }
}

function tags(m: Meta) {
  const title = m.title.includes('Tavo') ? m.title : `${m.title} – Tavo`;
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(m.description)}">`,
    `<link rel="canonical" href="${esc(m.url)}">`,
    '<meta property="og:type" content="website">',
    '<meta property="og:site_name" content="Tavo">',
    '<meta property="og:locale" content="de_DE">',
    `<meta property="og:title" content="${esc(m.title)}">`,
    `<meta property="og:description" content="${esc(m.description)}">`,
    `<meta property="og:url" content="${esc(m.url)}">`,
    `<meta property="og:image" content="${esc(m.image)}">`,
    '<meta property="og:image:type" content="image/jpeg">',
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    `<meta property="og:image:alt" content="${esc(m.imageAlt)}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${esc(m.title)}">`,
    `<meta name="twitter:description" content="${esc(m.description)}">`,
    `<meta name="twitter:image" content="${esc(m.image)}">`,
  ].join('\n');
}

export default async (request: Request, context: { next: () => Promise<Response> }) => {
  const path = new URL(request.url).pathname;
  const [page, meta] = await Promise.all([context.next(), loadMeta(path)]);
  const html = (await page.text())
    .replace(/<title>[\s\S]*?<\/title>\s*/, '')
    .replace(/<meta name="description"[^>]*>\s*/, '')
    .replace('</head>', `${tags(meta)}\n</head>`);
  // Gefunden → 200. Nicht öffentlich/gibt es nicht → 404. Supabase nicht erreichbar → 200 mit allgemeiner Vorschau
  const status = meta.found || meta.error ? 200 : 404;
  return new Response(html, {
    status,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=0, must-revalidate',
      // Netlify-CDN merkt sich die fertige Seite 5 Minuten (spart Aufrufe); bei Fehler gar nicht
      'netlify-cdn-cache-control': meta.error ? 'no-store' : 'public, durable, s-maxage=300, stale-while-revalidate=600',
    },
  });
};

export const config = { path: ['/r/*', '/u/*', '/l/*', '/i/*'], cache: 'manual' };
