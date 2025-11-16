# 🤖 AgentIA Commercial

> **Copilot commercial 100% local pour TPE/PME françaises**

Un assistant IA commercial intelligent qui fonctionne entièrement en local avec Ollama. Aucune dépendance aux API cloud, vos données restent privées et sécurisées.

## 🎯 Fonctionnalités (Phase 1 - MVP)

- ✅ **Chat intelligent** avec routing automatique vers des agents spécialisés
- ✅ **Analyse commerciale** : Insights sur votre pipeline et vos performances
- ✅ **Rédaction d'emails** : Génération d'emails commerciaux personnalisés
- ✅ **CRM intégré** : Schéma complet pour gérer contacts, deals et activités
- ✅ **100% Local** : Propulsé par Ollama (Mistral, Mixtral, Llama 3.1)
- ✅ **Architecture multi-agents** : Router, Sales Analyst, Email Writer, Coach

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│      Next.js 14 (App Router)        │
│  - Interface Chat                   │
│  - API Routes                       │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     Agents Ollama (LangChain)       │
│  - Router Agent                     │
│  - Sales Analyst Agent              │
│  - Email Writer Agent               │
│  - General Agent                    │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Ollama (Local LLM)             │
│  - Mistral 7B                       │
│  - Mixtral 8x7B                     │
│  - Llama 3.1 8B                     │
└─────────────────────────────────────┘
```

## 📋 Prérequis

### Obligatoire

- **Node.js** 20+ et npm 10+
- **Docker** et Docker Compose (pour PostgreSQL, ChromaDB, Redis)
- **Ollama** installé et lancé localement

### Optionnel

- **GPU** : Recommandé pour de meilleures performances (Mixtral 8x7B)
- **RAM** : Minimum 16 GB, recommandé 32 GB

## 🚀 Installation

### 1. Cloner le projet

```bash
git clone <url-du-repo>
cd AgentIA_Commercial
```

### 2. Installer Ollama et les modèles

**Sur Linux/Mac** :

```bash
# Installer Ollama (si pas déjà fait)
curl -fsSL https://ollama.com/install.sh | sh

# Démarrer Ollama
ollama serve

# Dans un autre terminal, télécharger les modèles
ollama pull mistral:7b-instruct
ollama pull mixtral:8x7b          # Optionnel mais recommandé
ollama pull llama3.1:8b           # Optionnel
ollama pull nomic-embed-text      # Pour le RAG (Phase 2)
```

**Sur Windows** :

Téléchargez et installez depuis [https://ollama.com/download](https://ollama.com/download)

**Note** : Si votre Ollama est sur une machine distante, modifiez `OLLAMA_BASE_URL` dans `.env.local`

### 3. Installer les dépendances npm

```bash
npm install
```

### 4. Configurer les variables d'environnement

Le fichier `.env.local` a déjà été créé. **Modifiez-le selon votre configuration** :

```bash
# Si Ollama est sur une autre machine
OLLAMA_BASE_URL="http://192.168.1.100:11434"

# Si vous voulez utiliser des modèles différents
OLLAMA_ANALYST_MODEL="llama3.1:70b"
```

### 5. Démarrer les services Docker

```bash
# Démarrer PostgreSQL, ChromaDB et Redis
docker-compose up -d

# Vérifier que tout fonctionne
docker-compose ps
```

Vous devriez voir 3 conteneurs en cours d'exécution :
- `agentia_postgres`
- `agentia_chromadb`
- `agentia_redis`

### 6. Initialiser la base de données

```bash
# Générer le client Prisma
npm run db:generate

# Créer les tables
npm run db:push
```

### 7. Lancer l'application

```bash
npm run dev
```

L'application est accessible sur **http://localhost:3000**

## 🧪 Tester l'application

Une fois lancée, testez les différents agents :

### Test 1 : Analyse commerciale
```
Prompt : "Analyse mon pipeline actuel et dis-moi sur quoi me concentrer"
Agent : SALES_ANALYSIS
```

### Test 2 : Rédaction d'email
```
Prompt : "Rédige un email de prospection pour un prospect dans le secteur tech"
Agent : EMAIL_WRITING
```

### Test 3 : Conseil commercial
```
Prompt : "Comment puis-je améliorer mon taux de conversion ?"
Agent : COACHING
```

### Test 4 : Conversation générale
```
Prompt : "Bonjour, qu'est-ce que tu peux faire pour moi ?"
Agent : GENERAL
```

## 📁 Structure du projet

```
AgentIA_Commercial/
├── prisma/
│   ├── schema.prisma          # Schéma CRM complet
│   └── migrations/
├── src/
│   ├── app/
│   │   ├── api/chat/
│   │   │   └── route.ts       # API route principale
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── chat/
│   │   │   └── chat-interface.tsx
│   │   └── ui/                # Composants Shadcn UI
│   ├── lib/
│   │   ├── ollama/
│   │   │   ├── client.ts      # Client Ollama
│   │   │   ├── agents/        # Agents spécialisés
│   │   │   └── prompts/       # System prompts
│   │   ├── db/
│   │   │   └── prisma.ts
│   │   └── utils.ts
│   └── types/
│       └── index.ts           # Types TypeScript
├── docker-compose.yml         # PostgreSQL + ChromaDB + Redis
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Configuration avancée

### Changer les modèles Ollama

Éditez `.env.local` :

```bash
# Utiliser Llama 3.1 70B pour l'analyse (nécessite beaucoup de RAM)
OLLAMA_ANALYST_MODEL="llama3.1:70b"

# Utiliser Qwen2.5 pour la rédaction
OLLAMA_WRITER_MODEL="qwen2.5:7b"
```

Puis redémarrez le serveur Next.js.

### Ajuster la température des LLM

Dans `src/lib/ollama/agents/*.ts`, modifiez le paramètre `temperature` :

```typescript
private llm = createOllamaClient(model, {
  temperature: 0.9, // Plus créatif
})
```

### Utiliser Ollama distant

Si Ollama tourne sur un serveur distant :

```bash
# Dans .env.local
OLLAMA_BASE_URL="http://192.168.1.100:11434"
```

Assurez-vous qu'Ollama accepte les connexions externes :

```bash
OLLAMA_HOST=0.0.0.0 ollama serve
```

## 🐳 Commandes Docker utiles

```bash
# Démarrer les services
docker-compose up -d

# Arrêter les services
docker-compose down

# Voir les logs
docker-compose logs -f

# Supprimer les données (⚠️ supprime la DB)
docker-compose down -v
```

## 🗄️ Commandes Prisma

```bash
# Générer le client Prisma
npm run db:generate

# Créer/appliquer les migrations
npm run db:migrate

# Push le schéma sans migration
npm run db:push

# Ouvrir Prisma Studio (interface graphique)
npm run db:studio
```

## 🛠️ Développement

### Scripts npm disponibles

```bash
npm run dev          # Lancer en mode développement
npm run build        # Build pour production
npm run start        # Lancer en production
npm run lint         # Linter ESLint
npm run setup        # Setup complet (Docker + DB)
```

### Ajouter un nouvel agent

1. Créer le fichier dans `src/lib/ollama/agents/mon-agent.ts`
2. Ajouter le prompt dans `src/lib/ollama/prompts/system-prompts.ts`
3. Mettre à jour le router dans `src/lib/ollama/agents/router.ts`
4. Ajouter le cas dans `src/app/api/chat/route.ts`

## 📊 Données mockées (Phase 1)

Pour tester l'agent Sales Analyst, des données mockées sont utilisées dans `src/app/api/chat/route.ts`.

**Phase 2** intégrera les vraies données depuis la base PostgreSQL.

## 🔒 Sécurité et RGPD

- ✅ **100% local** : Aucune donnée n'est envoyée à des services tiers
- ✅ **Données chiffrées** : PostgreSQL peut être configuré avec chiffrement
- ✅ **Pas de télémétrie** : ChromaDB configuré sans télémétrie
- ✅ **RGPD-friendly** : Toutes les données restent sous votre contrôle

## 🚧 Roadmap

### Phase 1 (✅ Actuelle - MVP)
- ✅ Architecture de base
- ✅ Chat intelligent avec Ollama
- ✅ Agents spécialisés (Router, Analyst, Writer, General)
- ✅ Schéma CRM complet
- ✅ Interface utilisateur moderne

### Phase 2 (🚀 Prochaine)
- 📋 Intégration CRM complète (CRUD contacts/deals)
- 🧠 RAG avec ChromaDB (mémoire long-terme)
- 📊 Dashboard analytics
- 📧 Interface de gestion d'emails
- ✅ Agent CRM Assistant
- ✅ Agent Coach

### Phase 3
- 🤖 Automatisations (scoring leads, alertes)
- 📈 Prévisions IA
- 📱 Version mobile
- 🔗 Intégrations (Gmail, calendrier, etc.)

## 🐛 Troubleshooting

### Ollama ne répond pas

```bash
# Vérifier qu'Ollama tourne
curl http://localhost:11434/api/tags

# Redémarrer Ollama
killall ollama
ollama serve
```

### Erreur de connexion PostgreSQL

```bash
# Vérifier que Docker tourne
docker-compose ps

# Voir les logs PostgreSQL
docker-compose logs postgres

# Redémarrer PostgreSQL
docker-compose restart postgres
```

### Les modèles Ollama sont lents

- Utilisez des modèles plus petits (`mistral:7b` au lieu de `mixtral:8x7b`)
- Activez le GPU si disponible
- Augmentez la RAM allouée à Docker

### Erreur "Module not found"

```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install

# Régénérer Prisma
npm run db:generate
```

## 📝 Licence

Ce projet est sous licence MIT. Libre à vous de l'utiliser, le modifier et le distribuer.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir des issues ou des pull requests.

## 📧 Support

Pour toute question ou problème, ouvrez une issue sur GitHub.

---

**Fait avec ❤️ pour les entrepreneurs français qui veulent garder le contrôle de leurs données**
