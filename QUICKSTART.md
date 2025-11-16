# 🚀 Guide de Démarrage Rapide

## Pour votre machine locale (avec Ollama déjà installé)

Vous avez mentionné qu'Ollama est déjà installé sur votre machine locale. Voici comment adapter ce projet :

### 1. Transférer le code sur votre machine locale

```bash
# Sur votre machine locale
git clone <url-du-repo>
cd AgentIA_Commercial
```

### 2. Configuration de l'URL Ollama

Éditez le fichier `.env.local` :

```bash
# Si Ollama tourne sur la même machine
OLLAMA_BASE_URL="http://localhost:11434"

# Si Ollama tourne sur une autre machine de votre réseau local
OLLAMA_BASE_URL="http://192.168.X.X:11434"
```

### 3. S'assurer qu'Ollama accepte les connexions

Si vous utilisez Ollama sur une machine distante, lancez-le avec :

```bash
# Sur la machine où tourne Ollama
OLLAMA_HOST=0.0.0.0 ollama serve
```

### 4. Vérifier les modèles disponibles

```bash
# Lister les modèles installés
ollama list

# Si les modèles requis ne sont pas installés
ollama pull mistral:7b-instruct
ollama pull mixtral:8x7b          # Optionnel mais recommandé
ollama pull nomic-embed-text      # Pour RAG (Phase 2)
```

### 5. Lancer le setup automatique

```bash
# Script qui configure tout automatiquement
./scripts/dev-setup.sh
```

Ce script va :
- ✅ Vérifier Node.js et Docker
- ✅ Installer les dépendances npm
- ✅ Démarrer PostgreSQL, ChromaDB et Redis
- ✅ Initialiser la base de données
- ✅ Vérifier qu'Ollama est accessible

### 6. Démarrer l'application

```bash
npm run dev
```

Ouvrez http://localhost:3000 dans votre navigateur !

---

## 📝 Configuration Ollama Distant (Réseau Local)

Si votre Ollama tourne sur une autre machine de votre réseau :

### Sur la machine Ollama

```bash
# Permettre les connexions externes
OLLAMA_HOST=0.0.0.0 ollama serve
```

### Sur la machine de développement (Next.js)

Éditez `.env.local` :

```bash
# Remplacez par l'IP de votre machine Ollama
OLLAMA_BASE_URL="http://192.168.1.100:11434"
```

Testez la connexion :

```bash
curl http://192.168.1.100:11434/api/tags
```

---

## ⚡ Démarrage Ultra-Rapide (tout en une commande)

Si tout est déjà configuré et que vous voulez juste relancer le projet :

```bash
# Démarrer Docker + Lancer l'app
docker-compose up -d && npm run dev
```

---

## 🐛 Problèmes Courants

### "Cannot connect to Ollama"

```bash
# Vérifier qu'Ollama tourne
curl http://localhost:11434/api/tags

# Si erreur, redémarrer Ollama
ollama serve
```

### "Database connection failed"

```bash
# Vérifier Docker
docker-compose ps

# Redémarrer si nécessaire
docker-compose restart postgres
```

### "Module not found @prisma/client"

```bash
# Régénérer Prisma
npm run db:generate
```

---

## 📊 Tester les Agents

Une fois l'app lancée, testez chaque type d'agent :

| Prompt | Agent déclenché |
|--------|----------------|
| "Analyse mon pipeline" | SALES_ANALYSIS |
| "Rédige un email de prospection" | EMAIL_WRITING |
| "Comment améliorer mes ventes ?" | COACHING |
| "Bonjour" | GENERAL |

---

## 🎯 Prochaines Étapes

1. ✅ Familiarisez-vous avec l'interface chat
2. ✅ Testez les différents agents
3. ✅ Explorez le code dans `src/lib/ollama/agents/`
4. 📝 Commencez à personnaliser les prompts dans `src/lib/ollama/prompts/`
5. 🗄️ Ajoutez vos propres données CRM dans la DB

---

**Besoin d'aide ?** Consultez le [README complet](./README.md) ou ouvrez une issue !
