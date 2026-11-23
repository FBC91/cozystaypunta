// Lectura de páginas públicas de Airbnb (perfil de anfitrión y avisos).
// Funciones puras de parseo + un fetch con cabeceras de navegador.

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

export async function fetchHtml(url, lang = 'es-419,es;q=0.9') {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'text/html', 'Accept-Language': lang },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);
  return res.text();
}

export const profileUrl = (id) => `https://www.airbnb.com/users/profile/${id}`;
export const roomUrl = (id) => `https://es.airbnb.com/rooms/${id}`;

/** IDs de avisos publicados en un perfil, en orden de aparición. */
export function parseProfile(html) {
  const ids = new Set();
  for (const m of html.matchAll(/href="\/rooms\/(\d{5,25})/g)) ids.add(m[1]);
  for (const m of html.matchAll(/\/Hosting-(\d{5,25})\//g)) ids.add(m[1]);
  const name = html.match(/"displayFirstName":"([^"]+)"/)?.[1] ?? null;
  return { hostName: name, listingIds: [...ids] };
}

const decode = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

const meta = (html, prop) => {
  const m = html.match(new RegExp(`<meta property="og:${prop}" content="([^"]*)"`));
  return m ? decode(m[1]).trim() : null;
};

function deferredState(html) {
  const m = html.match(/<script id="data-deferred-state-0"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

const num = (re, s) => {
  const m = s?.match(re);
  return m ? Number(m[1]) : null;
};

/** Datos de un aviso a partir de su HTML. */
export function parseListing(html, id) {
  const ogTitle = meta(html, 'title'); // «Vivienda rentada · Punta del Este · ★Nuevo · 2 habitaciones · 4 camas · 2 baños»
  const nombre = meta(html, 'description'); // título que puso la anfitriona
  if (!ogTitle || !nombre) throw new Error(`Aviso ${id}: faltan metadatos (¿bloqueo de Airbnb?)`);

  const partes = ogTitle.split('·').map((p) => p.trim());
  const tipo = partes[0] ?? null;
  const ciudad = partes[1] ?? null;
  const estrella = partes.find((p) => p.startsWith('★')) ?? null;
  const ratingTexto = estrella ? estrella.slice(1).trim() : null;
  const rating = ratingTexto && /^\d/.test(ratingTexto) ? Number(ratingTexto.replace(',', '.')) : null;

  const state = deferredState(html);
  const node = state?.niobeClientData?.[0]?.[1]?.data?.node ?? {};
  const coord = node?.location?.coordinate ?? node?.pdpPresentation?.location ?? {};
  const stats = node?.listingRatingStats?.overallRatingStats ?? {};

  const huespedes =
    Number(node?.personCapacity) || num(/"personCapacity":"?(\d+)/, html) || null;

  const fotoRe = new RegExp(
    `https://a0\\.muscache\\.com/im/pictures/(?:[A-Za-z-]+/)?Hosting-${id}/[^"?\\\\\\s]+\\.(?:jpe?g|png|webp)`,
    'gi',
  );
  const fotos = [...new Set([...html.matchAll(fotoRe)].map((m) => m[0]))];

  const reviewCount = Number(stats.ratingCount ?? num(/"reviewCount":"?(\d+)/, html) ?? 0) || 0;
  const ratingAverage = Number(stats.ratingAverage) || rating || null;

  return {
    id: String(id),
    url: `https://www.airbnb.com/rooms/${id}`,
    nombre,
    tipo,
    ciudad,
    barrio: barrioDesde(nombre, ciudad),
    huespedes,
    habitaciones: num(/(\d+)\s+(?:habitaci|dormitorio|bedroom)/i, ogTitle),
    camas: num(/(\d+)\s+(?:cama|bed\b|beds)/i, ogTitle),
    banos: num(/(\d+(?:\.5)?)\s+(?:baño|bath)/i, ogTitle?.replace(/(\d),(\d)/g, '$1.$2')),
    nuevo: node?.isNewListing === true || /nuev|new/i.test(ratingTexto ?? ''),
    calificacion: reviewCount > 0 ? ratingAverage : null,
    resenas: reviewCount,
    lat: typeof coord.latitude === 'number' ? coord.latitude : null,
    lng: typeof coord.longitude === 'number' ? coord.longitude : null,
    fotos,
  };
}

/** «Torre Cristal hermoso apartamento Playa Brava P3» → «Playa Brava, parada 3». */
export function barrioDesde(texto, ciudad) {
  const t = (texto ?? '').toLowerCase();
  const parada = t.match(/\b(?:p|pda|parada)\.?\s?(\d{1,2})\b/)?.[1];
  const zonas = [
    ['pinares', 'Pinares'],
    ['jose ignacio', 'José Ignacio'],
    ['josé ignacio', 'José Ignacio'],
    ['manantiales', 'Manantiales'],
    ['la barra', 'La Barra'],
    ['peninsula', 'Península'],
    ['península', 'Península'],
    ['punta ballena', 'Punta Ballena'],
    ['roosevelt', 'Roosevelt'],
    ['aidy grill', 'Aidy Grill'],
  ];
  const playa = t.includes('brava') ? 'Playa Brava' : t.includes('mansa') ? 'Playa Mansa' : null;
  const zona = zonas.find(([k]) => t.includes(k))?.[1] ?? null;
  const partes = [];
  if (zona) partes.push(zona);
  if (playa) partes.push(parada ? `${playa}, parada ${Number(parada)}` : playa);
  else if (parada) partes.push(`Parada ${Number(parada)}`);
  if (!partes.length) return ciudad ?? 'Punta del Este';
  return partes.join(' · ');
}
