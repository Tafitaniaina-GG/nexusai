'use client'
import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Send, Plus, Copy, Check, Download, Paperclip, ChevronDown, X, Image as ImageIcon } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { getServerUrl } from '../utils/config'

// ——— Types ———
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  imageUrl?: string
  fileName?: string
  timestamp: number
}

interface ModelConfig {
  id: string
  group: string
  icon: string
  color: string
  endpoint: string
  models: { value: string; label: string }[]
}

// ——— Model configs ———
const MODEL_CONFIGS: Record<string, ModelConfig> = {
  openai: {
    id: 'openai', group: 'OpenAI', icon: '⚡', color: '#00E5FF',
    endpoint: '/api/openai',
    models: [
      { value: 'gpt-4.1', label: 'GPT-4.1' },
      { value: 'gpt-4o', label: 'GPT-4o' },
      { value: 'gpt-4o-mini', label: 'GPT-4o-mini' },
      { value: 'o1-pro', label: 'o1-pro' },
      { value: 'o3', label: 'o3' },
    ],
  },
  chipp: {
    id: 'chipp', group: 'Chipp AI', icon: '🧠', color: '#7C3AED',
    endpoint: '/api/chipp',
    models: [
      { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
      { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
      { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
    ],
  },
  typegpt: {
    id: 'typegpt', group: 'RTM Router', icon: '🔀', color: '#F72585',
    endpoint: '/api/typegpt',
    models: [
      { value: 'deepseek-r2', label: 'DeepSeek-R2' },
      { value: 'kimi-k2', label: 'Kimi-K2' },
      { value: 'llama-4-scout', label: 'Llama 4 Scout' },
      { value: 'qwen3-235b', label: 'Qwen 3-235B' },
    ],
  },
  groq: {
    id: 'groq', group: 'Groq Speed', icon: '🚀', color: '#06FFA5',
    endpoint: '/api/groq',
    models: [
      { value: 'llama-3.3-70b', label: 'Llama 3.3 70B' },
      { value: 'kimi-k2', label: 'Kimi-K2' },
      { value: 'mixtral-8x7b', label: 'Mixtral 8x7B' },
    ],
  },
  fbdl: {
    id: 'fbdl', group: 'Downloader', icon: '📥', color: '#FF9500',
    endpoint: '/api/fbdl',
    models: [
      { value: 'hd', label: 'HD Quality' },
      { value: 'sd', label: 'SD Quality' },
    ],
  },
}

// ——— Code block component ———
function CodeBlock({ language, children }: { language: string; children: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="my-3 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(0,229,255,0.15)' }}>
      <div className="flex items-center justify-between px-3 py-2" style={{ background: 'rgba(0,0,0,0.5)' }}>
        <span className="text-xs font-mono" style={{ color: 'var(--aurora-cyan)', opacity: 0.7 }}>
          {language || 'code'}
        </span>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg transition-all"
          style={{
            background: copied ? 'rgba(6,255,165,0.15)' : 'rgba(255,255,255,0.06)',
            color: copied ? '#06FFA5' : 'var(--text-secondary)',
            border: `1px solid ${copied ? 'rgba(6,255,165,0.3)' : 'rgba(255,255,255,0.08)'}`,
          }}
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? 'Copié!' : 'Copier'}
        </button>
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={language}
        PreTag="div"
        customStyle={{
          margin: 0,
          padding: '12px 16px',
          background: 'rgba(0,0,0,0.7)',
          fontSize: '0.8rem',
          lineHeight: 1.6,
        }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  )
}

// ——— Message bubble ———
function MessageBubble({ message, accentColor }: { message: Message; accentColor: string }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-sm mr-2 mt-1 flex-shrink-0"
          style={{ background: `${accentColor}20`, border: `1px solid ${accentColor}30` }}
        >
          ✦
        </div>
      )}
      <div className={`max-w-[85%] ${isUser ? '' : 'flex-1'}`}>
        {message.imageUrl && (
          <div className="mb-2">
            <img
              src={message.imageUrl}
              alt="uploaded"
              className="rounded-xl max-h-48 object-cover"
              style={{ border: `1px solid ${accentColor}30` }}
            />
          </div>
        )}
        {message.fileName && (
          <div
            className="mb-2 flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
            style={{ background: `${accentColor}10`, border: `1px solid ${accentColor}20`, color: accentColor }}
          >
            <Paperclip size={12} />
            {message.fileName}
          </div>
        )}
        <div
          className={`px-4 py-3 rounded-2xl ${isUser ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
          style={
            isUser
              ? {
                  background: `linear-gradient(135deg, ${accentColor}25, ${accentColor}15)`,
                  border: `1px solid ${accentColor}30`,
                }
              : {
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }
          }
        >
          {isUser ? (
            <p className="text-sm" style={{ color: 'var(--text-primary)', lineHeight: 1.6 }}>
              {message.content}
            </p>
          ) : (
            <div className="markdown-content text-sm">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '')
                    const isBlock = !props.inline
                    return isBlock && match ? (
                      <CodeBlock language={match[1]}>{String(children).replace(/\n$/, '')}</CodeBlock>
                    ) : (
                      <code className={className} {...props}>{children}</code>
                    )
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ——— Facebook Downloader ———
function FBDownloader({ accentColor }: { accentColor: string }) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const download = async () => {
    if (!url.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const serverUrl = getServerUrl()
      const res = await fetch(`${serverUrl}/api/fbdl`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
    } catch (e: any) {
      setError(e.message || 'Erreur lors du téléchargement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-semibold" style={{ color: 'var(--text-secondary)', fontFamily: 'Syne, sans-serif' }}>
          URL Facebook
        </label>
        <div className="flex gap-2">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.facebook.com/..."
            className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${url ? accentColor + '40' : 'rgba(255,255,255,0.08)'}`,
              color: 'var(--text-primary)',
            }}
          />
          <button
            onClick={download}
            disabled={loading || !url.trim()}
            className="px-4 py-3 rounded-xl font-bold text-sm transition-all"
            style={{
              background: loading ? 'rgba(255,149,0,0.1)' : `linear-gradient(135deg, ${accentColor}, #FF5E00)`,
              color: loading ? accentColor : '#000',
              opacity: !url.trim() ? 0.4 : 1,
              fontFamily: 'Syne, sans-serif',
            }}
          >
            {loading ? '...' : '↓'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(247,37,133,0.1)', border: '1px solid rgba(247,37,133,0.2)', color: '#F72585' }}>
          ⚠ {error}
        </div>
      )}

      {result && (
        <div className="space-y-3">
          {result.thumbnail && (
            <img src={result.thumbnail} alt="thumb" className="w-full rounded-xl max-h-48 object-cover" />
          )}
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {result.title || 'Vidéo Facebook'}
          </p>
          <div className="flex gap-2">
            {result.hd && (
              <a
                href={result.hd}
                download
                className="flex-1 py-3 text-center rounded-xl text-sm font-bold transition-all"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}, #FF5E00)`,
                  color: '#000',
                  fontFamily: 'Syne, sans-serif',
                }}
              >
                ↓ HD
              </a>
            )}
            {result.sd && (
              <a
                href={result.sd}
                download
                className="flex-1 py-3 text-center rounded-xl text-sm font-bold"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'var(--text-primary)',
                  fontFamily: 'Syne, sans-serif',
                }}
              >
                ↓ SD
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ——— Skeleton loader ———
function SkeletonMessage({ accentColor }: { accentColor: string }) {
  return (
    <div className="flex justify-start mb-4">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center text-sm mr-2 mt-1"
        style={{ background: `${accentColor}20`, border: `1px solid ${accentColor}30` }}
      >
        ✦
      </div>
      <div className="flex-1 max-w-[85%] space-y-2">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-2/3" />
      </div>
    </div>
  )
}

// ——— Main Chat component ———
function ChatContent() {
  const router = useRouter()
  const params = useSearchParams()
  const modelId = params.get('model') || 'openai'
  const config = MODEL_CONFIGS[modelId] || MODEL_CONFIGS.openai

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState(config.models[0].value)
  const [showModelPicker, setShowModelPicker] = useState(false)
  const [attachedImage, setAttachedImage] = useState<string | null>(null)
  const [attachedFile, setAttachedFile] = useState<{ name: string; url: string } | null>(null)
  const [sessionId] = useState(() => `${modelId}-${Date.now()}`)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`nexusai-chat-${modelId}-${selectedModel}`)
    if (saved) {
      try { setMessages(JSON.parse(saved)) } catch {}
    }
  }, [modelId, selectedModel])

  // Save to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`nexusai-chat-${modelId}-${selectedModel}`, JSON.stringify(messages))
    }
  }, [messages, modelId, selectedModel])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text && !attachedImage && !attachedFile) return
    if (loading) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      imageUrl: attachedImage || undefined,
      fileName: attachedFile?.name || undefined,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setAttachedImage(null)
    setAttachedFile(null)
    setLoading(true)

    try {
      const serverUrl = getServerUrl()
      const body: any = {
        message: text,
        model: selectedModel,
        sessionId,
        history: messages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
      }
      if (attachedImage) body.img_url = attachedImage
      if (attachedFile) body.file = attachedFile.url

      const res = await fetch(`${serverUrl}${config.endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      const reply = data.reply || data.message || data.content || 'Erreur: réponse vide'

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch (e: any) {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ **Erreur de connexion**\n\nImpossible de joindre le serveur. Vérifiez votre connexion.\n\n\`${e.message}\``,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, errMsg])
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (ev) => setAttachedImage(ev.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      // For non-images, use a fake URL placeholder
      setAttachedFile({ name: file.name, url: `file://${file.name}` })
    }
  }

  const exportChat = () => {
    const text = messages.map((m) => `[${m.role.toUpperCase()}]\n${m.content}\n`).join('\n---\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nexusai-chat-${Date.now()}.txt`
    a.click()
  }

  const clearChat = () => {
    setMessages([])
    localStorage.removeItem(`nexusai-chat-${modelId}-${selectedModel}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const accentColor = config.color
  const isFBDL = modelId === 'fbdl'

  return (
    <div className="flex flex-col min-h-screen min-h-dvh bg-void" style={{ maxWidth: '100vw', overflow: 'hidden' }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 safe-top flex-shrink-0"
        style={{
          background: 'rgba(5,5,8,0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <button
          onClick={() => router.push('/')}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <ArrowLeft size={16} style={{ color: 'var(--text-secondary)' }} />
        </button>

        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
          style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}30` }}
        >
          {config.icon}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm truncate" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}>
            {config.group}
          </p>
          {!isFBDL && (
            <button
              onClick={() => setShowModelPicker(!showModelPicker)}
              className="flex items-center gap-1 text-xs"
              style={{ color: accentColor }}
            >
              <span>{config.models.find((m) => m.value === selectedModel)?.label}</span>
              <ChevronDown size={11} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <>
              <button
                onClick={exportChat}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-90"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <Download size={14} style={{ color: 'var(--text-secondary)' }} />
              </button>
              <button
                onClick={clearChat}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-90"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <X size={14} style={{ color: 'var(--text-secondary)' }} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Model picker dropdown */}
      {showModelPicker && !isFBDL && (
        <div
          className="mx-4 mt-1 rounded-xl overflow-hidden flex-shrink-0"
          style={{
            background: 'rgba(10,10,20,0.98)',
            border: `1px solid ${accentColor}30`,
            boxShadow: `0 8px 30px rgba(0,0,0,0.5), 0 0 20px ${accentColor}15`,
          }}
        >
          {config.models.map((m) => (
            <button
              key={m.value}
              onClick={() => { setSelectedModel(m.value); setShowModelPicker(false) }}
              className="w-full flex items-center justify-between px-4 py-3 text-sm transition-all"
              style={{
                color: selectedModel === m.value ? accentColor : 'var(--text-secondary)',
                background: selectedModel === m.value ? `${accentColor}10` : 'transparent',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                fontFamily: 'Syne, sans-serif',
                fontWeight: selectedModel === m.value ? 600 : 400,
              }}
            >
              {m.label}
              {selectedModel === m.value && <Check size={14} />}
            </button>
          ))}
        </div>
      )}

      {/* Messages / FB Downloader */}
      <div className="flex-1 overflow-y-auto px-4 py-4" style={{ scrollBehavior: 'smooth' }}>
        {isFBDL ? (
          <FBDownloader accentColor={accentColor} />
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl animate-float"
              style={{
                background: `${accentColor}10`,
                border: `1px solid ${accentColor}20`,
                boxShadow: `0 0 40px ${accentColor}15`,
              }}
            >
              {config.icon}
            </div>
            <div className="space-y-1">
              <p className="font-bold text-lg" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}>
                {config.group}
              </p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Commencez une conversation
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {['Explique-moi...', 'Écris un code...', 'Analyse ceci...'].map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="px-3 py-1.5 rounded-full text-xs transition-all active:scale-95"
                  style={{
                    background: `${accentColor}10`,
                    border: `1px solid ${accentColor}25`,
                    color: accentColor,
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} accentColor={accentColor} />
            ))}
            {loading && <SkeletonMessage accentColor={accentColor} />}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      {!isFBDL && (
        <div
          className="flex-shrink-0 px-4 pb-4 safe-bottom"
          style={{
            background: 'rgba(5,5,8,0.95)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            paddingTop: '12px',
          }}
        >
          {/* Attached preview */}
          {(attachedImage || attachedFile) && (
            <div className="mb-2 flex items-center gap-2">
              {attachedImage && (
                <div className="relative">
                  <img src={attachedImage} alt="preview" className="h-12 w-12 rounded-lg object-cover" />
                  <button
                    onClick={() => setAttachedImage(null)}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: '#F72585' }}
                  >
                    <X size={8} color="white" />
                  </button>
                </div>
              )}
              {attachedFile && (
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
                  style={{ background: `${accentColor}10`, border: `1px solid ${accentColor}20`, color: accentColor }}
                >
                  <Paperclip size={11} />
                  {attachedFile.name}
                  <button onClick={() => setAttachedFile(null)}>
                    <X size={10} />
                  </button>
                </div>
              )}
            </div>
          )}

          <div
            className="flex items-end gap-2 rounded-2xl px-3 py-2"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${input ? accentColor + '40' : 'rgba(255,255,255,0.08)'}`,
              transition: 'border-color 0.3s',
            }}
          >
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-90"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Plus size={18} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.txt,.doc,.docx"
              className="hidden"
              onChange={handleFileUpload}
            />

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${config.group}...`}
              rows={1}
              className="flex-1 resize-none outline-none bg-transparent text-sm py-1"
              style={{
                color: 'var(--text-primary)',
                maxHeight: '120px',
                lineHeight: 1.5,
              }}
              onInput={(e) => {
                const t = e.target as HTMLTextAreaElement
                t.style.height = 'auto'
                t.style.height = Math.min(t.scrollHeight, 120) + 'px'
              }}
            />

            <button
              onClick={sendMessage}
              disabled={loading || (!input.trim() && !attachedImage && !attachedFile)}
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-90"
              style={{
                background: loading || (!input.trim() && !attachedImage && !attachedFile)
                  ? 'rgba(255,255,255,0.06)'
                  : `linear-gradient(135deg, ${accentColor}, ${accentColor}99)`,
                opacity: loading || (!input.trim() && !attachedImage && !attachedFile) ? 0.4 : 1,
              }}
            >
              <Send size={14} color={loading || (!input.trim() && !attachedImage && !attachedFile) ? 'var(--text-secondary)' : '#000'} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-void"><div className="skeleton w-16 h-16 rounded-2xl" /></div>}>
      <ChatContent />
    </Suspense>
  )
}
