export const SERVER_URL = 'https://ketrikavola.onrender.com';
export const getServerUrl = () => SERVER_URL;

export type AIProvider = any;
export type AIModel = any;

export const PROVIDERS: any[] = [
  { 
    id: 'openai', 
    name: 'ChatGPT', 
    icon: 'https://cdn.oaistatic.com/_next/static/media/openai-logo.28cf931b.svg',
    logo: 'https://cdn.oaistatic.com/_next/static/media/openai-logo.28cf931b.svg',
    bgClass: 'bg-emerald-500/10',
    description: 'Modèles GPT-4o et GPT-5'
  },
  { 
    id: 'chipp', 
    name: 'Gemini', 
    icon: 'https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d47353046b5d9207ad239.svg',
    logo: 'https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d47353046b5d9207ad239.svg',
    bgClass: 'bg-blue-500/10',
    description: 'L\'IA de Google'
  },
  { 
    id: 'typegpt', 
    name: 'RTM Router', 
    icon: 'https://deepseek.com/favicon.ico',
    logo: 'https://deepseek.com/favicon.ico',
    bgClass: 'bg-purple-500/10',
    description: 'DeepSeek & Kimi'
  },
  { 
    id: 'groq', 
    name: 'Groq Speed', 
    icon: 'https://groq.com/wp-content/uploads/2024/03/cropped-favicon-192x192.png',
    logo: 'https://groq.com/wp-content/uploads/2024/03/cropped-favicon-192x192.png',
    bgClass: 'bg-orange-500/10',
    description: 'L\'IA ultra-rapide'
  }
];
