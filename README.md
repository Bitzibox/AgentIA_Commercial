# 🤖 Agent Commercial IA - Copilote Intelligent pour TPE/PME

Un assistant commercial intelligent propulsé par Google Gemini, conçu pour être le bras droit commercial des dirigeants de TPE/PME.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Gemini](https://img.shields.io/badge/Gemini-1.5%20Pro-orange)

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

## 🚀 Installation et Démarrage

### Prérequis

- Node.js 18+ installé
- Une clé API Google Gemini ([Obtenir une clé](https://ai.google.dev/))

### Installation

1. **Cloner le repository**

```bash
git clone https://github.com/votre-username/AgentIA_Commercial.git
cd AgentIA_Commercial
```

2. **Installer les dépendances**

```bash
npm install
```

3. **Configurer les variables d'environnement**

Créez un fichier `.env` à la racine du projet :

```env
GEMINI_API_KEY=votre_cle_api_gemini_ici
```

Pour obtenir une clé API Gemini :
- Rendez-vous sur [Google AI Studio](https://makersuite.google.com/app/apikey)
- Créez un nouveau projet ou sélectionnez-en un existant
- Générez une clé API
- Copiez la clé dans votre fichier `.env`

4. **Lancer l'application**

```bash
npm run dev
```

5. **Ouvrir dans le navigateur**

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📖 Guide d'Utilisation

### Premier Démarrage

Au premier lancement, vous verrez une interface avec des **données de démonstration**. C'est parfait pour découvrir les fonctionnalités !

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

## 🏗️ Architecture Technique

### Stack Technologique

- **Framework** : Next.js 15 (App Router)
- **Language** : TypeScript 5
- **UI** : Shadcn/ui + Tailwind CSS
- **IA** : Google Gemini 1.5 Pro
- **Styling** : Tailwind CSS avec design system personnalisé

### Structure du Projet

```
AgentIA_Commercial/
├── app/                      # Pages Next.js (App Router)
│   ├── api/chat/            # API route pour Gemini
│   ├── globals.css          # Styles globaux
│   ├── layout.tsx           # Layout principal
│   └── page.tsx             # Page d'accueil
├── components/              # Composants React
│   ├── ui/                  # Composants UI de base (shadcn)
│   ├── action-items.tsx     # Gestion des actions
│   ├── chat-interface.tsx   # Interface de chat
│   ├── deals-list.tsx       # Liste des opportunités
│   └── metrics-dashboard.tsx # Tableau de bord métriques
├── lib/                     # Utilitaires et services
│   ├── gemini.ts            # Service Gemini AI
│   ├── utils.ts             # Fonctions utilitaires
│   └── demo-data.ts         # Données de démonstration
├── types/                   # Définitions TypeScript
│   └── index.ts             # Types de l'application
├── .env.example             # Template variables d'environnement
├── package.json             # Dépendances
└── README.md               # Cette documentation
```

## 🔧 Configuration Avancée

### Personnaliser le Système Prompt

Le comportement de l'IA peut être personnalisé dans `lib/gemini.ts` :

```typescript
const SYSTEM_PROMPT = `Tu es un assistant commercial IA expert...`
```

### Modifier les Données de Démonstration

Les données de démonstration sont dans `lib/demo-data.ts`. Vous pouvez les modifier pour refléter votre business.

### Intégration avec Votre CRM

Pour connecter vos vraies données :

1. Remplacez les imports de `demo-data.ts` dans `app/page.tsx`
2. Créez un service pour récupérer vos données réelles
3. Passez ces données au composant `ChatInterface`

## 🎨 Personnalisation Visuelle

### Thèmes de Couleurs

Les couleurs sont définies dans `app/globals.css` via des variables CSS. Modifiez les valeurs HSL pour personnaliser :

```css
:root {
  --primary: 240 5.9% 10%;
  --secondary: 240 4.8% 95.9%;
  /* ... */
}
```

### Composants UI

Tous les composants UI sont dans `components/ui/` et peuvent être personnalisés individuellement.

## 🚀 Déploiement

### Déploiement sur Vercel (Recommandé)

1. Pushez votre code sur GitHub
2. Importez le projet sur [Vercel](https://vercel.com)
3. Ajoutez votre `GEMINI_API_KEY` dans les variables d'environnement
4. Déployez !

### Déploiement sur d'autres plateformes

L'application peut être déployée sur n'importe quelle plateforme supportant Next.js :
- Netlify
- Railway
- Render
- AWS Amplify
- etc.

## 📊 Fonctionnalités à Venir

- [ ] Intégration avec CRMs populaires (HubSpot, Salesforce, Pipedrive)
- [ ] Export de rapports PDF
- [ ] Notifications et alertes intelligentes
- [ ] Mode multi-utilisateurs
- [ ] Tableaux de bord personnalisables
- [ ] Intégration email et calendrier
- [ ] Analyse prédictive avancée
- [ ] Mode vocal pour les interactions

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

1. Consultez la [documentation](https://github.com/votre-username/AgentIA_Commercial/wiki)
2. Ouvrez une [issue](https://github.com/votre-username/AgentIA_Commercial/issues)
3. Contactez-nous via [email]

## 🙏 Remerciements

- Google pour l'API Gemini
- Vercel pour Next.js
- shadcn pour les composants UI
- La communauté open source

---

**Fait avec ❤️ pour les entrepreneurs et dirigeants de TPE/PME**
