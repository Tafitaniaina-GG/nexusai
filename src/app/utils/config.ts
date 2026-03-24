export const SERVER_URL = 'https://ketrikavola.onrender.com';
export const getServerUrl = () => SERVER_URL;
export type AIProvider = any;
export type AIModel = any;
export const LOGOS: any = {
  openai: 'https://cdn.oaistatic.com/_next/static/media/openai-logo.28cf931b.svg',
  chipp: 'https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d47353046b5d9207ad239.svg',
  typegpt: 'https://deepseek.com/favicon.ico',
  groq: 'https://groq.com/wp-content/uploads/2024/03/cropped-favicon-192x192.png'
};
export const PROVIDERS: any[] = [
  { id: 'openai', name: 'ChatGPT', icon: LOGOS.openai, logo: LOGOS.openai, bgClass: 'bg-emerald-500/10', description: 'GPT-4o & GPT-5' },
  { id: 'chipp', name: 'Gemini', icon: LOGOS.chipp, logo: LOGOS.chipp, bgClass: 'bg-blue-500/10', description: 'IA Google' },
  { id: 'typegpt', name: 'RTM Router', icon: LOGOS.typegpt, logo: LOGOS.typegpt, bgClass: 'bg-purple-500/10', description: 'DeepSeek' },
  { id: 'groq', name: 'Groq Speed', icon: LOGOS.groq, logo: LOGOS.groq, bgClass: 'bg-orange-500/10', description: 'IA Ultra-rapide' }
];
// Last build: Tue Mar 24 07:04:59 EAT 2026
// Build du Tue Mar 24 07:08:14 EAT 2026
// Trigger build: Tue Mar 24 07:11:12 EAT 2026
// Build trigger: Tue Mar 24 07:14:15 EAT 2026
