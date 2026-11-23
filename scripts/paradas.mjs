// Reparte las casas entre las paradas del recorrido (por coordenadas).
//
// Reglas:
// 1. Las casas con parada fijada a mano (ajustes.json) van primero.
// 2. Ninguna parada activa queda vacía: cada una recibe la casa libre más cercana.
// 3. Las que sobran van a la parada más cercana con lugar (cupo = ceil(casas / paradas)).
// 4. Las paradas «extra» solo se activan si hay más casas que paradas fijas; si hay varias
//    combinaciones posibles, se elige la que deja las casas más cerca de su parada.

import { readFileSync } from 'node:fs';

const recorrido = JSON.parse(
  readFileSync(new URL('../src/data/recorrido.json', import.meta.url), 'utf8'),
);
export const PARADAS_CASAS = recorrido.filter((p) => p.casas);

const rad = (g) => (g * Math.PI) / 180;
export function distanciaKm(a, b) {
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

function* combinaciones(lista, k, desde = 0, actual = []) {
  if (actual.length === k) {
    yield actual;
    return;
  }
  for (let i = desde; i < lista.length; i++) yield* combinaciones(lista, k, i + 1, [...actual, lista[i]]);
}

function repartir(casas, activas) {
  const cupo = Math.max(1, Math.ceil(casas.length / activas.length));
  const usados = new Map(activas.map((p) => [p.id, 0]));
  const asignada = new Map();
  let costo = 0;
  const poner = (c, id, d = 0) => {
    asignada.set(c.id, id);
    usados.set(id, usados.get(id) + 1);
    costo += d;
  };

  // 1. Fijadas a mano.
  for (const c of casas) if (c.parada && usados.has(c.parada)) poner(c, c.parada);

  // Pares casa-parada, del más cercano al más lejano.
  const pares = [];
  for (const c of casas) {
    if (asignada.has(c.id) || c.lat == null || c.lng == null) continue;
    for (const p of activas) pares.push({ c, p, d: distanciaKm(c, p) });
  }
  pares.sort((a, b) => a.d - b.d);

  // 2. Cobertura: cada parada vacía se queda con la casa libre más cercana.
  for (const { c, p, d } of pares) {
    if (asignada.has(c.id) || usados.get(p.id) > 0) continue;
    poner(c, p.id, d);
  }
  // 3. El resto, a la parada más cercana con lugar.
  for (const { c, p, d } of pares) {
    if (asignada.has(c.id) || usados.get(p.id) >= cupo) continue;
    poner(c, p.id, d);
  }
  // 4. Sin coordenadas: a la parada con más lugar libre.
  for (const c of casas) {
    if (asignada.has(c.id)) continue;
    const libre = [...usados.entries()].sort((a, b) => a[1] - b[1])[0][0];
    poner(c, libre);
  }
  return { asignada, costo };
}

export function asignarParadas(casas, paradas = PARADAS_CASAS) {
  const fijadas = new Set(casas.map((c) => c.parada).filter(Boolean));
  const base = paradas.filter((p) => !p.extra || fijadas.has(p.id));
  const extras = paradas.filter((p) => p.extra && !fijadas.has(p.id));
  const sumar = Math.max(0, Math.min(extras.length, casas.length - base.length));

  let mejor;
  for (const combo of combinaciones(extras, sumar)) {
    const activas = paradas.filter((p) => base.includes(p) || combo.includes(p));
    const r = repartir(casas, activas);
    if (!mejor || r.costo < mejor.costo - 1e-9) mejor = r;
  }

  const orden = new Map(paradas.map((p, i) => [p.id, i]));
  return casas
    .map((c) => ({ ...c, parada: mejor.asignada.get(c.id) }))
    .sort((a, b) => orden.get(a.parada) - orden.get(b.parada) || (a.orden ?? 0) - (b.orden ?? 0));
}
