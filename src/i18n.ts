export const LANGS = ['es', 'pt', 'en'] as const;
export type Lang = (typeof LANGS)[number];

export const WHATSAPP = '59895590540';
export const WHATSAPP_VISIBLE = '+598 95 590 540';
export const CONTACTO_NOMBRE = 'Juan';

export const rutaDe = (lang: Lang) => (lang === 'es' ? '/' : `/${lang}/`);
export const wa = (texto: string) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;

// Cada idioma abre Airbnb en su dominio (probado: perfil y avisos cargan en los tres).
const AIRBNB: Record<Lang, string> = { es: 'es.airbnb.com', pt: 'www.airbnb.com.br', en: 'www.airbnb.com' };
export const enAirbnb = (url: string, lang: Lang) => {
  const u = new URL(url);
  u.hostname = AIRBNB[lang];
  return u.href;
};

type Luz = 'amanecer' | 'manana' | 'mediodia' | 'tarde' | 'dorada' | 'atardecer' | 'noche';

interface Textos {
  htmlLang: string;
  ogLocale: string;
  nombreIdioma: string;
  metaTitulo: string;
  metaDescripcion: string;
  saltar: string;
  nav: { casas: string; nosotros: string; contacto: string; idioma: string };
  portada: { eyebrow: string; titulo: string; subtitulo: string; cta: string; pista: string };
  luz: Record<Luz, string>;
  lugares: Record<string, string>;
  parada: string;
  casa: {
    huespedes: (n: number) => string;
    dormitorios: (n: number) => string;
    banos: (n: number) => string;
    nuevo: string;
    resenas: (n: number) => string;
    verAirbnb: string;
    consultar: string;
    waMensaje: (nombre: string) => string;
    foto: (i: number, total: number, nombre: string) => string;
    anterior: string;
    siguiente: string;
    abreNueva: string;
  };
  nosotros: {
    titulo: string;
    parrafos: string[];
    puntos: { titulo: string; texto: string }[];
    perfil: string;
    fotoAlt: string;
  };
  contacto: {
    titulo: string;
    texto: string;
    whatsapp: string;
    waMensaje: string;
    airbnb: string;
    duenosTitulo: string;
    duenosTexto: string;
    duenosBoton: string;
    duenosMensaje: string;
  };
  pie: { creditos: string; derechos: string };
}

export const t: Record<Lang, Textos> = {
  es: {
    htmlLang: 'es-UY',
    ogLocale: 'es_UY',
    nombreIdioma: 'Español',
    metaTitulo: 'Cozy Stay Punta · Casas en Punta del Este para reservar en Airbnb',
    metaDescripcion:
      'Casas y apartamentos en Punta del Este, cerca del mar, listos para reservar en Airbnb. Trato cercano y directo por WhatsApp.',
    saltar: 'Saltar al contenido',
    nav: { casas: 'Casas', nosotros: 'Nosotros', contacto: 'Contacto', idioma: 'Idioma' },
    portada: {
      eyebrow: 'Cozy Stay Punta',
      titulo: 'Un día en Punta del Este',
      subtitulo: 'Casas en Punta del Este, listas para reservar en Airbnb.',
      cta: 'Ver propiedades',
      pista: 'Deslizá para recorrer la costa',
    },
    luz: {
      amanecer: 'Amanecer',
      manana: 'Media mañana',
      mediodia: 'Mediodía',
      tarde: 'Tarde',
      dorada: 'Hora dorada',
      atardecer: 'Puesta del sol',
      noche: 'Noche',
    },
    lugares: {
      'jose-ignacio': 'Faro de José Ignacio',
      'playas-la-barra': 'Playas de La Barra',
      'la-barra': 'Puente de La Barra',
      'la-mano': 'La Mano, Playa Brava',
      peninsula: 'Península y puerto',
      casapueblo: 'Casapueblo, Punta Ballena',
      'casapueblo-noche': 'Casapueblo, Punta Ballena',
    },
    parada: 'Parada',
    casa: {
      huespedes: (n) => `${n} ${n === 1 ? 'huésped' : 'huéspedes'}`,
      dormitorios: (n) => `${n} ${n === 1 ? 'dormitorio' : 'dormitorios'}`,
      banos: (n) => `${String(n).replace('.', ',')} ${n === 1 ? 'baño' : 'baños'}`,
      nuevo: 'Nuevo en Airbnb',
      resenas: (n) => `${n} ${n === 1 ? 'reseña' : 'reseñas'}`,
      verAirbnb: 'Ver en Airbnb',
      consultar: 'Consultar',
      waMensaje: (nombre) => `¡Hola! Quiero consultar por «${nombre}» que vi en cozystaypunta.com.`,
      foto: (i, total, nombre) => `${nombre}, foto ${i} de ${total}`,
      anterior: 'Foto anterior',
      siguiente: 'Foto siguiente',
      abreNueva: '(se abre en una pestaña nueva)',
    },
    nosotros: {
      titulo: 'Quiénes somos',
      parrafos: [
        'Somos Cozy Stay Punta, un equipo de Punta del Este que cuida cada casa como si fuera la propia. Elegimos el nombre por lo que queremos que sientas al llegar: que estás en casa.',
        'Preparamos cada lugar para que llegues, dejes las valijas y vayas directo a la playa. Y durante la estadía estamos a un mensaje de distancia: qué playa elegir según el viento, dónde comer, a qué hora ver el atardecer en Casapueblo. Preguntanos.',
      ],
      puntos: [
        { titulo: 'Cerca del mar', texto: 'Casas y apartamentos en Playa Brava, Playa Mansa y Pinares.' },
        { titulo: 'Reserva segura', texto: 'Reservás y pagás en Airbnb, con todas sus garantías.' },
        { titulo: 'Trato directo', texto: 'Te atiende una persona, por WhatsApp, antes y durante tu estadía.' },
      ],
      perfil: 'Ver nuestro perfil de anfitriones en Airbnb',
      fotoAlt: 'Una de nuestras casas en Punta del Este',
    },
    contacto: {
      titulo: '¿Dónde querés despertarte mañana?',
      texto: 'Contanos tus fechas y cuántos son, y te ayudamos a elegir la casa.',
      whatsapp: 'Escribinos por WhatsApp',
      waMensaje: '¡Hola! Vi cozystaypunta.com y quiero consultar por una casa.',
      airbnb: 'Ver todas las casas en Airbnb',
      duenosTitulo: '¿Tenés una propiedad en Punta?',
      duenosTexto: 'La administramos por vos.',
      duenosBoton: 'Quiero que la administren',
      duenosMensaje: '¡Hola! Tengo una propiedad en Punta del Este y quiero información para que la administren.',
    },
    pie: {
      creditos: 'Créditos de fotos',
      derechos: 'Todos los derechos reservados.',
    },
  },
  pt: {
    htmlLang: 'pt-BR',
    ogLocale: 'pt_BR',
    nombreIdioma: 'Português',
    metaTitulo: 'Cozy Stay Punta · Casas em Punta del Este para reservar no Airbnb',
    metaDescripcion:
      'Casas e apartamentos em Punta del Este, perto do mar, prontos para reservar no Airbnb. Atendimento próximo e direto pelo WhatsApp.',
    saltar: 'Pular para o conteúdo',
    nav: { casas: 'Casas', nosotros: 'Quem somos', contacto: 'Contato', idioma: 'Idioma' },
    portada: {
      eyebrow: 'Cozy Stay Punta',
      titulo: 'Um dia em Punta del Este',
      subtitulo: 'Casas em Punta del Este, prontas para reservar no Airbnb.',
      cta: 'Ver imóveis',
      pista: 'Role para percorrer a costa',
    },
    luz: {
      amanecer: 'Amanhecer',
      manana: 'Meio da manhã',
      mediodia: 'Meio-dia',
      tarde: 'Tarde',
      dorada: 'Hora dourada',
      atardecer: 'Pôr do sol',
      noche: 'Noite',
    },
    lugares: {
      'jose-ignacio': 'Farol de José Ignacio',
      'playas-la-barra': 'Praias de La Barra',
      'la-barra': 'Ponte de La Barra',
      'la-mano': 'La Mano, Playa Brava',
      peninsula: 'Península e porto',
      casapueblo: 'Casapueblo, Punta Ballena',
      'casapueblo-noche': 'Casapueblo, Punta Ballena',
    },
    parada: 'Parada',
    casa: {
      huespedes: (n) => `${n} ${n === 1 ? 'hóspede' : 'hóspedes'}`,
      dormitorios: (n) => `${n} ${n === 1 ? 'quarto' : 'quartos'}`,
      banos: (n) => `${String(n).replace('.', ',')} ${n === 1 ? 'banheiro' : 'banheiros'}`,
      nuevo: 'Novo no Airbnb',
      resenas: (n) => `${n} ${n === 1 ? 'avaliação' : 'avaliações'}`,
      verAirbnb: 'Ver no Airbnb',
      consultar: 'Perguntar',
      waMensaje: (nombre) => `Olá! Quero informações sobre «${nombre}», que vi em cozystaypunta.com.`,
      foto: (i, total, nombre) => `${nombre}, foto ${i} de ${total}`,
      anterior: 'Foto anterior',
      siguiente: 'Próxima foto',
      abreNueva: '(abre em uma nova aba)',
    },
    nosotros: {
      titulo: 'Quem somos',
      parrafos: [
        'Somos a Cozy Stay Punta, uma equipe de Punta del Este que cuida de cada casa como se fosse nossa. Escolhemos o nome pelo que queremos que você sinta ao chegar: que está em casa.',
        'Preparamos cada lugar para você chegar, deixar as malas e ir direto para a praia. E durante a estadia estamos a uma mensagem de distância: qual praia escolher conforme o vento, onde comer, a que horas ver o pôr do sol em Casapueblo. Pergunte para a gente.',
      ],
      puntos: [
        { titulo: 'Perto do mar', texto: 'Casas e apartamentos na Playa Brava, Playa Mansa e Pinares.' },
        { titulo: 'Reserva segura', texto: 'Você reserva e paga no Airbnb, com todas as garantias.' },
        { titulo: 'Atendimento direto', texto: 'Uma pessoa te atende pelo WhatsApp, antes e durante a estadia.' },
      ],
      perfil: 'Ver nosso perfil de anfitriões no Airbnb',
      fotoAlt: 'Uma das nossas casas em Punta del Este',
    },
    contacto: {
      titulo: 'Onde você quer acordar amanhã?',
      texto: 'Conte suas datas e quantas pessoas são, e ajudamos você a escolher a casa.',
      whatsapp: 'Fale com a gente no WhatsApp',
      waMensaje: 'Olá! Vi cozystaypunta.com e quero informações sobre uma casa.',
      airbnb: 'Ver todas as casas no Airbnb',
      duenosTitulo: 'Tem um imóvel em Punta?',
      duenosTexto: 'Nós administramos para você.',
      duenosBoton: 'Quero que administrem',
      duenosMensaje: 'Olá! Tenho um imóvel em Punta del Este e quero informações sobre a administração.',
    },
    pie: {
      creditos: 'Créditos das fotos',
      derechos: 'Todos os direitos reservados.',
    },
  },
  en: {
    htmlLang: 'en',
    ogLocale: 'en_US',
    nombreIdioma: 'English',
    metaTitulo: 'Cozy Stay Punta · Homes in Punta del Este to book on Airbnb',
    metaDescripcion:
      'Houses and apartments in Punta del Este, close to the sea, ready to book on Airbnb. Friendly, direct contact on WhatsApp.',
    saltar: 'Skip to content',
    nav: { casas: 'Homes', nosotros: 'About us', contacto: 'Contact', idioma: 'Language' },
    portada: {
      eyebrow: 'Cozy Stay Punta',
      titulo: 'A day in Punta del Este',
      subtitulo: 'Homes in Punta del Este, ready to book on Airbnb.',
      cta: 'See the homes',
      pista: 'Scroll to travel the coast',
    },
    luz: {
      amanecer: 'Sunrise',
      manana: 'Mid-morning',
      mediodia: 'Midday',
      tarde: 'Afternoon',
      dorada: 'Golden hour',
      atardecer: 'Sunset',
      noche: 'Night',
    },
    lugares: {
      'jose-ignacio': 'José Ignacio lighthouse',
      'playas-la-barra': 'La Barra beaches',
      'la-barra': 'La Barra bridge',
      'la-mano': 'La Mano, Playa Brava',
      peninsula: 'Peninsula and harbor',
      casapueblo: 'Casapueblo, Punta Ballena',
      'casapueblo-noche': 'Casapueblo, Punta Ballena',
    },
    parada: 'Stop',
    casa: {
      huespedes: (n) => `${n} ${n === 1 ? 'guest' : 'guests'}`,
      dormitorios: (n) => `${n} ${n === 1 ? 'bedroom' : 'bedrooms'}`,
      banos: (n) => `${n} ${n === 1 ? 'bath' : 'baths'}`,
      nuevo: 'New on Airbnb',
      resenas: (n) => `${n} ${n === 1 ? 'review' : 'reviews'}`,
      verAirbnb: 'View on Airbnb',
      consultar: 'Ask us',
      waMensaje: (nombre) => `Hi! I'd like to ask about "${nombre}", which I saw on cozystaypunta.com.`,
      foto: (i, total, nombre) => `${nombre}, photo ${i} of ${total}`,
      anterior: 'Previous photo',
      siguiente: 'Next photo',
      abreNueva: '(opens in a new tab)',
    },
    nosotros: {
      titulo: 'About us',
      parrafos: [
        "We're Cozy Stay Punta, a Punta del Este team that looks after every home as if it were our own. We chose the name for what we want you to feel when you arrive: at home.",
        "We get each place ready so you can arrive, drop your bags and head straight to the beach. During your stay we're one message away: which beach to pick depending on the wind, where to eat, when to catch the sunset at Casapueblo. Just ask.",
      ],
      puntos: [
        { titulo: 'Close to the sea', texto: 'Houses and apartments on Playa Brava, Playa Mansa and in Pinares.' },
        { titulo: 'Secure booking', texto: 'You book and pay on Airbnb, with all its protections.' },
        { titulo: 'A real person', texto: 'We answer on WhatsApp, before and during your stay.' },
      ],
      perfil: 'See our host profile on Airbnb',
      fotoAlt: 'One of our homes in Punta del Este',
    },
    contacto: {
      titulo: 'Where do you want to wake up tomorrow?',
      texto: "Tell us your dates and how many you are, and we'll help you choose.",
      whatsapp: 'Message us on WhatsApp',
      waMensaje: "Hi! I saw cozystaypunta.com and I'd like to ask about a home.",
      airbnb: 'See all homes on Airbnb',
      duenosTitulo: 'Own a property in Punta?',
      duenosTexto: "We'll manage it for you.",
      duenosBoton: 'Manage my property',
      duenosMensaje: "Hi! I own a property in Punta del Este and I'd like information about your management service.",
    },
    pie: {
      creditos: 'Photo credits',
      derechos: 'All rights reserved.',
    },
  },
};
