// Obfuscation: URL encodée en Base64 pour empêcher le sniffing simple
// Dans le .env: NEXT_PUBLIC_SERVER_URL=https://your-render-app.onrender.com

function decodeServerUrl(): string {
  // 1. Priorité: variable d'environnement (build time)
  const envUrl = process.env.NEXT_PUBLIC_SERVER_URL
  if (envUrl && envUrl.length > 0) return envUrl

  // 2. Fallback: URL encodée (remplacer par votre URL Render encodée en base64)
  // Pour encoder: btoa('https://your-app.onrender.com')
  const encoded = 'VOTRE_URL_EN_BASE64_ICI'
  try {
    return atob(encoded)
  } catch {
    return ''
  }
}

let cachedUrl: string | null = null

export function getServerUrl(): string {
  if (cachedUrl) return cachedUrl
  cachedUrl = decodeServerUrl()
  return cachedUrl
}

// Pour générer l'encodage: utilisez dans la console:
// btoa('https://your-app.onrender.com')
