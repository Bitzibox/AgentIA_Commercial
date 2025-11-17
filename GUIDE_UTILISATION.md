# 📚 Guide d'Utilisation - Agent Commercial IA

## 🎯 Comprendre l'Application

### L'Application a DEUX Parties Distinctes :

#### 1. 📊 Les Données (Deals, Leads, Actions)
- **Stockage** : Localement dans votre navigateur (localStorage)
- **Modifiables** : Oui ! Vous pouvez ajouter/supprimer/modifier
- **Persistantes** : Vos modifications sont sauvegardées
- **Utilisées pour** : Visualisation ET contexte pour l'IA

#### 2. 🤖 Le Chat IA (Copilote Commercial)
- **Moteur** : Google Gemini (IA réelle, pas simulée)
- **Nécessite** : Votre clé API Gemini (gratuite)
- **Fonctionne** : 100% en temps réel
- **Comprend** : TOUTES vos données (deals, leads, métriques)

## 🚀 Démarrage Rapide

### Étape 1 : Obtenir une Clé API Gemini (GRATUIT)

1. Allez sur https://makersuite.google.com/app/apikey
2. Connectez-vous avec votre compte Google
3. Cliquez sur "Create API Key"
4. Copiez la clé (commence par "AIza...")

**Quota Gratuit** :
- 60 requêtes par minute
- 1500 requêtes par jour
- Largement suffisant pour un usage personnel/PME

### Étape 2 : Configurer la Clé dans l'Application

1. Au lancement, un dialogue apparaît
2. Collez votre clé API
3. Cliquez sur "Enregistrer"
4. ✅ La clé est stockée localement (jamais envoyée aux serveurs)

**Sécurité** :
- Stockage local uniquement
- Communication directe navigateur → Google
- Aucun serveur intermédiaire

### Étape 3 : Utiliser l'Application

## 💼 Fonctionnalités Interactives

### 📈 Tableau de Bord

**Ce que vous voyez** :
- 6 cartes de métriques
- Liste des opportunités
- Actions à mener

**Ce qui se met à jour automatiquement** :
- Pipeline total (somme des deals)
- Nombre de leads
- Deal moyen
- Statistiques calculées en temps réel

### 🎯 Gestion des Opportunités

#### Ajouter un Deal :

1. Cliquez sur **"Nouvelle Opportunité"** (bouton violet)
2. Remplissez le formulaire :
   - **Entreprise*** : Nom du client
   - **Contact*** : Nom du décideur
   - **Valeur (€)*** : Montant du deal
   - **Probabilité** : Chance de conclure (0-100%)
   - **Étape** : Prospection → Closing
   - **Prochaine étape** : Action à faire
   - **Tags** : Catégories personnalisées
3. Cliquez sur **"Créer l'opportunité"**

**Résultat** :
- ✅ Deal ajouté immédiatement
- ✅ Sauvegardé dans le navigateur
- ✅ Métriques mises à jour
- ✅ L'IA connaît ce nouveau deal

#### Supprimer un Deal :

1. Cliquez sur l'icône 🗑️ sur un deal
2. Confirmez la suppression
3. ✅ Deal supprimé et métriques recalculées

### 💬 Chat avec le Copilote IA

**Comment ça marche** :

1. Allez dans l'onglet "Copilote IA"
2. Tapez votre question
3. L'IA analyse vos données réelles
4. Vous obtenez une réponse personnalisée

**Exemples de Questions** :

**Analyse de Pipeline** :
```
"Analyse mon pipeline et dis-moi où concentrer mes efforts"
```
→ L'IA regarde VOS deals et suggère des actions

**Préparation RDV** :
```
"Prépare-moi pour mon rendez-vous avec TechCorp Solutions"
```
→ L'IA utilise les infos du deal TechCorp de vos données

**Stratégie** :
```
"J'ai un taux de conversion de 24.5%, comment l'améliorer ?"
```
→ L'IA voit vos métriques réelles et conseille

**Priorisation** :
```
"Quelles sont mes 3 actions prioritaires cette semaine ?"
```
→ L'IA analyse vos deals et leurs étapes

**Prévisions** :
```
"Combien de CA puis-je espérer ce mois en tenant compte des probabilités ?"
```
→ L'IA calcule selon vos deals et leurs %

## 🔧 Fonctionnalités Avancées

### 💾 Export/Import des Données

#### Exporter :
1. Cliquez sur **"Exporter"** (en haut à droite)
2. Un fichier JSON est téléchargé
3. **Utilisations** :
   - Sauvegarde externe
   - Transfert vers un autre ordinateur
   - Partage avec un collaborateur
   - Archive des données

#### Importer :
1. Cliquez sur **"Importer"**
2. Sélectionnez un fichier JSON exporté
3. Vos données sont restaurées
4. **Attention** : Remplace toutes les données actuelles

### 🔄 Réinitialiser

1. Cliquez sur **"Réinitialiser"**
2. Confirmez
3. Retour aux données de démonstration
4. **Utilisations** :
   - Repartir de zéro
   - Tester l'application
   - Retrouver les exemples

## 🎨 Améliorations Visuelles

### Animations

- **Entrée de page** : Fade-in fluide
- **Cartes de deals** : Apparition progressive
- **Hover effects** : Zoom léger et ombres
- **Transitions** : 300ms smooth

### Design

- **Gradients** : Bleu → Violet → Rose
- **Mode sombre** : Support complet
- **Responsive** : Mobile, tablette, desktop
- **Icons** : Lucide React (modernes)

## 🤝 Scénario d'Utilisation Complet

### Cas Pratique : Gérant de PME

**Lundi matin - 9h00** :
```
1. Ouvre l'application
2. Va dans "Opportunités"
3. Ajoute un nouveau deal : "Startup AI", 75K€, Qualification
4. Les métriques se mettent à jour automatiquement
```

**10h00 - Préparation RDV** :
```
1. Va dans "Copilote IA"
2. Demande : "Prépare-moi pour mon RDV avec Startup AI"
3. L'IA génère :
   - Points clés à aborder
   - Questions à poser
   - Argumentaire selon le deal
```

**11h30 - Après le RDV** :
```
1. Met à jour le deal : passe en "Proposition"
2. Ajoute "Envoyer proposition technique" dans prochaine étape
3. Demande à l'IA : "Aide-moi à structurer ma proposition"
```

**Mardi - Stratégie hebdomadaire** :
```
1. Demande à l'IA : "Analyse mes deals et recommande mes 3 priorités"
2. L'IA analyse pipeline, probabilités, montants
3. Suggère : se concentrer sur TechCorp (250K), relancer FutureTech, qualifier Startup AI
```

**Vendredi - Reporting** :
```
1. Clique sur "Exporter"
2. Sauvegarde les données de la semaine
3. Demande à l'IA : "Résume ma semaine commerciale"
4. Obtient un rapport automatique
```

## ❓ FAQ

### L'IA fonctionne vraiment ?
**Oui !** Si vous configurez une clé API Gemini valide, le chat est 100% fonctionnel avec IA réelle de Google.

### Mes données sont-elles sécurisées ?
**Oui !** Stockage local uniquement. Aucun serveur backend. Communication directe avec Google Gemini.

### Je peux utiliser mes vraies données ?
**Absolument !** L'application est conçue pour ça. Ajoutez vos vrais clients, deals, montants.

### Combien ça coûte ?
**0€** - Hébergement GitHub Pages gratuit + API Gemini gratuite (quota généreux).

### Puis-je utiliser hors ligne ?
**Partiellement** - Les données oui (localStorage), le chat IA non (nécessite internet).

### Les données sont partagées entre appareils ?
**Non** - Stockage local par navigateur. Utilisez Export/Import pour transférer.

### Puis-je personnaliser l'application ?
**Oui !** Code open source, modifiable, forkable.

## 🎓 Conseils Pro

### Maximiser l'Efficacité du Chat IA

1. **Soyez précis** : "Analyse TechCorp" vs "Que penses-tu ?"
2. **Contextualisez** : "Sachant que j'ai RDV demain..."
3. **Itérez** : Posez des questions de suivi
4. **Demandez des actions** : "Quelles sont les 3 prochaines étapes ?"

### Organiser vos Deals

1. **Tags cohérents** : "SaaS", "Consulting", "Enterprise"
2. **Prochaines étapes claires** : Actions concrètes
3. **Probabilités réalistes** : Aide l'IA à prioriser
4. **Mise à jour régulière** : Après chaque interaction

### Exploiter l'Export/Import

1. **Sauvegarde hebdomadaire** : Exporter tous les vendredis
2. **Versioning** : Nommer les exports avec dates
3. **Collaboration** : Partager exports avec équipe
4. **Migration** : Transférer entre environnements

## 🚀 Prochaines Étapes Suggérées

1. ✅ Configurer la clé API Gemini
2. ✅ Ajouter vos 3 premiers vrais deals
3. ✅ Tester le chat IA avec questions réelles
4. ✅ Explorer toutes les fonctionnalités
5. ✅ Exporter une première sauvegarde

---

**Besoin d'aide ?** Ouvrez une [issue GitHub](https://github.com/Bitzibox/AgentIA_Commercial/issues)

**Fait avec ❤️ pour les entrepreneurs**
