#!/usr/bin/env node
// Sincroniza las casas publicadas en el perfil de Airbnb de la anfitriona.
// Escribe src/data/propiedades.json solo si algo cambió.
// Si Airbnb no responde o el perfil viene vacío, NO toca nada y sale con error.

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { fetchHtml, parseListing, parseProfile, profileUrl, roomUrl } from './airbnb.mjs';
import { asignarParadas } from './paradas.mjs';

const PERFIL = process.env.AIRBNB_PROFILE_ID ?? '1779800486321737448';
const raiz = new URL('../', import.meta.url);
const rutaDatos = fileURLToPath(new URL('src/data/propiedades.json', raiz));
const rutaAjustes = fileURLToPath(new URL('src/data/ajustes.json', raiz));

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

async function conReintentos(fn, intentos = 3) {
  let ultimo;
  for (let i = 0; i < intentos; i++) {
    try {
      return await fn();
    } catch (e) {
      ultimo = e;
      await esperar(2000 * (i + 1));
    }
  }
  throw ultimo;
}

const leerJson = async (ruta, porDefecto) => {
  try {
    return JSON.parse(await readFile(ruta, 'utf8'));
  } catch {
    return porDefecto;
  }
};

async function main() {
  const anterior = await leerJson(rutaDatos, { propiedades: [] });
  const ajustes = await leerJson(rutaAjustes, {});

  const perfilHtml = await conReintentos(() => fetchHtml(profileUrl(PERFIL), 'en-US,en;q=0.9'));
  const { hostName, listingIds } = parseProfile(perfilHtml);
  if (!listingIds.length) throw new Error('El perfil no devolvió avisos: no se modifica nada.');
  console.log(`Perfil de ${hostName ?? '?'}: ${listingIds.length} avisos`);

  const previas = new Map(anterior.propiedades.map((p) => [p.id, p]));
  const propiedades = [];
  let fallos = 0;
  for (const id of listingIds) {
    try {
      const html = await conReintentos(() => fetchHtml(roomUrl(id)));
      const p = parseListing(html, id);
      if (!p.fotos.length) throw new Error('sin fotos');
      propiedades.push(p);
      console.log(`  ✓ ${id} · ${p.nombre} · ${p.fotos.length} fotos`);
    } catch (e) {
      fallos++;
      const previa = previas.get(id);
      console.warn(`  ✗ ${id}: ${e.message}${previa ? ' (se conservan los datos anteriores)' : ''}`);
      if (previa) propiedades.push(previa);
    }
    await esperar(1500);
  }
  if (!propiedades.length || fallos === listingIds.length) {
    throw new Error('No se pudo leer ningún aviso: no se modifica nada.');
  }

  // Ajustes manuales (ocultar, renombrar, corregir barrio o parada).
  const visibles = propiedades
    .map((p) => ({ ...p, ...(ajustes[p.id] ?? {}) }))
    .filter((p) => !p.oculta);
  const conParada = asignarParadas(visibles);

  const salida = {
    anfitriona: { nombre: hostName, perfil: `https://www.airbnb.com/users/show/${PERFIL}` },
    propiedades: conParada,
  };
  const sinFecha = (o) => JSON.stringify({ ...o, actualizado: undefined });
  if (sinFecha(salida) === sinFecha(anterior)) {
    console.log('Sin cambios.');
    return;
  }
  await writeFile(
    rutaDatos,
    JSON.stringify({ actualizado: new Date().toISOString(), ...salida }, null, 2) + '\n',
  );
  console.log(`Guardado: ${conParada.length} casas visibles.`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
