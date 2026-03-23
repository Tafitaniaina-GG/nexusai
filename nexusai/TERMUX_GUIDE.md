# 📱 NexusAI — Guide Complet Termux → GitHub → APK

## 🎯 PARTIE 1 : Préparer Termux

### Installer les paquets nécessaires
```bash
# Mettre à jour Termux
pkg update && pkg upgrade -y

# Installer les dépendances
pkg install -y git nodejs-lts

# Vérifier les versions
node --version
npm --version
git --version
```

---

## 🎯 PARTIE 2 : Configurer Git & GitHub

### 2.1 — Configurer votre identité Git
```bash
git config --global user.name "VotreNom"
git config --global user.email "votre@email.com"
```

### 2.2 — Générer une clé SSH (recommandé)
```bash
# Générer la clé
ssh-keygen -t ed25519 -C "votre@email.com" -f ~/.ssh/id_ed25519 -N ""

# Afficher la clé publique (à copier sur GitHub)
cat ~/.ssh/id_ed25519.pub
```
👉 Aller sur **GitHub → Settings → SSH and GPG keys → New SSH key** et coller la clé.

### 2.3 — Tester la connexion SSH
```bash
ssh -T git@github.com
# Réponse attendue: "Hi username! You've successfully authenticated..."
```

---

## 🎯 PARTIE 3 : Créer les dépôts GitHub

### 3.1 — Installer GitHub CLI (optionnel mais pratique)
```bash
# Via npm
npm install -g gh

# Ou avec pkg
pkg install gh -y
```

### 3.2 — Créer Repo 1 (APK Frontend)
```bash
# Aller dans le dossier du projet
cd nexusai

# Initialiser git
git init
git add .
git commit -m "🚀 Initial commit - NexusAI v1.0"

# Créer le repo sur GitHub (avec gh CLI)
gh auth login
gh repo create nexusai --private --source=. --push

# OU manuellement:
# 1. Créer le repo sur github.com/new (nom: "nexusai", PRIVATE)
# 2. Puis:
git remote add origin git@github.com:VOTRE_USERNAME/nexusai.git
git branch -M main
git push -u origin main
```

### 3.3 — Créer Repo 2 (Serveur Render)
```bash
# Aller dans le dossier server
cd nexusai/server

# Initialiser git
git init
git add .
git commit -m "🖥️ NexusAI Server - Render deployment"

# Créer le repo
gh repo create nexusai-server --private --source=. --push

# OU manuellement:
git remote add origin git@github.com:VOTRE_USERNAME/nexusai-server.git
git branch -M main
git push -u origin main
```

---

## 🎯 PARTIE 4 : Déployer le Serveur sur Render

### 4.1 — Aller sur render.com
1. Créer un compte sur **render.com**
2. New → **Web Service**
3. Connecter votre repo GitHub **nexusai-server**
4. Configuration :
   - **Name:** `nexusai-server`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** Free

### 4.2 — Ajouter les variables d'environnement sur Render
Dans **Environment → Add Environment Variable** :
```
ERX_API_KEY = votre_clé_api_erx
ERX_BASE_URL = https://api.erx.ai/v1
```

### 4.3 — Récupérer l'URL du serveur
Après le déploiement, Render vous donne une URL comme :
```
https://nexusai-server.onrender.com
```

---

## 🎯 PARTIE 5 : Configurer l'URL dans l'APK

### 5.1 — Encoder l'URL en Base64 (obfuscation)
```bash
# Dans Termux :
echo -n "https://nexusai-server.onrender.com" | base64
# Exemple de résultat: aHR0cHM6Ly9uZXh1c2FpLXNlcnZlci5vbnJlbmRlci5jb20=
```

### 5.2 — Option A: Ajouter comme secret GitHub (recommandé)
1. Sur GitHub → Votre repo **nexusai** → **Settings → Secrets → Actions**
2. New secret: `NEXT_PUBLIC_SERVER_URL` = `https://nexusai-server.onrender.com`

L'URL sera injectée automatiquement lors du build via GitHub Actions.

### 5.3 — Option B: Modifier le fichier config (si build local)
Éditer `src/app/utils/config.ts` :
```typescript
const encoded = 'aHR0cHM6Ly9uZXh1c2FpLXNlcnZlci5vbnJlbmRlci5jb20='
// Remplacer par votre propre encodage Base64
```

---

## 🎯 PARTIE 6 : Builder l'APK via GitHub Actions

### 6.1 — Déclencher le build
```bash
# Pousser une modification pour déclencher le workflow
cd nexusai
git add .
git commit -m "✨ Configure server URL"
git push origin main
```

### 6.2 — Suivre le build
1. Aller sur **GitHub → Votre repo nexusai → Actions**
2. Cliquer sur le workflow **"Build NexusAI APK"**
3. Attendre ~10-15 minutes

### 6.3 — Télécharger l'APK
- **Via Artifacts** : Actions → Build → Artifacts → NexusAI-APK
- **Via Releases** : Onglet Releases du repo → Télécharger `NexusAI-v1.0.apk`

---

## 🎯 PARTIE 7 : Installer l'APK sur Android

```bash
# Si vous êtes sur le même appareil (Termux):
# 1. Télécharger l'APK depuis le navigateur
# 2. Ouvrir le fichier manager → NexusAI-v1.0.apk
# 3. Activer "Sources inconnues" si demandé
# 4. Installer

# OU via ADB depuis un PC:
adb install NexusAI-v1.0.apk
```

---

## 🛠️ COMMANDES UTILES (Maintenance)

### Mettre à jour l'app
```bash
cd nexusai
# Faire vos modifications...
git add .
git commit -m "🔧 Update: description des changements"
git push origin main
# → GitHub Actions rebuild automatiquement l'APK
```

### Tester localement dans le navigateur
```bash
cd nexusai
npm install
npm run dev
# Ouvrir http://localhost:3000
```

### Vérifier les logs du serveur Render
```bash
# Aller sur render.com → nexusai-server → Logs
# Ou via l'API Render
```

---

## 📂 Structure du projet
```
nexusai/                    ← Repo 1 (APK)
├── src/app/
│   ├── page.tsx            ← Dashboard principal
│   ├── chat/page.tsx       ← Interface de chat
│   ├── utils/config.ts     ← URL obfusquée
│   └── globals.css         ← Design premium
├── public/
│   ├── manifest.json       ← PWA config
│   └── icons/              ← Icônes APK
├── capacitor.config.ts     ← Config APK
├── .github/workflows/      ← Build automatique
└── .gitignore

nexusai/server/             ← Repo 2 (Serveur Render)
├── server.js               ← Proxy sécurisé
├── package.json
└── .env.example            ← Template variables
```

---

## ⚡ RÉSUMÉ EN 5 COMMANDES

```bash
# 1. Cloner / préparer
pkg install -y git nodejs-lts

# 2. Setup git
git config --global user.name "Vous" && git config --global user.email "vous@email.com"

# 3. Push frontend
cd nexusai && git init && git add . && git commit -m "🚀 NexusAI v1.0" && git remote add origin git@github.com:USERNAME/nexusai.git && git push -u origin main

# 4. Push server
cd server && git init && git add . && git commit -m "🖥️ Server" && git remote add origin git@github.com:USERNAME/nexusai-server.git && git push -u origin main

# 5. Déployer sur Render (manuellement sur render.com)
# → Connecter nexusai-server → Add ENV vars → Deploy!
```

---

## ❗ NOTES IMPORTANTES

- **Free Render** : Le serveur "dort" après 15min d'inactivité → 1ère requête lente (~30s)
- **Pour éviter le sleep** : UptimeRobot (ping toutes les 10min) → gratuit
- **Clé ERX** : Obtenir sur le site de votre fournisseur API
- **L'APK pèse ~15-25 MB** : Taille normale pour une app Capacitor

---
*NexusAI v1.0 — Partie 1/∞ | Prochainement: Video DL, Image Gen, Audio Tools*
