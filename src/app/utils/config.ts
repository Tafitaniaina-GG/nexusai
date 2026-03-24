export const SERVER_URL = 'https://ketrikavola.onrender.com';
export const getServerUrl = () => SERVER_URL;

export type AIProvider = 'openai' | 'chipp' | 'typegpt' | 'groq';

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  icon: string;
  description: string;
}

export const PROVIDERS: { id: AIProvider; name: string; icon: string; description: string }[] = [
  { 
    id: 'openai', 
    name: 'ChatGPT', 
    icon: 'https://cdn.oaistatic.com/_next/static/media/openai-logo.28cf931b.svg',
    description: 'Modèles GPT-4o et GPT-5'
  },
  { 
    id: 'chipp', 
    name: 'Gemini', 
    icon: 'https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d47353046b5d9207ad239.svg',
    description: 'L\'IA puissante de Google'
  },
  { 
    id: 'typegpt', 
    name: 'RTM Router', 
    icon: 'https://deepseek.com/favicon.ico',
    description: 'DeepSeek & Kimi Router'
  },
  { 
    id: 'groq', 
    name: 'Groq Speed', 
    icon: 'https://groq.com/wp-content/uploads/2024/03/cropped-favicon-192x192.png',
    description: 'L\'IA la plus rapide au monde'
  }
];
