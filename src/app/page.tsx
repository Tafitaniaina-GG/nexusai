'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PROVIDERS, LOGOS } from './utils/config'

// ─── Logo SVG NexusAI ──────────────────────────────────────────────────────
function NexusLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="12" fill="url(#lg1)"/>
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4F46E5"/>
          <stop offset="1" stopColor="#7C3AED"/>
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="9" fill="none" stroke="white" strokeWidth="1.5" opacity=".5"/>
      <path d="M20 11v18M11 20h18" stroke="white" strokeWidth="2" strokeLinecap="round" opacity=".7"/>
      <circle cx="20" cy="20" r="3" fill="white"/>
      <circle cx="20" cy="11" r="2" fill="white" opacity=".8"/>
      <circle cx="29" cy="20" r="2" fill="white" opacity=".8"/>
      <circle cx="20" cy="29" r="2" fill="white" opacity=".8"/>
      <circle cx="11" cy="20" r="2" fill="white" opacity=".8"/>
    </svg>
  )
}

// ─── Icône provider (SVG inline) ───────────────────────────────────────────
function ProviderIcon({ svgStr, size = 32 }: { svgStr: string; size?: number }) {
  return (
    <span
      style={{ width: size, height: size, display: 'block', flexShrink: 0 }}
      dangerouslySetInnerHTML={{ __html: svgStr }}
    />
  )
}

// ─── Stats du dashboard ────────────────────────────────────────────────────
function StatsBar() {
  const totalModels = PROVIDERS.reduce((acc, p) =>
    acc + p.modelGroups.reduce((a, g) => a + g.models.length, 0), 0)
  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {[
        { value: PROVIDERS.length.toString(), label: 'Providers', icon: '🏢' },
        { value: `${totalModels}+`, label: 'Modèles', icon: '🤖' },
        { value: '100%', label: 'Gratuit', icon: '✅' },
      ].map((s, i) => (
        <div
          key={i}
          className={`card text-center py-3 px-2 anim-slide-up delay-${(i+2)*50}`}
        >
          <div className="text-xl mb-0.5">{s.icon}</div>
          <div style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontWeight:800, fontSize:'1.1rem', color:'var(--accent)' }}>
            {s.value}
          </div>
          <div style={{ fontSize:'.7rem', color:'var(--text3)', fontWeight:600 }}>{s.label}</div>
        </div>
      ))}
    </div>
  )
}

// ─── Card provider ─────────────────────────────────────────────────────────
function ProviderCard({ provider, index, onClick }: {
  provider: typeof PROVIDERS[0]; index: number; onClick: () => void
}) {
  const totalModels = provider.modelGroups.reduce((a, g) => a + g.models.length, 0)
  const isFBDL = provider.id === 'fbdl'

  return (
    <div
      onClick={onClick}
      className={`card card-hover p-4 anim-slide-up delay-${(index + 3) * 50}`}
      style={{ borderLeft: `3px solid ${provider.color}` }}
    >
      <div className="flex items-center gap-3">
        {/* Icône */}
        <div
          className={`${provider.bgClass} flex items-center justify-center rounded-xl flex-shrink-0`}
          style={{ width: 52, height: 52 }}
        >
          <ProviderIcon svgStr={provider.logo} size={28} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontWeight:800, fontSize:'.95rem', color:'var(--text1)' }}>
              {provider.name}
            </span>
            {isFBDL && <span className="badge badge-blue">DL</span>}
            {provider.supportsImage && <span className="badge badge-purple">👁 Vision</span>}
            {provider.supportsFile && <span className="badge badge-green">📎 Fichiers</span>}
          </div>
          <p style={{ fontSize:'.78rem', color:'var(--text2)', lineHeight:1.4 }}>{provider.description}</p>
          {!isFBDL && (
            <p style={{ fontSize:'.7rem', color:'var(--text3)', marginTop:3 }}>
              {totalModels} modèle{totalModels > 1 ? 's' : ''} disponible{totalModels > 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Flèche */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink:0, color:'var(--text3)' }}>
          <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Aperçu modèles (si pas FBDL) */}
      {!isFBDL && provider.modelGroups[0] && (
        <div className="flex flex-wrap gap-1.5 mt-3 pt-3" style={{ borderTop:'1px solid var(--border)' }}>
          {provider.modelGroups[0].models.slice(0, 4).map(m => (
            <span key={m.id} style={{
              fontSize:'.65rem', padding:'2px 7px', borderRadius:20,
              background:'var(--bg2)', color:'var(--text2)',
              border:'1px solid var(--border)', fontWeight:600,
              fontFamily:'Plus Jakarta Sans,sans-serif'
            }}>
              {m.label}
            </span>
          ))}
          {totalModels > 4 && (
            <span style={{
              fontSize:'.65rem', padding:'2px 7px', borderRadius:20,
              background:`${provider.color}15`, color:provider.color,
              border:`1px solid ${provider.color}30`, fontWeight:700,
              fontFamily:'Plus Jakarta Sans,sans-serif'
            }}>
              +{totalModels - 4} autres
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Page principale ───────────────────────────────────────────────────────
export default function Dashboard() {
  const router = useRouter()
  const [recentChats, setRecentChats] = useState<{ providerId: string; modelId: string; lastMsg: string }[]>([])

  useEffect(() => {
    // Charger l'historique récent depuis localStorage
    const recent: { providerId: string; modelId: string; lastMsg: string }[] = []
    PROVIDERS.forEach(p => {
      p.modelGroups.forEach(g => {
        g.models.forEach(m => {
          const key = `nxai_${p.id}_${m.id}`
          const stored = localStorage.getItem(key)
          if (stored) {
            try {
              const msgs = JSON.parse(stored)
              if (msgs.length > 0) {
                const last = msgs[msgs.length - 1]
                recent.push({ providerId: p.id, modelId: m.id, lastMsg: last.content?.slice(0, 60) || '' })
              }
            } catch {}
          }
        })
      })
    })
    setRecentChats(recent.slice(0, 3))
  }, [])

  const navigate = (pid: string) => {
    router.push(`/chat?p=${pid}`)
  }

  return (
    <div className="mesh-bg min-h-screen min-h-dvh relative">
      <div className="relative z-10 max-w-md mx-auto px-4 pb-8 safe-top">

        {/* ── Header ── */}
        <div className="flex items-center justify-between pt-8 pb-6">
          <div className="flex items-center gap-3 anim-slide-up">
            <NexusLogo size={44} />
            <div>
              <h1 style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontWeight:800, fontSize:'1.4rem', color:'var(--text1)', lineHeight:1.1 }}>
                NexusAI
              </h1>
              <p style={{ fontSize:'.72rem', color:'var(--text3)', fontWeight:600, letterSpacing:'.05em' }}>
                VOTRE HUB IA TOUT-EN-UN
              </p>
            </div>
          </div>
          <div className="anim-fade" style={{ background:'var(--bg2)', borderRadius:50, padding:'5px 12px', border:'1px solid var(--border)' }}>
            <span style={{ fontSize:'.72rem', fontWeight:700, color:'var(--accent)', fontFamily:'Plus Jakarta Sans,sans-serif' }}>
              v1.0
            </span>
          </div>
        </div>

        {/* ── Bannière hero ── */}
        <div
          className="rounded-2xl p-5 mb-6 anim-slide-up delay-50"
          style={{
            background:'linear-gradient(135deg, #4F46E5 0%, #7C3AED 60%, #0EA5E9 100%)',
            boxShadow:'0 8px 32px rgba(79,70,229,0.35)',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div style={{ background:'rgba(255,255,255,.2)', borderRadius:8, padding:'3px 10px' }}>
              <span style={{ fontSize:'.7rem', fontWeight:800, color:'white', letterSpacing:'.08em', fontFamily:'Plus Jakarta Sans,sans-serif' }}>
                ✦ TOUS LES MEILLEURS MODÈLES
              </span>
            </div>
          </div>
          <p style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontWeight:800, fontSize:'1.35rem', color:'white', lineHeight:1.3, marginBottom:8 }}>
            Intelligence artificielle<br/>sans limites.
          </p>
          <p style={{ fontSize:'.8rem', color:'rgba(255,255,255,.75)', lineHeight:1.5 }}>
            GPT-5, Gemini, DeepSeek, Kimi, Groq et plus — en un seul endroit.
          </p>
        </div>

        {/* ── Stats ── */}
        <StatsBar />

        {/* ── Récents ── */}
        {recentChats.length > 0 && (
          <div className="mb-5">
            <h2 style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontWeight:700, fontSize:'.82rem', color:'var(--text3)', letterSpacing:'.06em', marginBottom:10 }}>
              RÉCENTS
            </h2>
            <div className="space-y-2">
              {recentChats.map((r, i) => {
                const prov = PROVIDERS.find(p => p.id === r.providerId)
                if (!prov) return null
                return (
                  <div
                    key={i}
                    className="card card-hover p-3 flex items-center gap-3"
                    onClick={() => router.push(`/chat?p=${r.providerId}&m=${r.modelId}`)}
                  >
                    <div className={`${prov.bgClass} rounded-xl flex items-center justify-center`} style={{ width:36,height:36,flexShrink:0 }}>
                      <ProviderIcon svgStr={prov.logo} size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize:'.75rem', fontWeight:700, color:'var(--text2)', fontFamily:'Plus Jakarta Sans,sans-serif' }}>
                        {prov.name} · {r.modelId}
                      </p>
                      <p style={{ fontSize:'.72rem', color:'var(--text3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {r.lastMsg}…
                      </p>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color:'var(--text3)', flexShrink:0 }}>
                      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Section Providers ── */}
        <h2 style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontWeight:700, fontSize:'.82rem', color:'var(--text3)', letterSpacing:'.06em', marginBottom:10 }}>
          CHOISIR UN MODÈLE
        </h2>
        <div className="space-y-3">
          {PROVIDERS.map((p, i) => (
            <ProviderCard key={p.id} provider={p} index={i} onClick={() => navigate(p.id)} />
          ))}
        </div>

        {/* ── Footer ── */}
        <div className="text-center mt-8 anim-fade" style={{ color:'var(--text3)', fontSize:'.72rem' }}>
          NexusAI v1.0 · Partie 1 · Prochainement: Génération d'images, Audio
        </div>
      </div>
    </div>
  )
}
