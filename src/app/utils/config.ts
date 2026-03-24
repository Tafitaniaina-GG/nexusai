'use client'

const _K = [0x4E, 0x58, 0x41, 0x49]

function _xd(enc: string): string {
  try {
    const b = atob(enc)
    return Array.from(b).map((c, i) =>
      String.fromCharCode(c.charCodeAt(0) ^ _K[i % _K.length])
    ).join('')
  } catch { return '' }
}

let _cached: string | null = null
export function getServerUrl(): string {
  if (_cached !== null) return _cached
  const enc = process.env.NEXT_PUBLIC_ENC_URL || ''
  const direct = process.env.NEXT_PUBLIC_SERVER_URL || ''
  _cached = enc ? _xd(enc) : direct
  return _cached
}

export interface AIModel {
  id: string
  label: string
  badge?: string
  badgeColor?: string
  isVision?: boolean
  isReasoning?: boolean
  isLatest?: boolean
  isFast?: boolean
}

export interface AIProvider {
  id: string
  name: string
  shortName: string
  description: string
  logo: string
  color: string
  bgClass: string
  endpoint: string
  supportsImage: boolean
  supportsFile: boolean
  modelGroups: { label: string; models: AIModel[] }[]
}

export const LOGOS: Record<string, string> = {
  openai: '<svg viewBox="0 0 24 24" fill="currentColor" style="color:#10a37f"><path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.843-3.369 2.02-1.168a.076.076 0 0 1 .071 0l4.83 2.786a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.402-.676zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/></svg>',
  google: '<svg viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>',
  deepseek: '<svg viewBox="0 0 40 40" fill="none"><rect width="40" height="40" rx="10" fill="#4D6BFE"/><circle cx="20" cy="20" r="9" fill="none" stroke="white" stroke-width="2"/><circle cx="20" cy="20" r="4" fill="white"/><circle cx="20" cy="11" r="2" fill="white"/><circle cx="29" cy="20" r="2" fill="white"/></svg>',
  kimi: '<svg viewBox="0 0 40 40" fill="none"><rect width="40" height="40" rx="10" fill="#FF6B6B"/><path d="M13 13h4v14h-4zm10 0l-6 7 6 7h4.5L21 20l6.5-7H23z" fill="white"/></svg>',
  llama: '<svg viewBox="0 0 40 40" fill="none"><rect width="40" height="40" rx="10" fill="#0467DF"/><path d="M15 12c0 0 1.5-1.5 5-1.5s5 1.5 5 1.5v6c0 3-2.5 5-5 5s-5-2-5-5v-6z" fill="white"/><path d="M12 29c0-3.5 3.5-5.5 8-5.5s8 2 8 5.5" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>',
  qwen: '<svg viewBox="0 0 40 40" fill="none"><rect width="40" height="40" rx="10" fill="#6247AA"/><path d="M20 10l7 12H13l7-12z" fill="white" opacity=".95"/><path d="M15 22l2.5 8h5l2.5-8" fill="white" opacity=".8"/></svg>',
  groq: '<svg viewBox="0 0 40 40" fill="none"><rect width="40" height="40" rx="10" fill="#F59E0B"/><circle cx="20" cy="20" r="8" fill="none" stroke="white" stroke-width="2.5"/><path d="M20 14v6l4 4" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="29" cy="11" r="3" fill="white"/></svg>',
  facebook: '<svg viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
  gemma: '<svg viewBox="0 0 40 40" fill="none"><rect width="40" height="40" rx="10" fill="#4285F4"/><circle cx="20" cy="20" r="8" fill="white" opacity=".9"/><circle cx="20" cy="20" r="3.5" fill="#4285F4"/></svg>',
}

export const PROVIDERS: AIProvider[] = [
  {
    id: 'openai',
    name: 'ChatGPT',
    shortName: 'OpenAI',
    description: 'GPT-5, GPT-4.1, Vision, Raisonnement o3',
    logo: LOGOS.openai,
    color: '#10A37F',
    bgClass: 'icon-bg-openai',
    endpoint: '/api/openai',
    supportsImage: true,
    supportsFile: false,
    modelGroups: [
      { label: '✦ Derniers modèles', models: [
        { id:'gpt-5',label:'GPT-5',badge:'NEW',badgeColor:'badge-green',isLatest:true,isVision:true },
        { id:'gpt-4.1',label:'GPT-4.1',badge:'TOP',badgeColor:'badge-blue',isLatest:true,isVision:true }
      ]}
    ]
  },
  {
    id: 'chipp',
    name: 'Chipp AI',
    shortName: 'Google Gemini',
    description: 'Gemini Pro · Analyse PDF · Images',
    logo: LOGOS.google,
    color: '#4285F4',
    bgClass: 'icon-bg-chipp',
    endpoint: '/api/chipp',
    supportsImage: true,
    supportsFile: true,
    modelGroups: [
      { label: '✦ Google Gemini', models: [
        { id:'gemini-2.5-pro',label:'Gemini 2.5 Pro',badge:'TOP',badgeColor:'badge-blue',isLatest:true }
      ]}
    ]
  }
]
// Fix duplicate classes: Tue Mar 24 07:30:47 EAT 2026
// Fix conflict: Tue Mar 24 07:35:36 EAT 2026
