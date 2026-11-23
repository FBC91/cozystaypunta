import { test } from 'node:test';
import assert from 'node:assert/strict';
import { barrioDesde, parseListing, parseProfile } from '../scripts/airbnb.mjs';
import { asignarParadas } from '../scripts/paradas.mjs';

const ID = '111222333444';
const listingHtml = ({ titulo, desc, nuevo = true, ratingCount = '0', ratingAverage = 0 }) => `
<meta property="og:title" content="${titulo}">
<meta property="og:description" content="${desc}">
<script id="data-deferred-state-0" type="application/json">${JSON.stringify({
  niobeClientData: [[
    'k',
    {
      data: {
        node: {
          personCapacity: 6,
          isNewListing: nuevo,
          location: { coordinate: { latitude: -34.95, longitude: -54.93 } },
          listingRatingStats: { overallRatingStats: { ratingCount, ratingAverage } },
        },
      },
    },
  ]],
})}</script>
<img src="https://a0.muscache.com/im/pictures/hosting/Hosting-${ID}/original/a.jpeg?im_w=720">
<img src="https://a0.muscache.com/im/pictures/AirbnbPlatformAssets/x/original/logo.png">
<img src="https://a0.muscache.com/im/pictures/hosting/Hosting-${ID}/original/b.jpeg">
<img src="https://a0.muscache.com/im/pictures/hosting/Hosting-${ID}/original/a.jpeg">`;

test('parseListing: aviso nuevo, sin reseñas', () => {
  const p = parseListing(
    listingHtml({
      titulo: 'Vivienda rentada · Punta del Este · ★Nuevo · 3 habitaciones · 4 camas · 2 baños',
      desc: 'Apto frente al mar en pda 10 de la mansa',
    }),
    ID,
  );
  assert.equal(p.huespedes, 6);
  assert.equal(p.habitaciones, 3);
  assert.equal(p.camas, 4);
  assert.equal(p.banos, 2);
  assert.equal(p.nuevo, true);
  assert.equal(p.calificacion, null);
  assert.equal(p.barrio, 'Playa Mansa, parada 10');
  assert.deepEqual(p.lat, -34.95);
  assert.equal(p.fotos.length, 2, 'solo fotos del aviso, sin duplicados ni íconos');
  assert.ok(!p.fotos[0].includes('?'));
});

test('parseListing: aviso con calificación', () => {
  const p = parseListing(
    listingHtml({
      titulo: 'Casa · Punta del Este · ★4,92 · 4 habitaciones · 8 camas · 2,5 baños',
      desc: 'Casa en Pinares',
      nuevo: false,
      ratingCount: '37',
      ratingAverage: 4.92,
    }),
    ID,
  );
  assert.equal(p.calificacion, 4.92);
  assert.equal(p.resenas, 37);
  assert.equal(p.banos, 2.5);
  assert.equal(p.nuevo, false);
});

test('parseListing: página bloqueada lanza error', () => {
  assert.throws(() => parseListing('<html>Redirigiendo</html>', ID), /faltan metadatos/);
});

test('parseProfile: ids de avisos sin repetir', () => {
  const html = `"displayFirstName":"Sofia" href="/rooms/123456789?x=1" /Hosting-123456789/ href="/rooms/987654321"`;
  assert.deepEqual(parseProfile(html), { hostName: 'Sofia', listingIds: ['123456789', '987654321'] });
});

test('barrioDesde', () => {
  assert.equal(barrioDesde('Torre Cristal hermoso apartamento Playa Brava P3'), 'Playa Brava, parada 3');
  assert.equal(barrioDesde('Casa en Pinares Playa Mansa pda 35'), 'Pinares · Playa Mansa, parada 35');
  assert.equal(barrioDesde('Loft divino', 'Maldonado'), 'Maldonado');
});

test('asignarParadas: una por parada y la más cercana gana', () => {
  const paradas = [
    { id: 'a', lat: 0, lng: 0 },
    { id: 'b', lat: 0, lng: 1 },
  ];
  const r = asignarParadas(
    [
      { id: '1', lat: 0, lng: 0.9 },
      { id: '2', lat: 0, lng: 0.95 },
    ],
    paradas,
  );
  assert.deepEqual(
    r.map((c) => [c.id, c.parada]),
    [
      ['1', 'a'],
      ['2', 'b'],
    ],
  );
});

test('asignarParadas: con más casas que paradas van de a dos', () => {
  const paradas = [{ id: 'a', lat: 0, lng: 0 }, { id: 'b', lat: 0, lng: 1 }];
  const casas = [1, 2, 3, 4].map((i) => ({ id: String(i), lat: 0, lng: 0 }));
  const r = asignarParadas(casas, paradas);
  assert.equal(r.filter((c) => c.parada === 'a').length, 2);
  assert.equal(r.filter((c) => c.parada === 'b').length, 2);
});
