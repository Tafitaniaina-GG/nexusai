'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, Brain, Rocket, Wind, Download, ChevronRight, Sparkles, Star } from 'lucide-react'

const AI_MODELS = [
  {
    id: 'openai',
    group: 'OpenAI',
    icon: '⚡',
    color: '#00E5FF',
    glow: 'rgba(0,229,255,0.25)',
    models: ['GPT-4.1', 'GPT-4o', 'GPT-4o-mini', 'o1-pro', 'o3'],
    desc: 'Ultra-intelligent, Vision & Code',
    badge: 'VISION',
  },
  {
    id: 'chipp',
    group: 'Chipp AI',
    icon: '🧠',
    color: '#7C3AED',
    glow: 'rgba(124,58,237,0.25)',
    models: ['Gemini 2.5 Pro', 'Gemini 2.0 Flash', 'Gemini 1.5 Pro'],
    desc: 'Google Gemini · Fichiers & Images',
    badge: 'FILES',
  },
  {
    id: 'typegpt',
    group: 'RTM Router',
    icon: '🔀',
    color: '#F72585',
    glow: 'rgba(247,37,133,0.25)',
    models: ['DeepSeek-R2', 'Kimi-K2', 'Llama 4 Scout', 'Qwen 3-235B'],
    desc: 'Multi-Model Router · Open Source',
    badge: 'MULTI',
  },
  {
    id: 'groq',
    group: 'Groq Speed',
    icon: '🚀',
    color: '#06FFA5',
    glow: 'rgba(6,255,165,0.25)',
    models: ['Llama 3.3 70B', 'Kimi-K2', 'Mixtral 8x7B'],
    desc: 'Vitesse extrême · Streaming',
    badge: 'FAST',
  },
  {
    id: 'fbdl',
    group: 'Downloader',
    icon: '📥',
    color: '#FF9500',
    glow: 'rgba(255,149,0,0.25)',
    models: ['Facebook HD', 'Facebook SD'],
    desc: 'Téléchargement vidéo Facebook',
    badge: 'DL',
  },
]

const FLOATING_ORBS = [
  { x: '10%', y: '15%', size: 300, color: 'rgba(0,229,255,0.04)' },
  { x: '70%', y: '5%', size: 250, color: 'rgba(124,58,237,0.05)' },
  { x: '85%', y: '55%', size: 200, color: 'rgba(247,37,133,0.04)' },
  { x: '5%', y: '70%', size: 280, color: 'rgba(6,255,165,0.03)' },
]

export default function Dashboard() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [selectedModel, setSelectedModel] = useState<string | null>(null)

  useEffect(() => {
    setTimeout(() => setMounted(true), 100)
  }, [])

  const handleModelClick = (modelId: string) => {
    setSelectedModel(modelId)
    setTimeout(() => {
      router.push(`/chat?model=${modelId}`)
    }, 200)
  }

  return (
    <div className="min-h-screen min-h-dvh bg-void relative overflow-hidden">
      {/* Background orbs */}
      {FLOATING_ORBS.map((orb, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: orb.x,
            top: orb.y,
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            transform: 'translate(-50%, -50%)',
            filter: 'blur(40px)',
          }}
        />
      ))}

      {/* Grid lines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-md mx-auto px-4 safe-top pb-8">
        {/* Header */}
        <div
          className={`pt-12 pb-8 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center relative"
              style={{
                background: 'linear-gradient(135deg, #00E5FF22, #7C3AED22)',
                border: '1px solid rgba(0,229,255,0.3)',
                boxShadow: '0 0 30px rgba(0,229,255,0.15)',
              }}
            >
              <span className="text-2xl">✦</span>
              <div
                className="absolute inset-0 rounded-2xl"
                style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.05), transparent)', }}
              />
            </div>
            <div>
              <h1
                className="text-2xl font-bold gradient-text"
                style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em' }}
              >
                NexusAI
              </h1>
              <p className="text-xs" style={{ color: 'var(--text-secondary)', letterSpacing: '0.1em' }}>
                INTELLIGENCE UNIFIÉE
              </p>
            </div>
            <div className="ml-auto">
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
                style={{
                  background: 'rgba(6,255,165,0.1)',
                  border: '1px solid rgba(6,255,165,0.3)',
                  color: '#06FFA5',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-aurora-green animate-pulse" />
                v1.0
              </div>
            </div>
          </div>

          {/* Hero text */}
          <div className="space-y-1">
            <p className="text-3xl font-bold" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)', lineHeight: 1.2 }}>
              Tous les modèles
            </p>
            <p className="text-3xl font-bold" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-secondary)', lineHeight: 1.2 }}>
              en un seul endroit.
            </p>
          </div>

          {/* Stats bar */}
          <div className="flex gap-4 mt-5">
            {[
              { label: 'Modèles', value: '12+' },
              { label: 'APIs', value: '4' },
              { label: 'Gratuit', value: '100%' },
            ].map((stat) => (
              <div key={stat.label} className="flex-1 text-center">
                <div
                  className="text-lg font-bold"
                  style={{ fontFamily: 'Syne, sans-serif', color: 'var(--aurora-cyan)' }}
                >
                  {stat.value}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section title */}
        <div
          className={`flex items-center gap-2 mb-4 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <Sparkles size={14} style={{ color: 'var(--aurora-cyan)' }} />
          <span
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: 'var(--text-secondary)', fontFamily: 'Syne, sans-serif' }}
          >
            Choisir un modèle
          </span>
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        </div>

        {/* Model cards */}
        <div className="space-y-3">
          {AI_MODELS.map((model, idx) => (
            <button
              key={model.id}
              onClick={() => handleModelClick(model.id)}
              className={`w-full text-left transition-all duration-700 ${
                mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
              } ${selectedModel === model.id ? 'scale-95 opacity-70' : ''}`}
              style={{ transitionDelay: `${idx * 80 + 200}ms` }}
            >
              <div
                className="glass-card p-4 active:scale-98 transition-all duration-200"
                style={{
                  boxShadow: `0 4px 20px ${model.glow}`,
                  borderColor: `${model.color}20`,
                }}
              >
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{
                      background: `${model.color}15`,
                      border: `1px solid ${model.color}30`,
                    }}
                  >
                    {model.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className="font-bold text-sm"
                        style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}
                      >
                        {model.group}
                      </span>
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-md font-bold"
                        style={{
                          background: `${model.color}15`,
                          color: model.color,
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '0.6rem',
                          letterSpacing: '0.08em',
                        }}
                      >
                        {model.badge}
                      </span>
                    </div>
                    <p
                      className="text-xs truncate"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {model.desc}
                    </p>
                    {/* Model pills */}
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {model.models.slice(0, 3).map((m) => (
                        <span
                          key={m}
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            color: 'var(--text-secondary)',
                            fontSize: '0.65rem',
                          }}
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Arrow */}
                  <ChevronRight
                    size={18}
                    style={{ color: model.color, opacity: 0.7, flexShrink: 0 }}
                  />
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div
          className={`mt-8 text-center transition-all duration-700 delay-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}
        >
          <p className="text-xs" style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>
            NexusAI v1.0 · Partie 1 de ∞
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--aurora-cyan)', opacity: 0.4 }}>
            Video DL · Image Gen · More coming soon
          </p>
        </div>
      </div>
    </div>
  )
}
