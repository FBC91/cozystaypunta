// Genera los srcset (AVIF/WebP, horizontal y vertical) de las 7 fotos del recorrido.
import { getImage } from 'astro:assets';
import recorrido from '../data/recorrido.json';

export const MEDIA_VERTICAL = '(max-aspect-ratio: 4/5)';
const ANCHOS = [960, 1440, 1920, 2560];
const ANCHOS_M = [540, 810, 1080];

export interface Capa {
  id: string;
  avif: string;
  webp: string;
  avifM: string;
  webpM: string;
  src: string;
}

const archivos = import.meta.glob<{ default: ImageMetadata }>('../assets/recorrido/*.jpg', { eager: true });

function asset(nombre: string): ImageMetadata {
  const clave = Object.keys(archivos).find((k) => k.endsWith(`/${nombre}.jpg`));
  if (!clave) throw new Error(`Falta la foto ${nombre}`);
  return archivos[clave].default;
}

async function srcset(img: ImageMetadata, anchos: number[], format: 'avif' | 'webp') {
  const partes = await Promise.all(
    anchos.map(async (w) => {
      const r = await getImage({ src: img, width: w, format, quality: format === 'avif' ? 55 : 72 });
      return `${r.src} ${w}w`;
    }),
  );
  return partes.join(', ');
}

let cache: Promise<Capa[]> | undefined;

export function capasRecorrido(): Promise<Capa[]> {
  cache ??= Promise.all(
    recorrido.map(async (p) => {
      const ancho = asset(p.foto);
      const alto = asset(`${p.foto}-m`);
      const respaldo = await getImage({ src: ancho, width: 1440, format: 'webp', quality: 72 });
      return {
        id: p.id,
        avif: await srcset(ancho, ANCHOS, 'avif'),
        webp: await srcset(ancho, ANCHOS, 'webp'),
        avifM: await srcset(alto, ANCHOS_M, 'avif'),
        webpM: await srcset(alto, ANCHOS_M, 'webp'),
        src: respaldo.src,
      };
    }),
  );
  return cache;
}
