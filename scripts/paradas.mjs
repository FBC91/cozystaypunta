// Asigna cada casa a la parada del recorrido más cercana (por coordenadas).
// Cada parada con casas recibe como máximo ceil(n / paradas) casas, así se reparten parejas.

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

export function asignarParadas(casas, paradas = PARADAS_CASAS) {
  const cupo = Math.max(1, Math.ceil(casas.length / paradas.length));
  const usados = new Map(paradas.map((p) => [p.id, 0]));
  const asignada = new Map();

  // Las que tienen parada fijada a mano van primero.
  for (const c of casas) {
    if (c.parada && usados.has(c.parada)) {
      asignada.set(c.id, c.parada);
      usados.set(c.parada, usados.get(c.parada) + 1);
    }
  }

  // Pares casa-parada ordenados por distancia: el par más cercano se asigna primero.
  const pares = [];
  for (const c of casas) {
    if (asignada.has(c.id) || c.lat == null || c.lng == null) continue;
    for (const p of paradas) pares.push({ c, p, d: distanciaKm(c, p) });
  }
  pares.sort((a, b) => a.d - b.d);
  for (const { c, p } of pares) {
    if (asignada.has(c.id) || usados.get(p.id) >= cupo) continue;
    asignada.set(c.id, p.id);
    usados.set(p.id, usados.get(p.id) + 1);
  }

  // Sin coordenadas: a la parada con más lugar libre.
  for (const c of casas) {
    if (asignada.has(c.id)) continue;
    const libre = [...usados.entries()].sort((a, b) => a[1] - b[1])[0][0];
    asignada.set(c.id, libre);
    usados.set(libre, usados.get(libre) + 1);
  }

  const orden = new Map(paradas.map((p, i) => [p.id, i]));
  return casas
    .map((c) => ({ ...c, parada: asignada.get(c.id) }))
    .sort((a, b) => orden.get(a.parada) - orden.get(b.parada) || (a.orden ?? 0) - (b.orden ?? 0));
}
