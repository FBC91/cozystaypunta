// Recorrido «Un día en Punta»: el fondo cambia de parada con el scroll.
// - Movimiento completo: Lenis + GSAP ScrollTrigger (fundido + toma tipo dron hacia el oeste).
// - prefers-reduced-motion: sin Lenis ni zoom; la foto cambia con un fundido corto.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const capas = [...document.querySelectorAll<HTMLElement>('.capa')];
const paradas = [...document.querySelectorAll<HTMLElement>('main [data-parada]')];
const numero = (el: Element) => Number((el as HTMLElement).dataset.parada);

// ---------- Carga diferida de las fotos de fondo ----------
function cargar(i: number) {
  const capa = capas[i];
  if (!capa || capa.dataset.cargada) return;
  capa.dataset.cargada = '1';
  capa.querySelectorAll<HTMLSourceElement>('source[data-srcset]').forEach((s) => {
    s.srcset = s.dataset.srcset!;
    s.removeAttribute('data-srcset');
  });
  const img = capa.querySelector('img');
  if (img?.dataset.src) {
    img.src = img.dataset.src;
    img.removeAttribute('data-src');
  }
}

// Recién después de cargar la portada, para no competir con ella.
const alCargar = (fn: () => void) =>
  document.readyState === 'complete' ? fn() : window.addEventListener('load', fn, { once: true });
alCargar(() => {
  const cercania = new IntersectionObserver(
    (entradas) => entradas.forEach((e) => e.isIntersecting && cargar(numero(e.target))),
    { rootMargin: '120% 0px 120% 0px' },
  );
  paradas.forEach((p) => cercania.observe(p));
});

// ---------- Carruseles de fotos de cada casa ----------
// Las fotos 2 a 5 esperan en data-src hasta que el carrusel está cerca de la pantalla.
function completarCarrusel(carrusel: Element) {
  carrusel.querySelectorAll<HTMLImageElement>('img[data-src]').forEach((img) => {
    img.srcset = img.dataset.srcset ?? '';
    img.src = img.dataset.src!;
    img.removeAttribute('data-srcset');
    img.removeAttribute('data-src');
  });
}
const carruselCerca = new IntersectionObserver(
  (entradas) =>
    entradas.forEach((e) => {
      if (!e.isIntersecting) return;
      completarCarrusel(e.target);
      carruselCerca.unobserve(e.target);
    }),
  { rootMargin: '25% 0px 25% 0px' },
);

document.querySelectorAll<HTMLElement>('[data-carrusel]').forEach((carrusel) => {
  carruselCerca.observe(carrusel);
  const pista = carrusel.querySelector<HTMLElement>('.pista')!;
  const actual = carrusel.querySelector<HTMLElement>('[data-actual]')!;
  const total = pista.children.length;
  const indice = () => Math.round(pista.scrollLeft / pista.clientWidth);
  const ir = (paso: number) => {
    completarCarrusel(carrusel);
    const destino = (indice() + paso + total) % total;
    pista.scrollTo({ left: destino * pista.clientWidth, behavior: reducir ? 'auto' : 'smooth' });
  };
  carrusel.querySelector('[data-anterior]')!.addEventListener('click', () => ir(-1));
  carrusel.querySelector('[data-siguiente]')!.addEventListener('click', () => ir(1));
  let pendiente = 0;
  pista.addEventListener(
    'scroll',
    () => {
      cancelAnimationFrame(pendiente);
      pendiente = requestAnimationFrame(() => (actual.textContent = String(indice() + 1)));
    },
    { passive: true },
  );
});

if (reducir) {
  // ---------- Sin movimiento: la parada del centro de la pantalla manda ----------
  const activar = (i: number) => {
    cargar(i);
    capas.forEach((c, k) => c.classList.toggle('activa', k === i));
  };
  const centro = new IntersectionObserver(
    (entradas) => entradas.forEach((e) => e.isIntersecting && activar(numero(e.target))),
    { rootMargin: '-45% 0px -45% 0px' },
  );
  paradas.forEach((p) => centro.observe(p));
} else {
  // ---------- Movimiento completo ----------
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  const lenis = new Lenis({ lerp: 0.09 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  // Enlaces internos con el mismo desplazamiento suave (el «saltar al contenido» queda nativo).
  document.addEventListener('click', (e) => {
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!a || a.classList.contains('saltar')) return;
    const destino = document.querySelector<HTMLElement>(a.hash);
    if (!destino) return;
    e.preventDefault();
    lenis.scrollTo(destino, { duration: 1.6 });
    history.pushState(null, '', a.hash);
  });

  paradas.forEach((seccion) => {
    const i = numero(seccion);
    const capa = capas[i];
    const img = capa?.querySelector('img');
    if (!capa || !img) return;

    // La foto de esta parada aparece encima de la anterior mientras la sección entra.
    if (i > 0) {
      gsap.fromTo(
        capa,
        { opacity: 0 },
        { opacity: 1, ease: 'none', scrollTrigger: { trigger: seccion, start: 'top bottom', end: 'top 30%', scrub: true } },
      );
    }

    // Toma tipo dron: acerca y se desliza hacia el oeste (escala ≥ 1.07 para no mostrar bordes).
    gsap.fromTo(
      img,
      { scale: 1.18, xPercent: 2.5, yPercent: 1 },
      {
        scale: 1.07,
        xPercent: -2.5,
        yPercent: -1,
        ease: 'none',
        scrollTrigger: { trigger: seccion, start: i === 0 ? 'top top' : 'top bottom', end: 'bottom top', scrub: true },
      },
    );
  });

  // Entrada suave de tarjetas y textos (el título principal queda fijo para no demorar el LCP).
  gsap.utils.toArray<HTMLElement>('.revelar').forEach((el) => {
    gsap.from(el, {
      y: 48,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });
  gsap.from('.revelar-inicio > :not(h1)', {
    y: 24,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
    stagger: 0.12,
    delay: 0.2,
  });
}
