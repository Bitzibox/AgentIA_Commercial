# 🤖 Agent Commercial IA - Copilote Intelligent pour TPE/PME

Un assistant commercial intelligent propulsé par Google Gemini, conçu pour être le bras droit commercial des dirigeants de TPE/PME.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Gemini](https://img.shields.io/badge/Gemini-1.5%20Flash-orange)

## 🌐 Démo en Ligne

**🎉 Application disponible sur GitHub Pages** : [https://bitzibox.github.io/AgentIA_Commercial/](https://bitzibox.github.io/AgentIA_Commercial/)

Aucune installation requise ! Utilisez directement l'application dans votre navigateur avec votre propre clé API Gemini.

## ✨ Fonctionnalités

### 🎯 Tableau de Bord Commercial
- **Métriques en temps réel** : Chiffre d'affaires, leads, taux de conversion, pipeline
- **Visualisation des tendances** : Évolution des performances avec indicateurs de croissance
- **KPIs personnalisés** : Deal moyen, cycle de vente, et plus

### 💬 Copilote IA Intelligent
- **Analyse contextuelle** : L'IA comprend votre contexte business
- **Conseils stratégiques** : Recommandations actionnables pour améliorer vos ventes
- **Préparation de RDV** : Briefings et argumentaires pour vos rendez-vous clients
- **Analyse du pipeline** : Insights sur vos opportunités en cours

### 📊 Gestion des Opportunités
- **Pipeline visuel** : Vue claire de toutes vos opportunités
- **Priorisation intelligente** : Focus sur les deals à fort potentiel
- **Suivi des étapes** : De la prospection au closing
- **Probabilités de succès** : Estimation du taux de réussite

### ✅ Gestion des Actions
- **To-do intelligent** : Actions recommandées par l'IA
- **Priorisation** : Urgence et importance des tâches
- **Liens contextuels** : Actions liées à vos deals et leads
- **Suivi de complétion** : Visualisation de votre progression

## 🚀 Utilisation (100% Gratuit !)

### Option 1 : Utiliser la version en ligne (Recommandé)

1. **Visitez l'application** : [https://bitzibox.github.io/AgentIA_Commercial/](https://bitzibox.github.io/AgentIA_Commercial/)

2. **Obtenez une clé API Gemini gratuite** :
   - Allez sur [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Créez ou sélectionnez un projet
   - Générez une clé API (100% gratuit)

3. **Configurez votre clé** :
   - Cliquez sur le bouton "Configuration Gemini" en haut à droite
   - Collez votre clé API
   - Votre clé est stockée localement dans votre navigateur (jamais envoyée à nos serveurs)

4. **C'est prêt !** Commencez à discuter avec votre copilote commercial IA

### Option 2 : Installation locale

#### Prérequis
- Node.js 18+ installé
- Une clé API Google Gemini ([Obtenir une clé](https://makersuite.google.com/app/apikey))

#### Installation

1. **Cloner le repository**

```bash
git clone https://github.com/Bitzibox/AgentIA_Commercial.git
cd AgentIA_Commercial
```

2. **Installer les dépendances**

```bash
npm install
```

3. **Lancer en mode développement**

```bash
npm run dev
```

4. **Ouvrir dans le navigateur**

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

5. **Configurer votre clé API**

Lors du premier lancement, un dialogue vous demandera votre clé API Gemini.

## 📖 Guide d'Utilisation

### Utiliser le Copilote IA

Le copilote peut vous aider sur de nombreux sujets :

**Exemples de questions :**
- "Quelles sont mes opportunités prioritaires ?"
- "Comment améliorer mon taux de conversion ?"
- "Analyse mon pipeline et donne-moi des recommandations"
- "Prépare-moi pour mon rendez-vous avec [Nom Client]"
- "Quels sont les risques sur mes deals en cours ?"
- "Donne-moi 3 actions prioritaires pour cette semaine"

### Navigation

L'application est organisée en 4 onglets :

1. **📊 Tableau de bord** : Vue d'ensemble de vos performances
2. **💬 Copilote IA** : Interface de chat avec l'assistant
3. **🎯 Opportunités** : Liste détaillée de vos deals
4. **✅ Actions** : To-do list intelligente

### Données de Démonstration

L'application inclut des données réalistes pour tester les fonctionnalités :
- 4 opportunités (250K€ à 75K€)
- 3 leads qualifiés
- 5 activités récentes
- 5 actions prioritaires
- Métriques complètes

## 🔧 Déploiement sur GitHub Pages

### Automatique (via GitHub Actions)

Le déploiement se fait automatiquement à chaque push sur la branche `main` ou `master`.

1. **Activez GitHub Pages** :
   - Allez dans Settings > Pages de votre repository
   - Source : GitHub Actions

2. **Push vers main** :
```bash
git push origin main
```

3. **Attendez le déploiement** :
   - Le workflow se lance automatiquement
   - L'application sera disponible sur `https://[username].github.io/AgentIA_Commercial/`

### Manuel

```bash
# Build l'application
npm run build

# Le dossier 'out' contient les fichiers statiques
# Vous pouvez les déployer sur n'importe quel hébergeur statique
```

## 🏗️ Architecture Technique

### Stack Technologique

- **Framework** : Next.js 15 (Export statique)
- **Language** : TypeScript 5
- **UI** : Shadcn/ui + Tailwind CSS
- **IA** : Google Gemini 1.5 Flash (côté client)
- **Déploiement** : GitHub Pages
- **Styling** : Tailwind CSS avec design system personnalisé

### Pourquoi côté client ?

L'application fonctionne 100% côté client (dans le navigateur) :
- ✅ Hébergement **gratuit** sur GitHub Pages
- ✅ **Pas de serveur** requis
- ✅ Vos données restent **privées** (jamais envoyées à nos serveurs)
- ✅ **Rapide** et réactif
- ✅ Fonctionne **hors ligne** (après le premier chargement)

### Structure du Projet

```
AgentIA_Commercial/
├── .github/
│   └── workflows/
│       └── deploy.yml           # Workflow de déploiement
├── app/                         # Pages Next.js (App Router)
│   ├── globals.css              # Styles globaux
│   ├── layout.tsx               # Layout principal
│   └── page.tsx                 # Page d'accueil
├── components/                  # Composants React
│   ├── ui/                      # Composants UI de base (shadcn)
│   ├── action-items.tsx         # Gestion des actions
│   ├── api-key-dialog.tsx       # Configuration clé API
│   ├── chat-interface.tsx       # Interface de chat
│   ├── deals-list.tsx           # Liste des opportunités
│   └── metrics-dashboard.tsx    # Tableau de bord métriques
├── lib/                         # Utilitaires et services
│   ├── gemini-client.ts         # Service Gemini (client-side)
│   ├── utils.ts                 # Fonctions utilitaires
│   └── demo-data.ts             # Données de démonstration
├── types/                       # Définitions TypeScript
│   └── index.ts                 # Types de l'application
├── public/                      # Fichiers statiques
│   └── .nojekyll                # Pour GitHub Pages
├── package.json                 # Dépendances
└── README.md                    # Cette documentation
```

## 🔒 Sécurité & Confidentialité

- Votre clé API Gemini est stockée **localement** dans votre navigateur (localStorage)
- Aucune donnée n'est envoyée à nos serveurs
- Communication directe entre votre navigateur et l'API Gemini de Google
- Code source **100% open source** et auditable

## 🎨 Personnalisation

### Thèmes de Couleurs

Les couleurs sont définies dans `app/globals.css` via des variables CSS.

### Données de Démonstration

Modifiez `lib/demo-data.ts` pour adapter les données à votre business.

## 📊 Fonctionnalités à Venir

- [ ] Intégration avec CRMs populaires (HubSpot, Salesforce, Pipedrive)
- [ ] Export de rapports PDF
- [ ] Notifications et alertes intelligentes
- [ ] Mode multi-utilisateurs
- [ ] Tableaux de bord personnalisables
- [ ] Intégration email et calendrier
- [ ] Analyse prédictive avancée
- [ ] Mode vocal pour les interactions
- [ ] Support du mode hors ligne complet

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 💡 Support

Pour toute question ou problème :

1. Consultez la [documentation](https://github.com/Bitzibox/AgentIA_Commercial/wiki)
2. Ouvrez une [issue](https://github.com/Bitzibox/AgentIA_Commercial/issues)

## 🙏 Remerciements

- Google pour l'API Gemini gratuite
- Vercel pour Next.js
- shadcn pour les composants UI
- La communauté open source

## 💰 Coûts

**100% GRATUIT !**
- Hébergement : Gratuit (GitHub Pages)
- API Gemini : Gratuite (quota généreux de Google)
- Aucun frais caché

---

**Fait avec ❤️ pour les entrepreneurs et dirigeants de TPE/PME**

*Votre copilote commercial intelligent, accessible partout, tout le temps.*
