import { Ad } from "./types";

export const INITIAL_DEMO_ADS: Ad[] = [
  {
    id: "demo-ad-1",
    title: "🍕 Rodízio de Pizza Especial - Bella Itália",
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop",
    videoUrl: "",
    isVideo: false,
    durationMillis: 15000,
    createdAt: Date.now() - 3600000 * 5, // 5 horas atrás
  },
  {
    id: "demo-ad-2",
    title: "☕ Comece o dia bem! Café + Pão de Queijo por R$ 9,90",
    imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop",
    videoUrl: "",
    isVideo: false,
    durationMillis: 10000,
    createdAt: Date.now() - 3600000 * 3, // 3 horas atrás
  },
  {
    id: "demo-ad-3",
    title: "🧼 Lavagem Ecológica Pro - Brilho Máximo a 2km daqui!",
    imageUrl: "https://images.unsplash.com/photo-1507136566006-cfc505b114fc?w=800&auto=format&fit=crop",
    videoUrl: "",
    isVideo: false,
    durationMillis: 12000,
    createdAt: Date.now() - 3600000 * 1, // 1 hora atrás
  },
  {
    id: "demo-ad-4",
    title: "🍔 Combo Smash Cheddar com Batata Frita e Refri",
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop",
    videoUrl: "",
    isVideo: false,
    durationMillis: 20000,
    createdAt: Date.now() - 1800000, // 30 mins atrás
  }
];

export const QUICK_PROMPTS = [
  {
    label: "🍕 Pizza para a noite",
    prompt: "Crie um anúncio de pizza saborosa para a noite com promoção de refrigerante grátis",
  },
  {
    label: "☕ Café da Manhã",
    prompt: "Crie um anúncio matinal de cafeteria oferecendo espresso e croissant quentinho",
  },
  {
    label: "🧼 Estética Automotiva",
    prompt: "Crie um anúncio de lava-rápido/estética automotiva com desconto de 15% para carros de aplicativo",
  },
  {
    label: "💪 Plano Semestral de Academia",
    prompt: "Crie um anúncio motivacional de academia oferecendo taxa zero de matrícula no plano semestral",
  }
];
