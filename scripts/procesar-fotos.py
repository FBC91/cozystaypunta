"""Recorta y etalona las fotos del recorrido (7 fijas + paradas extra).

Entrada : recursos/fotos-originales/NN-*.jpg (+ creditos.json)
Salida  : src/assets/recorrido/NN-*.jpg     (16:9, 2560x1440)
          src/assets/recorrido/NN-*-m.jpg   (9:16, 1080x1920, para celular)
          src/data/creditos.json            (autor y licencia de cada foto)

Uso: python scripts/procesar-fotos.py [clave ...]
"""
import json
import pathlib
import sys

import numpy as np
from PIL import Image, ImageOps

RAIZ = pathlib.Path(__file__).resolve().parent.parent
ORIG = RAIZ / "recursos" / "fotos-originales"
SALIDA = RAIZ / "src" / "assets" / "recorrido"

# Paleta de la marca (para unificar la serie): sombras pizarra, luces arena.
PIZARRA = np.array([0x1C, 0x27, 0x34]) / 255
ARENA = np.array([0xD9, 0xBD, 0x8B]) / 255

# focal = (x, y) en proporción de la foto original; luz = receta de color.
FOTOS = {
    "01-jose-ignacio": {"focal": (0.30, 0.38), "focal_m": (0.20, 0.45), "luz": "amanecer"},
    "02-la-barra-playa": {"focal": (0.50, 0.55), "focal_m": (0.42, 0.55), "luz": "manana"},
    "03-la-barra-puente": {"focal": (0.48, 0.45), "focal_m": (0.33, 0.50), "luz": "mediodia"},
    "04-la-mano": {"focal": (0.55, 0.62), "focal_m": (0.62, 0.60), "luz": "tarde"},
    "05-peninsula": {"focal": (0.50, 0.45), "focal_m": (0.50, 0.45), "luz": "dorada"},
    "06-casapueblo": {"focal": (0.55, 0.40), "focal_m": (0.66, 0.40), "luz": "atardecer"},
    "07-casapueblo-noche": {"focal": (0.48, 0.45), "focal_m": (0.44, 0.50), "luz": "noche"},
    # Paradas extra: solo aparecen en la web si hay más de 4 casas.
    "08-playa-mansa": {"focal": (0.50, 0.55), "focal_m": (0.45, 0.55), "luz": "playa"},
    "09-gorriti-ocaso": {"focal": (0.50, 0.45), "focal_m": (0.36, 0.50), "luz": "ocaso"},
}

# exposición, contraste, saturación, temperatura (+cálido), tinte (+magenta),
# color y fuerza de sombras/luces, levantar negros, viñeta.
RECETAS = {
    "amanecer": dict(exp=1.04, con=0.92, sat=0.95, temp=0.06, tinte=0.035, sombra=(0.20, 0.24, 0.42), s_f=0.18,
                     luz=(1.0, 0.78, 0.62), l_f=0.22, fade=0.035, vin=0.25),
    "manana": dict(exp=1.04, con=1.02, sat=1.02, temp=-0.01, tinte=0.0, sombra=(0.16, 0.24, 0.32), s_f=0.10,
                   luz=(1.0, 0.97, 0.90), l_f=0.06, fade=0.02, vin=0.18),
    "mediodia": dict(exp=1.02, con=1.08, sat=1.08, temp=0.0, tinte=0.0, sombra=(0.14, 0.20, 0.28), s_f=0.08,
                     luz=(1.0, 0.98, 0.94), l_f=0.04, fade=0.01, vin=0.18),
    "tarde": dict(exp=1.0, con=1.06, sat=1.04, temp=0.035, tinte=0.01, sombra=(0.15, 0.20, 0.30), s_f=0.12,
                  luz=(1.0, 0.90, 0.74), l_f=0.12, fade=0.02, vin=0.22),
    "playa": dict(exp=1.05, con=1.14, sat=1.14, temp=0.05, tinte=0.01, sombra=(0.15, 0.20, 0.30), s_f=0.12,
                  luz=(1.0, 0.88, 0.70), l_f=0.16, fade=0.015, vin=0.22),
    "ocaso": dict(exp=0.98, con=1.06, sat=1.0, temp=0.06, tinte=0.03, sombra=(0.18, 0.18, 0.34), s_f=0.20,
                  luz=(1.0, 0.74, 0.50), l_f=0.20, fade=0.025, vin=0.30),
    "dorada": dict(exp=1.03, con=1.05, sat=1.02, temp=0.14, tinte=0.03, sombra=(0.12, 0.20, 0.30), s_f=0.18,
                   luz=(1.0, 0.76, 0.42), l_f=0.40, fade=0.02, vin=0.28),
    "atardecer": dict(exp=0.92, con=1.08, sat=1.02, temp=0.11, tinte=0.04, sombra=(0.22, 0.18, 0.34), s_f=0.22,
                      luz=(1.0, 0.70, 0.48), l_f=0.30, fade=0.025, vin=0.34),
    "noche": dict(exp=0.74, con=1.06, sat=0.85, temp=-0.06, tinte=0.015, sombra=(0.09, 0.15, 0.32), s_f=0.38,
                  luz=(1.0, 0.72, 0.45), l_f=0.14, fade=0.045, vin=0.36),
}


def recortar(im: Image.Image, ratio: float, focal: tuple[float, float]) -> Image.Image:
    w, h = im.size
    if w / h > ratio:
        nw, nh = round(h * ratio), h
    else:
        nw, nh = w, round(w / ratio)
    cx, cy = focal[0] * w, focal[1] * h
    x = int(min(max(cx - nw / 2, 0), w - nw))
    y = int(min(max(cy - nh / 2, 0), h - nh))
    return im.crop((x, y, x + nw, y + nh))


def etalonar(im: Image.Image, r: dict) -> Image.Image:
    a = np.asarray(im).astype(np.float32) / 255
    a = a * r["exp"]
    # temperatura y tinte
    a[..., 0] *= 1 + r["temp"]
    a[..., 2] *= 1 - r["temp"]
    a[..., 1] *= 1 - r["tinte"] * 0.5
    # contraste (curva S suave alrededor de 0.5)
    a = np.clip(a, 0, 1)
    a = 0.5 + (a - 0.5) * r["con"]
    # saturación
    lum = (a @ np.array([0.2126, 0.7152, 0.0722]))[..., None]
    a = lum + (a - lum) * r["sat"]
    a = np.clip(a, 0, 1)
    lum = (a @ np.array([0.2126, 0.7152, 0.0722]))[..., None]
    # split toning: receta + paleta de marca
    sombra = np.array(r["sombra"]) * 0.7 + PIZARRA * 0.3
    luz = np.array(r["luz"]) * 0.7 + ARENA * 0.3
    ps = (1 - lum) ** 2 * r["s_f"]
    pl = lum**2 * r["l_f"]
    a = a * (1 - ps) + sombra * ps
    a = a * (1 - pl) + (a * luz * 1.25) * pl
    # levantar negros (look suave, «cozy»)
    a = r["fade"] + a * (1 - r["fade"])
    # viñeta
    h, w = a.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]
    d = np.sqrt(((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2) / np.sqrt(2)
    a = a * (1 - r["vin"] * np.clip(d - 0.25, 0, 1) ** 1.6)[..., None]
    return Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8))


def main() -> None:
    SALIDA.mkdir(parents=True, exist_ok=True)
    solo = set(sys.argv[1:])  # opcional: procesar solo algunas (ej. 08-playa-mansa)
    for clave, cfg in FOTOS.items():
        if solo and clave not in solo:
            continue
        im = ImageOps.exif_transpose(Image.open(ORIG / f"{clave}.jpg")).convert("RGB")
        receta = RECETAS[cfg["luz"]]
        ancho = recortar(im, 16 / 9, cfg["focal"]).resize((2560, 1440), Image.LANCZOS)
        etalonar(ancho, receta).save(SALIDA / f"{clave}.jpg", quality=92, optimize=True, progressive=True)
        alto = recortar(im, 9 / 16, cfg["focal_m"])
        alto = alto.resize((1080, 1920), Image.LANCZOS)
        etalonar(alto, receta).save(SALIDA / f"{clave}-m.jpg", quality=90, optimize=True, progressive=True)
        print("ok", clave, im.size, "->", cfg["luz"])

    creditos = json.loads((ORIG / "creditos.json").read_text(encoding="utf-8"))
    salida = [
        {"foto": k, "autor": v["autor"], "licencia": v["licencia"], "licencia_url": v["licencia_url"], "fuente": v["pagina"]}
        for k, v in creditos.items()
    ]
    (RAIZ / "src" / "data" / "creditos.json").write_text(
        json.dumps(salida, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )


if __name__ == "__main__":
    main()
