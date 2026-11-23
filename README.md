# Cozy Stay Punta — cozystaypunta.com

Landing «Un día en Punta del Este»: un recorrido por la costa (José Ignacio → Casapueblo, del amanecer a la noche) que avanza con el scroll y muestra las casas que administra Cozy Stay Punta. En español, portugués e inglés.

## Cómo se actualizan las casas

Las casas salen **solas** del perfil de anfitriona en Airbnb. Todos los días a las 9:00 (hora de Uruguay), el workflow `Sincronizar casas de Airbnb`:

1. lee el perfil y cada aviso (nombre, barrio, huéspedes, dormitorios, baños, fotos, calificación);
2. ubica cada casa en la parada del recorrido más cercana;
3. si algo cambió, guarda `src/data/propiedades.json` y vuelve a publicar el sitio.

Si Airbnb no responde o devuelve 0 casas, **no se borra nada**: el workflow falla y la web sigue como estaba.
Para forzarlo: pestaña **Actions** → *Sincronizar casas de Airbnb* → **Run workflow**.

### Ajustes manuales (opcional) — `src/data/ajustes.json`

Por ID de aviso:

| Campo | Para qué |
|---|---|
| `nombre`, `nombre_pt`, `nombre_en` | Nombre que se muestra en cada idioma |
| `barrio` | Corregir la ubicación que se muestra |
| `oculta: true` | Sacar una casa de la web sin tocar Airbnb |
| `parada` | Fijar la casa en una parada (`playas-la-barra`, `la-barra`, `la-mano`, `peninsula`) |
| `orden` | Orden dentro de la parada |

## Desarrollo

```sh
npm install
npm run dev      # http://localhost:4321
npm test         # tests del lector de Airbnb
npm run sync     # sincroniza casas a mano
npm run build    # genera dist/
```

- Astro (estático) + GSAP ScrollTrigger + Lenis. Con «reducir movimiento» activado, el recorrido pasa a fotos fijas.
- Fotos del recorrido: `src/assets/recorrido/` (16:9 y 9:16), etalonadas con `scripts/procesar-fotos.py`. Créditos y licencias en [CREDITOS.md](CREDITOS.md).
- Fotos de las casas: se toman de Airbnb y se optimizan al publicar (no se guardan en el repo).
- Publicación: GitHub Pages (`.github/workflows/deploy.yml`) con dominio propio (`public/CNAME`).
