# ✦ NexusAI — Guide Termux → GitHub → APK

## ÉTAPE 1 — Préparer Termux

```bash
pkg update && pkg upgrade -y
pkg install -y git nodejs-lts

# Vérifier
node --version && npm --version && git --version
```

---

## ÉTAPE 2 — Configurer Git & SSH

```bash
git config --global user.name "VotreNom"
git config --global user.email "votre@email.com"

# Générer clé SSH
ssh-keygen -t ed25519 -C "votre@email.com" -f ~/.ssh/id_ed25519 -N ""

# Afficher la clé à copier sur GitHub
cat ~/.ssh/id_ed25519.pub
```

👉 **GitHub → Settings → SSH keys → New SSH key** → coller la clé

```bash
# Tester la connexion
ssh -T git@github.com
```

---

## ÉTAPE 3 — Encoder l'URL Render (obfuscation)

Après avoir déployé le serveur sur Render, encoder l'URL :

```bash
# Remplacer par votre URL Render réelle
URL="https://nexusai-server.onrender.com"

# Encoder en XOR+Base64 (copier ce résultat)
node -e "
const K=[0x4E,0x58,0x41,0x49];
const enc=btoa(Array.from('$URL').map((c,i)=>String.fromCharCode(c.charCodeAt(0)^K[i%K.length])).join(''));
console.log('ENC_URL=',enc);
"
```

---

## ÉTAPE 4 — Créer les repos GitHub

### Repo 1 — Frontend (APK)
```bash
cd nexusai
git init
git add .
git commit -m "🚀 NexusAI v1.0 — Light premium design"
git branch -M main
git remote add origin git@github.com:VOTRE_USERNAME/nexusai.git
git push -u origin main
```

### Repo 2 — Serveur Render
```bash
cd nexusai/server
git init
git add .
git commit -m "🖥️ NexusAI Server"
git branch -M main
git remote add origin git@github.com:VOTRE_USERNAME/nexusai-server.git
git push -u origin main
```

---

## ÉTAPE 5 — Déployer sur Render

1. Aller sur **render.com** → New → Web Service
2. Connecter le repo **nexusai-server**
3. Config :
   - **Build Command** : `npm install`
   - **Start Command** : `node server.js`
   - **Plan** : Free
4. **Environment Variables** :
   ```
   ERX_APIKEY = zk-7c7fa3ac023a0bfa135afd96839344c43a52ccc28f0c530cdc051d7a8c0bef79
   ```
5. Cliquer **Deploy** → Récupérer l'URL (ex: `https://nexusai-server.onrender.com`)

---

## ÉTAPE 6 — Ajouter les secrets GitHub

Sur **GitHub → nexusai (repo frontend) → Settings → Secrets → Actions** :

```
NEXT_PUBLIC_ENC_URL = [le résultat de l'encodage de l'étape 3]
```

---

## ÉTAPE 7 — Builder l'APK

```bash
# Déclencher le build (depuis Termux)
cd nexusai
git add . && git commit -m "⚙️ Config secrets" && git push
```

👉 **GitHub → Actions → Build NexusAI APK** → attendre ~10-15 min

📦 **Télécharger l'APK** → Onglet **Releases** du repo → `NexusAI-v1.0.apk`

---

## RÉSUMÉ 5 COMMANDES

```bash
# 1. Setup Termux
pkg update && pkg install -y git nodejs-lts

# 2. SSH
ssh-keygen -t ed25519 -C "email" -f ~/.ssh/id_ed25519 -N "" && cat ~/.ssh/id_ed25519.pub

# 3. Push frontend
cd nexusai && git init && git add . && git commit -m "🚀 v1.0" && git remote add origin git@github.com:USERNAME/nexusai.git && git push -u origin main

# 4. Push serveur
cd server && git init && git add . && git commit -m "🖥️ server" && git remote add origin git@github.com:USERNAME/nexusai-server.git && git push -u origin main

# 5. Render: deploy + add ENV → GitHub Actions build APK automatiquement
```

---

## NOTES

- **Free Render** dort après 15min → première requête lente (~30s)
- **UptimeRobot** (gratuit) peut pinger toutes les 10min pour éviter le sleep
- **APK pèse ~15-25 MB** — taille normale
- **Sources inconnues** doit être activé sur Android pour installer l'APK

---
*NexusAI v1.0 · Style Light Premium · 4 providers IA + 60+ modèles + Facebook DL*
