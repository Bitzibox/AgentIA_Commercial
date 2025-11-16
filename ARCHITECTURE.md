# 🏗️ Architecture Technique - AgentIA Commercial

## Vue d'ensemble

AgentIA Commercial utilise une architecture moderne basée sur Next.js 14 avec une séparation claire entre :
- **Frontend** : Interface utilisateur React avec Shadcn UI
- **Backend** : API Routes Next.js avec orchestration d'agents
- **IA** : Agents spécialisés propulsés par Ollama (LLMs locaux)
- **Données** : PostgreSQL (CRM) + ChromaDB (RAG) + Redis (cache)

## Stack Technologique Détaillé

### Frontend
```
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Shadcn UI (Radix UI + Tailwind)
- Lucide React (icônes)
```

### Backend
```
- Next.js API Routes
- Prisma ORM
- LangChain.js
- Ollama SDK
```

### IA & LLM
```
- Ollama (serveur local)
- Modèles :
  - Mistral 7B Instruct (router, general)
  - Mixtral 8x7B (analyst)
  - Llama 3.1 8B (coach)
  - Nomic Embed Text (embeddings RAG)
```

### Infrastructure
```
- PostgreSQL 16 (base de données CRM)
- ChromaDB (vector database pour RAG)
- Redis 7 (cache et sessions)
- Docker Compose (orchestration)
```

---

## Architecture Multi-Agents

### Flux de Traitement d'une Requête

```
┌─────────────────────────────────────────────────┐
│  1. Utilisateur envoie un message              │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│  2. API Route /api/chat                         │
│     - Validation de la requête                  │
│     - Extraction du message utilisateur         │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│  3. Router Agent (Mistral 7B)                   │
│     Analyse l'intention et classifie :          │
│     - SALES_ANALYSIS                            │
│     - EMAIL_WRITING                             │
│     - CRM_UPDATE                                │
│     - COACHING                                  │
│     - GENERAL                                   │
└─────────────────┬───────────────────────────────┘
                  │
         ┌────────┴────────┐
         │                 │
┌────────▼─────┐  ┌────────▼─────────┐  ┌────────▼──────┐
│ Sales        │  │ Email            │  │ General       │
│ Analyst      │  │ Writer           │  │ Agent         │
│ (Mixtral 8x7B)│  │ (Mistral 7B)     │  │ (Mistral 7B)  │
└────────┬─────┘  └────────┬─────────┘  └────────┬──────┘
         │                 │                      │
         └────────┬────────┴──────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│  4. Réponse générée                             │
│     - Contenu de la réponse                     │
│     - Métadonnées (agent, temps de traitement)  │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│  5. Sauvegarde (optionnelle)                    │
│     - Message user → DB                         │
│     - Réponse assistant → DB                    │
│     - Indexation RAG (Phase 2)                  │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│  6. Retour au client                            │
│     - JSON avec réponse et métadonnées          │
└─────────────────────────────────────────────────┘
```

---

## Agents Spécialisés

### 1. Router Agent
**Rôle** : Classifier l'intention de l'utilisateur

**Modèle** : `mistral:7b-instruct`

**Température** : `0.1` (très déterministe)

**Prompt** : Classification stricte en 5 catégories

**Fichier** : `src/lib/ollama/agents/router.ts`

---

### 2. Sales Analyst Agent
**Rôle** : Analyser les données commerciales et fournir des insights

**Modèle** : `mixtral:8x7b` (meilleur raisonnement analytique)

**Température** : `0.3` (équilibré entre créativité et précision)

**Capacités** :
- Analyse du pipeline de ventes
- Calcul de métriques (taux conversion, valeur moyenne, etc.)
- Identification des opportunités à prioriser
- Recommandations actionnables

**Données utilisées** :
- Pipeline deals (totalValue, conversionRate, etc.)
- Top deals (titre, valeur, étape, probabilité)
- Répartition par étape du pipeline
- Contexte entreprise (nom, secteur, objectifs)

**Fichier** : `src/lib/ollama/agents/sales-analyst.ts`

---

### 3. Email Writer Agent
**Rôle** : Rédiger des emails commerciaux professionnels en français

**Modèle** : `mistral:7b-instruct`

**Température** : `0.8` (plus créatif pour la rédaction)

**Types d'emails** :
- Prospection (premier contact)
- Relance (après non-réponse)
- Follow-up (après RDV/appel)
- Proposal (envoi de proposition)
- Closing (finalisation)
- Custom (personnalisé)

**Contexte utilisé** :
- Informations du contact (nom, poste, entreprise)
- Interactions précédentes
- Objectif de l'email

**Format de sortie** :
```typescript
{
  subject: string      // Objet de l'email
  body: string         // Corps de l'email
  tone: string         // formel/informel
}
```

**Fichier** : `src/lib/ollama/agents/email-writer.ts`

---

### 4. General Agent
**Rôle** : Conversation générale et questions diverses

**Modèle** : `mistral:7b-instruct`

**Température** : `0.7` (équilibré)

**Capacités** :
- Répondre aux questions générales
- Expliquer le fonctionnement de l'outil
- Conversations contextuelles avec historique
- Aide et support

**Fichier** : `src/lib/ollama/agents/general.ts`

---

## Schéma de Base de Données (Prisma)

### Tables Principales

#### User & Company
```prisma
User {
  id, email, name, role
  companyId → Company
  conversations[], activities[], tasks[]
}

Company {
  id, name, industry, size, settings
  users[], contacts[], deals[], activities[]
}
```

#### CRM Core
```prisma
Contact {
  id, firstName, lastName, email, phone
  status: lead | prospect | customer | lost
  score: 0-100
  companyName, position, notes, tags[]
  deals[], activities[]
}

Deal {
  id, title, description, value
  stage: discovery | qualification | proposal | negotiation | closed_won | closed_lost
  probability: 0-100
  expectedCloseDate, closedAt
  contactId → Contact
  activities[]
}
```

#### Activity Tracking
```prisma
Activity {
  id, type (call | email | meeting | note | ...)
  subject, description, outcome
  occurredAt
  userId → User
  contactId → Contact (optional)
  dealId → Deal (optional)
  metadata: JSON
}

Task {
  id, title, description
  status: todo | in_progress | done | cancelled
  priority: low | medium | high | urgent
  dueDate, completedAt
  userId → User
}
```

#### Conversations IA
```prisma
Conversation {
  id, title
  userId → User
  messages[]
}

Message {
  id, role (user | assistant | system)
  content, agentType
  tokenCount, processingTime
  conversationId → Conversation
}
```

#### Metrics
```prisma
Metric {
  id, type, value, unit
  period: daily | weekly | monthly
  date
  companyId → Company
  metadata: JSON
}
```

**Fichier** : `prisma/schema.prisma`

---

## API Routes

### POST /api/chat

**Endpoint principal** pour les conversations avec l'IA

**Request Body** :
```typescript
{
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
  userId?: string
  conversationId?: string
  context?: {
    dealId?: string
    contactId?: string
  }
}
```

**Response** :
```typescript
{
  message: {
    role: 'assistant'
    content: string
  }
  metadata: {
    agentType: string
    processingTime: number
  }
}
```

**Flux** :
1. Validation de la requête
2. Routing via RouterAgent
3. Appel de l'agent spécialisé
4. Sauvegarde en DB (optionnel)
5. Retour de la réponse

**Fichier** : `src/app/api/chat/route.ts`

---

## Gestion de Configuration

### Variables d'Environnement

**Fichier** : `.env.local`

```bash
# Base de données
DATABASE_URL="postgresql://..."

# Ollama
OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_ROUTER_MODEL="mistral:7b-instruct"
OLLAMA_ANALYST_MODEL="mixtral:8x7b"
OLLAMA_WRITER_MODEL="mistral:7b-instruct"
OLLAMA_COACH_MODEL="llama3.1:8b"
OLLAMA_EMBEDDINGS_MODEL="nomic-embed-text"

# ChromaDB
CHROMADB_URL="http://localhost:8000"

# Redis
REDIS_URL="redis://localhost:6379"
```

---

## Sécurité

### Mesures Implémentées

1. **Isolation locale** : Aucune donnée n'est envoyée à des services externes
2. **Validation des entrées** : Validation stricte dans les API routes
3. **Prisma ORM** : Protection contre les injections SQL
4. **Environnement variables** : Credentials dans .env.local (gitignored)
5. **HTTPS ready** : Configuration pour TLS en production

### RGPD Compliance

- ✅ Données stockées localement uniquement
- ✅ Pas de télémétrie (ChromaDB configuré sans analytics)
- ✅ Droit à l'oubli : Suppression facile en cascade (Prisma)
- ✅ Portabilité : Export JSON/CSV possible
- ✅ Transparence : Code open-source

---

## Performance

### Optimisations

1. **Caching Redis** : Sessions et résultats fréquents
2. **Connection pooling** : Prisma avec pool de connexions
3. **Modèles adaptés** : 7B pour tâches simples, 8x7B pour analyses
4. **Streaming** : Possibilité de stream les réponses LLM (Phase 2)
5. **Indexation DB** : Index sur champs fréquemment requêtés

### Métriques Attendues (Phase 1)

- Temps de réponse Router : ~200-500ms
- Temps de réponse Analyst : ~2-5s (dépend du modèle)
- Temps de réponse Writer : ~3-7s
- Temps de réponse General : ~1-3s

---

## Évolution Future

### Phase 2 (Prochaine)
- RAG avec ChromaDB pour mémoire long-terme
- Streaming des réponses LLM
- Dashboard analytics complet
- CRUD CRM complet

### Phase 3
- Fine-tuning des modèles sur données métier
- Agents proactifs (alertes, recommandations)
- Intégrations externes (Gmail, Calendar)
- Version mobile

---

## Fichiers Clés à Connaître

| Fichier | Rôle |
|---------|------|
| `src/app/api/chat/route.ts` | API principale, orchestration |
| `src/lib/ollama/client.ts` | Client Ollama, configuration |
| `src/lib/ollama/agents/*` | Agents spécialisés |
| `src/lib/ollama/prompts/system-prompts.ts` | System prompts |
| `src/components/chat/chat-interface.tsx` | Interface utilisateur |
| `prisma/schema.prisma` | Schéma de base de données |
| `docker-compose.yml` | Infrastructure |

---

**Questions ou suggestions d'amélioration de l'architecture ? Ouvrez une issue !**
