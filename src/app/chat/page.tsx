'use client'
import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { PROVIDERS, getServerUrl, type AIProvider, type AIModel } from '../utils/config'

// ─── Types ────────────────────────────────────────────────────────────────
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  imageUrl?: string
  fileName?: string
  timestamp: number
}

// ─── Toast ────────────────────────────────────────────────────────────────
function Toast({ msg, onHide }: { msg: string; onHide: () => void }) {
  useEffect(() => { const t = setTimeout(onHide, 2500); return () => clearTimeout(t) }, [onHide])
  return <div className="toast">{msg}</div>
}

// ─── Logo SVG inline ──────────────────────────────────────────────────────
function ProviderLogo({ svgStr, size = 26 }: { svgStr: string; size?: number }) {
  return (
    <span
      style={{ width: size, height: size, display: 'block', flexShrink: 0 }}
      dangerouslySetInnerHTML={{ __html: svgStr }}
    />
  )
}

// ─── Code Block avec copie ────────────────────────────────────────────────
function CodeBlock({ language, children }: { language: string; children: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(children).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <div className="code-block">
      <div className="code-block-header">
        <span className="code-block-lang">{language || 'code'}</span>
        <button onClick={copy} className={`code-copy-btn ${copied ? 'copied' : ''}`}>
          {copied
            ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg> Copié</>
            : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="2"/></svg> Copier</>
          }
        </button>
      </div>
      <SyntaxHighlighter style={oneLight} language={language} PreTag="div" customStyle={{ margin:0, padding:'14px 16px', background:'#FAFAFA', fontSize:'.8rem', lineHeight:1.65 }}>
        {children}
      </SyntaxHighlighter>
    </div>
  )
}

// ─── Markdown renderer ────────────────────────────────────────────────────
function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="md" style={{ fontSize:'.875rem', lineHeight:1.75 }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '')
            return !props.inline && match
              ? <CodeBlock language={match[1]}>{String(children).replace(/\n$/, '')}</CodeBlock>
              : <code className={className} {...props}>{children}</code>
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

// ─── Message bubble ───────────────────────────────────────────────────────
function MsgBubble({ msg, providerColor, providerLogo }: {
  msg: Message; providerColor: string; providerLogo: string
}) {
  const isUser = msg.role === 'user'
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(msg.content)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 gap-2`}>
      {!isUser && (
        <div
          className="flex items-center justify-center rounded-xl flex-shrink-0 mt-1"
          style={{ width:32, height:32, background:`${providerColor}15`, border:`1.5px solid ${providerColor}30` }}
        >
          <ProviderLogo svgStr={providerLogo} size={18} />
        </div>
      )}

      <div style={{ maxWidth: isUser ? '82%' : '90%' }}>
        {/* Pièce jointe image */}
        {msg.imageUrl && (
          <div className="mb-2">
            <img src={msg.imageUrl} alt="img" style={{ maxHeight:200, borderRadius:12, border:'1px solid var(--border)', display:'block', maxWidth:'100%' }} />
          </div>
        )}
        {/* Fichier attaché */}
        {msg.fileName && (
          <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-xl" style={{ background:`${providerColor}10`, border:`1px solid ${providerColor}20`, color:providerColor, fontSize:'.75rem', fontWeight:600 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/><polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2"/></svg>
            {msg.fileName}
          </div>
        )}

        {/* Bulle */}
        <div className={isUser ? 'msg-user' : 'msg-ai'} style={{ padding:'10px 14px' }}>
          {isUser
            ? <p style={{ fontSize:'.875rem', lineHeight:1.65, margin:0 }}>{msg.content}</p>
            : <MarkdownContent content={msg.content} />
          }
        </div>

        {/* Actions message IA */}
        {!isUser && (
          <div className="flex gap-2 mt-1.5 pl-1">
            <button onClick={copy} style={{ display:'flex', alignItems:'center', gap:4, fontSize:'.68rem', color: copied ? 'var(--green)' : 'var(--text3)', fontWeight:600, background:'none', border:'none', cursor:'pointer', padding:'2px 4px' }}>
              {copied
                ? <><svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg> Copié</>
                : <><svg width="11" height="11" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="2"/></svg> Copier</>
              }
            </button>
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex items-center justify-center rounded-xl flex-shrink-0 mt-1" style={{ width:32, height:32, background:'linear-gradient(135deg,#4F46E5,#7C3AED)', flexShrink:0 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="white" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="7" r="4" stroke="white" strokeWidth="2"/></svg>
        </div>
      )}
    </div>
  )
}

// ─── Skeleton loader ──────────────────────────────────────────────────────
function SkeletonMsg({ providerColor, providerLogo }: { providerColor: string; providerLogo: string }) {
  return (
    <div className="flex justify-start mb-4 gap-2">
      <div className="flex items-center justify-center rounded-xl flex-shrink-0 mt-1" style={{ width:32, height:32, background:`${providerColor}15`, border:`1.5px solid ${providerColor}30` }}>
        <ProviderLogo svgStr={providerLogo} size={18} />
      </div>
      <div className="flex-1 max-w-xs space-y-2">
        <div className="skeleton" style={{ height:14, width:'75%' }} />
        <div className="skeleton" style={{ height:14, width:'100%' }} />
        <div className="skeleton" style={{ height:14, width:'60%' }} />
      </div>
    </div>
  )
}

// ─── Sélecteur de modèle ──────────────────────────────────────────────────
function ModelPicker({ provider, selected, onSelect, onClose }: {
  provider: AIProvider; selected: string; onSelect: (m: AIModel) => void; onClose: () => void
}) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:200 }}>
      <div onClick={onClose} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.35)', backdropFilter:'blur(4px)' }} />
      <div className="anim-slide-up" style={{
        position:'absolute', bottom:0, left:0, right:0, maxHeight:'80vh',
        background:'var(--surface)', borderRadius:'24px 24px 0 0',
        boxShadow:'0 -8px 40px rgba(0,0,0,0.15)', overflow:'hidden', display:'flex', flexDirection:'column'
      }}>
        {/* Handle */}
        <div style={{ display:'flex', justifyContent:'center', padding:'12px 0 0' }}>
          <div style={{ width:40, height:4, borderRadius:4, background:'var(--border2)' }} />
        </div>
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom:'1px solid var(--border)' }}>
          <div className={`${provider.bgClass} rounded-xl flex items-center justify-center`} style={{ width:40, height:40 }}>
            <ProviderLogo svgStr={provider.logo} size={22} />
          </div>
          <div>
            <p style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontWeight:800, fontSize:'.95rem', color:'var(--text1)' }}>{provider.name}</p>
            <p style={{ fontSize:'.72rem', color:'var(--text3)' }}>Choisir un modèle</p>
          </div>
          <button onClick={onClose} style={{ marginLeft:'auto', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:50, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="var(--text2)" strokeWidth="2.5" strokeLinecap="round"/></svg>
          </button>
        </div>
        {/* Model groups */}
        <div style={{ overflowY:'auto', flex:1, padding:'8px 0 24px' }}>
          {provider.modelGroups.map((grp, gi) => (
            <div key={gi}>
              <p style={{ padding:'12px 20px 4px', fontSize:'.68rem', fontWeight:800, color:'var(--text3)', letterSpacing:'.06em', fontFamily:'Plus Jakarta Sans,sans-serif' }}>
                {grp.label}
              </p>
              {grp.models.map(m => (
                <button
                  key={m.id}
                  onClick={() => { onSelect(m); onClose() }}
                  style={{
                    width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between',
                    padding:'11px 20px', background: selected === m.id ? `${provider.color}10` : 'transparent',
                    border:'none', cursor:'pointer', textAlign:'left',
                    borderLeft: selected === m.id ? `3px solid ${provider.color}` : '3px solid transparent',
                    transition:'all .15s'
                  }}
                >
                  <span style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontWeight: selected===m.id?700:600, fontSize:'.85rem', color: selected===m.id ? provider.color : 'var(--text1)' }}>
                    {m.label}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {m.badge && <span className={`badge ${m.badgeColor||'badge-blue'}`}>{m.badge}</span>}
                    {selected === m.id && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke={provider.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Facebook Downloader ──────────────────────────────────────────────────
function FBDownloader() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  const download = async () => {
    if (!url.trim()) return
    setLoading(true); setError(''); setResult(null)
    try {
      const serverUrl = getServerUrl()
      const res = await fetch(`${serverUrl}/api/fbdl`, {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ url: url.trim() })
      })
      const data = await res.json()
      if (data.error || !data.url) throw new Error(data.error || 'Lien introuvable')
      setResult(data)
    } catch(e: any) {
      setError(e.message || 'Erreur de téléchargement')
    } finally { setLoading(false) }
  }

  return (
    <div className="flex-1 p-4 overflow-y-auto">
      {toast && <Toast msg={toast} onHide={() => setToast('')} />}

      {/* Hero */}
      <div className="card p-5 mb-4 text-center" style={{ background:'linear-gradient(135deg,#1877F2,#42B72A)', border:'none' }}>
        <div style={{ fontSize:'2.5rem', marginBottom:8 }}>📥</div>
        <p style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontWeight:800, fontSize:'1.1rem', color:'white', marginBottom:4 }}>Téléchargeur Facebook</p>
        <p style={{ fontSize:'.8rem', color:'rgba(255,255,255,.8)' }}>Collez l'URL d'une vidéo Facebook pour la télécharger en HD ou SD</p>
      </div>

      {/* Input */}
      <div className="card p-4 mb-4">
        <label style={{ display:'block', fontSize:'.78rem', fontWeight:700, color:'var(--text2)', marginBottom:8, fontFamily:'Plus Jakarta Sans,sans-serif' }}>
          🔗 URL de la vidéo Facebook
        </label>
        <div className="flex gap-2">
          <input
            value={url} onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key==='Enter' && download()}
            placeholder="https://www.facebook.com/..."
            className="input-field flex-1"
            style={{ padding:'10px 14px', fontSize:'.875rem' }}
          />
          <button
            onClick={download} disabled={loading || !url.trim()}
            className="btn-primary flex items-center justify-center"
            style={{ padding:'10px 18px', fontSize:'.85rem', opacity: !url.trim()||loading ? .5 : 1, flexShrink:0 }}
          >
            {loading
              ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation:'spin 1s linear infinite' }}><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" strokeDasharray="31.4" strokeDashoffset="10"/></svg>
              : <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M19 12l-7 7-7-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            }
          </button>
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="card p-4 mb-4 flex gap-3 items-start" style={{ border:'1.5px solid #FCA5A5', background:'#FEF2F2' }}>
          <span style={{ fontSize:'1.2rem' }}>⚠️</span>
          <div>
            <p style={{ fontWeight:700, color:'var(--red)', fontSize:'.82rem', fontFamily:'Plus Jakarta Sans,sans-serif' }}>Erreur</p>
            <p style={{ color:'var(--red)', fontSize:'.78rem', marginTop:2 }}>{error}</p>
          </div>
        </div>
      )}

      {/* Résultat */}
      {result && (
        <div className="card p-4 anim-scale">
          {result.thumbnail && (
            <div style={{ borderRadius:12, overflow:'hidden', marginBottom:12, position:'relative' }}>
              <img src={result.thumbnail} alt="thumb" style={{ width:'100%', maxHeight:200, objectFit:'cover', display:'block' }} />
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,.5), transparent)' }} />
            </div>
          )}
          {result.title && (
            <p style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontWeight:700, fontSize:'.88rem', color:'var(--text1)', marginBottom:12, lineHeight:1.4 }}>
              {result.title.slice(0, 120)}{result.title.length > 120 ? '…' : ''}
            </p>
          )}
          <div className="flex gap-2">
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex-1 flex items-center justify-center gap-2"
              style={{ padding:'11px 0', fontSize:'.85rem', textDecoration:'none' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M19 12l-7 7-7-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Télécharger HD
            </a>
            <button
              onClick={() => { navigator.clipboard.writeText(result.url); setToast('Lien copié !') }}
              className="btn-secondary flex items-center justify-center gap-1"
              style={{ padding:'11px 14px', fontSize:'.8rem' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="2"/></svg>
              Copier
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Upload fichier → URL (image via base64, fichier via placeholder) ──────
async function fileToPayload(file: File): Promise<{ imageUrl?: string; fileUrl?: string; fileName?: string }> {
  if (file.type.startsWith('image/')) {
    return new Promise(resolve => {
      const reader = new FileReader()
      reader.onload = e => resolve({ imageUrl: e.target?.result as string })
      reader.readAsDataURL(file)
    })
  }
  // Pour les fichiers non-image, on envoie le nom + fake URL (le serveur gère)
  return { fileUrl: `file://${file.name}`, fileName: file.name }
}

// ─── Chat principal ────────────────────────────────────────────────────────
function ChatContent() {
  const router = useRouter()
  const params = useSearchParams()
  const providerId = params.get('p') || 'openai'
  const initialModel = params.get('m') || ''

  const provider = PROVIDERS.find(p => p.id === providerId) || PROVIDERS[0]
  const isFBDL = provider.id === 'fbdl'

  const firstModel = provider.modelGroups[0]?.models[0]
  const [selectedModel, setSelectedModel] = useState<AIModel>(
    provider.modelGroups.flatMap(g => g.models).find(m => m.id === initialModel) || firstModel
  )
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [pendingImage, setPendingImage] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<{ url: string; name: string } | null>(null)
  const [toast, setToast] = useState('')

  const bottomRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const storageKey = `nxai_${provider.id}_${selectedModel?.id || 'default'}`

  // Charger messages depuis localStorage
  useEffect(() => {
    if (isFBDL) return
    try {
      const raw = localStorage.getItem(storageKey)
      setMessages(raw ? JSON.parse(raw) : [])
    } catch { setMessages([]) }
  }, [storageKey, isFBDL])

  // Sauvegarder messages
  useEffect(() => {
    if (isFBDL || messages.length === 0) return
    localStorage.setItem(storageKey, JSON.stringify(messages))
  }, [messages, storageKey, isFBDL])

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const payload = await fileToPayload(file)
    if (payload.imageUrl) setPendingImage(payload.imageUrl)
    if (payload.fileUrl) setPendingFile({ url: payload.fileUrl, name: payload.fileName! })
    e.target.value = ''
  }

  const sendMessage = async () => {
    const text = input.trim()
    if (!text && !pendingImage && !pendingFile) return
    if (loading) return

    const userMsg: Message = {
      id: Date.now().toString(), role: 'user', content: text,
      imageUrl: pendingImage || undefined,
      fileName: pendingFile?.name || undefined,
      timestamp: Date.now()
    }
    setMessages(prev => [...prev, userMsg])
    setInput(''); setPendingImage(null); setPendingFile(null)
    setLoading(true)

    // Auto-resize textarea
    if (textareaRef.current) { textareaRef.current.style.height = 'auto' }

    try {
      const serverUrl = getServerUrl()
      const body: Record<string, any> = {
        message: text,
        model: selectedModel?.id,
        uid: '2',
        history: messages.slice(-12).map(m => ({ role: m.role, content: m.content })),
      }
      if (pendingImage) body.img_url = pendingImage
      if (pendingFile) body.file = pendingFile.url

      const res = await fetch(`${serverUrl}${provider.endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      const reply = data.reply || data.response || data.message || data.content || 'Réponse vide.'

      setMessages(prev => [...prev, {
        id: (Date.now()+1).toString(), role: 'assistant',
        content: reply, timestamp: Date.now()
      }])
    } catch (e: any) {
      setMessages(prev => [...prev, {
        id: (Date.now()+1).toString(), role: 'assistant',
        content: `⚠️ **Erreur de connexion**\n\nImpossible de contacter le serveur.\n\`\`\`\n${e.message}\n\`\`\``,
        timestamp: Date.now()
      }])
    } finally { setLoading(false) }
  }

  const clearChat = () => {
    setMessages([]); localStorage.removeItem(storageKey)
    setToast('Conversation effacée')
  }

  const exportTxt = () => {
    const txt = messages.map(m => `[${m.role === 'user' ? 'Moi' : provider.name}]\n${m.content}`).join('\n\n---\n\n')
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = `NexusAI_${provider.id}_${Date.now()}.txt`; a.click()
    setToast('Conversation exportée !')
    setShowExportMenu(false)
  }

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(messages, null, 2)], { type: 'application/json' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = `NexusAI_${provider.id}_${Date.now()}.json`; a.click()
    setToast('JSON exporté !')
    setShowExportMenu(false)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const autoResize = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const t = e.target as HTMLTextAreaElement
    t.style.height = 'auto'
    t.style.height = Math.min(t.scrollHeight, 130) + 'px'
  }

  return (
    <div className="flex flex-col min-h-screen min-h-dvh" style={{ background:'var(--bg)', maxWidth:'100vw', overflow:'hidden' }}>
      {toast && <Toast msg={toast} onHide={() => setToast('')} />}

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 safe-top" style={{ height:60, background:'rgba(255,255,255,.95)', backdropFilter:'blur(16px)', borderBottom:'1px solid var(--border)', flexShrink:0, position:'sticky', top:0, zIndex:50 }}>
        {/* Retour */}
        <button
          onClick={() => router.push('/')}
          style={{ width:36, height:36, borderRadius:10, background:'var(--bg2)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0, transition:'all .2s' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M12 5l-7 7 7 7" stroke="var(--text2)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>

        {/* Logo + Nom provider */}
        <div className={`${provider.bgClass} flex items-center justify-center rounded-xl flex-shrink-0`} style={{ width:36, height:36 }}>
          <ProviderLogo svgStr={provider.logo} size={20} />
        </div>

        <div className="flex-1 min-w-0">
          <p style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontWeight:800, fontSize:'.9rem', color:'var(--text1)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {provider.name}
          </p>
          {!isFBDL && selectedModel && (
            <button
              onClick={() => setShowPicker(true)}
              style={{ display:'flex', alignItems:'center', gap:3, background:'none', border:'none', cursor:'pointer', padding:0 }}
            >
              <span style={{ fontSize:'.72rem', color:provider.color, fontWeight:700 }}>{selectedModel.label}</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke={provider.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          )}
        </div>

        {/* Actions */}
        {!isFBDL && (
          <div className="flex items-center gap-1.5 relative">
            {/* Export */}
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              style={{ width:34, height:34, borderRadius:9, background:'var(--bg2)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M19 12l-7 7-7-7" stroke="var(--text2)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            {showExportMenu && (
              <div style={{ position:'absolute', top:40, right:0, background:'white', border:'1px solid var(--border)', borderRadius:12, boxShadow:'var(--shadow-lg)', zIndex:100, minWidth:140, overflow:'hidden' }}>
                <button onClick={exportTxt} style={{ display:'flex', alignItems:'center', gap:8, width:'100%', padding:'10px 14px', background:'none', border:'none', cursor:'pointer', fontSize:'.8rem', color:'var(--text1)', fontWeight:600, fontFamily:'Plus Jakarta Sans,sans-serif' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/><polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2"/></svg>
                  Export .txt
                </button>
                <button onClick={exportJson} style={{ display:'flex', alignItems:'center', gap:8, width:'100%', padding:'10px 14px', background:'none', border:'none', cursor:'pointer', fontSize:'.8rem', color:'var(--text1)', fontWeight:600, borderTop:'1px solid var(--border)', fontFamily:'Plus Jakarta Sans,sans-serif' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/><polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2"/></svg>
                  Export .json
                </button>
              </div>
            )}
            {/* Effacer */}
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                style={{ width:34, height:34, borderRadius:9, background:'var(--bg2)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke="var(--text2)" strokeWidth="2"/><path d="M19 6l-1 14H6L5 6" stroke="var(--text2)" strokeWidth="2"/><path d="M10 11v6M14 11v6" stroke="var(--text2)" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Model Picker ── */}
      {showPicker && !isFBDL && (
        <ModelPicker
          provider={provider}
          selected={selectedModel?.id || ''}
          onSelect={m => setSelectedModel(m)}
          onClose={() => setShowPicker(false)}
        />
      )}

      {/* ── FB Downloader ou Chat ── */}
      {isFBDL ? <FBDownloader /> : (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 pt-4">
            {messages.length === 0 ? (
              /* Écran vide */
              <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                <div
                  className={`${provider.bgClass} flex items-center justify-center rounded-3xl mb-5 anim-float`}
                  style={{ width:72, height:72 }}
                >
                  <ProviderLogo svgStr={provider.logo} size={38} />
                </div>
                <p style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontWeight:800, fontSize:'1.1rem', color:'var(--text1)', marginBottom:6 }}>
                  {provider.name}
                </p>
                <p style={{ fontSize:'.82rem', color:'var(--text3)', marginBottom:20, lineHeight:1.5 }}>
                  {provider.description}
                </p>
                {/* Suggestions */}
                <div className="flex flex-col gap-2 w-full max-w-xs">
                  {['💡 Explique-moi comment fonctionne...', '✍️ Écris un texte sur...', '💻 Génère du code pour...', '🔍 Analyse ceci :'].map(s => (
                    <button
                      key={s}
                      onClick={() => setInput(s.slice(2).trim())}
                      style={{ padding:'9px 14px', borderRadius:10, background:'var(--surface)', border:'1px solid var(--border)', color:'var(--text2)', fontSize:'.8rem', cursor:'pointer', textAlign:'left', fontWeight:600, transition:'all .15s' }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map(m => (
                  <MsgBubble key={m.id} msg={m} providerColor={provider.color} providerLogo={provider.logo} />
                ))}
                {loading && <SkeletonMsg providerColor={provider.color} providerLogo={provider.logo} />}
              </>
            )}
            <div ref={bottomRef} />
          </div>

          {/* ── Input ── */}
          <div className="flex-shrink-0 px-4 pb-4 safe-bottom" style={{ paddingTop:10, background:'rgba(255,255,255,.95)', backdropFilter:'blur(16px)', borderTop:'1px solid var(--border)' }}>
            {/* Aperçu pièce jointe */}
            {(pendingImage || pendingFile) && (
              <div className="flex gap-2 mb-2">
                {pendingImage && (
                  <div style={{ position:'relative', display:'inline-block' }}>
                    <img src={pendingImage} alt="preview" style={{ height:52, width:52, objectFit:'cover', borderRadius:10, border:'1px solid var(--border)' }} />
                    <button onClick={() => setPendingImage(null)} style={{ position:'absolute', top:-5, right:-5, background:'var(--red)', border:'none', borderRadius:50, width:18, height:18, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg>
                    </button>
                  </div>
                )}
                {pendingFile && (
                  <div style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 10px', borderRadius:10, background:`${provider.color}10`, border:`1px solid ${provider.color}25`, color:provider.color, fontSize:'.72rem', fontWeight:700 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/><polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2"/></svg>
                    {pendingFile.name}
                    <button onClick={() => setPendingFile(null)} style={{ background:'none', border:'none', cursor:'pointer', padding:0, color:'inherit', opacity:.7 }}>✕</button>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-end gap-2" style={{ background:'var(--bg2)', border:`1.5px solid ${input ? provider.color+'60' : 'var(--border)'}`, borderRadius:16, padding:'8px 10px', transition:'border-color .2s' }}>
              {/* Attach */}
              {(provider.supportsImage || provider.supportsFile) && (
                <button
                  onClick={() => fileRef.current?.click()}
                  style={{ width:34, height:34, borderRadius:9, background:'var(--surface)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" stroke="var(--text2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*,.pdf,.txt,.doc,.docx,.csv" className="hidden" onChange={handleFileUpload} />

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                onInput={autoResize}
                placeholder={`Message ${provider.name}…`}
                rows={1}
                style={{ flex:1, resize:'none', background:'transparent', border:'none', outline:'none', color:'var(--text1)', fontSize:'.875rem', lineHeight:1.5, maxHeight:130, fontFamily:'Nunito,sans-serif', padding:'4px 2px' }}
              />

              {/* Envoyer */}
              <button
                onClick={sendMessage}
                disabled={loading || (!input.trim() && !pendingImage && !pendingFile)}
                style={{
                  width:36, height:36, borderRadius:10, flexShrink:0, border:'none', cursor:'pointer',
                  background: (loading || (!input.trim() && !pendingImage && !pendingFile))
                    ? 'var(--border2)' : `linear-gradient(135deg, ${provider.color}, ${provider.color}CC)`,
                  display:'flex', alignItems:'center', justifyContent:'center', transition:'all .2s',
                  boxShadow: (loading || !input.trim()) ? 'none' : `0 4px 12px ${provider.color}40`
                }}
              >
                {loading
                  ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ animation:'spin 1s linear infinite' }}><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2.5" strokeDasharray="31.4" strokeDashoffset="10"/></svg>
                  : <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                }
              </button>
            </div>
          </div>
        </>
      )}

      {/* Spin keyframe */}
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'var(--bg)' }}><div className="skeleton" style={{ width:60, height:60, borderRadius:16 }} /></div>}>
      <ChatContent />
    </Suspense>
  )
}
