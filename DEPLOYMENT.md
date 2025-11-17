# 🚀 Guide de Déploiement GitHub Pages

## 📋 Étapes pour Déployer

### 1. Merger la branche vers main

```bash
# Créer une Pull Request ou merger directement
git checkout main
git merge claude/rebuild-sales-agent-01RqPAZCADJaFhuMSeF3EKYR
git push origin main
```

### 2. Activer GitHub Pages

1. Allez sur votre repository GitHub : `https://github.com/Bitzibox/AgentIA_Commercial`

2. Cliquez sur **Settings** (⚙️)

3. Dans le menu de gauche, cliquez sur **Pages**

4. Sous "Source", sélectionnez :
   - Source : **GitHub Actions**

5. Sauvegardez

### 3. Le déploiement se lance automatiquement

- Le workflow GitHub Actions se déclenchera automatiquement après le push vers `main`
- Allez dans l'onglet **Actions** pour voir le déploiement en cours
- Le build prend environ 2-3 minutes

### 4. Vérifier le déploiement

Une fois terminé, votre application sera disponible à :

**https://bitzibox.github.io/AgentIA_Commercial/**

## 🔧 Configuration du basePath (si nécessaire)

Si vous déployez dans un sous-répertoire, décommentez cette ligne dans `next.config.js` :

```javascript
basePath: '/AgentIA_Commercial',
```

## 📝 Notes importantes

- Le déploiement est automatique à chaque push sur `main` ou `master`
- Les fichiers statiques sont générés dans le dossier `out/`
- Le workflow utilise Node.js 18
- Aucune variable d'environnement serveur n'est requise (tout est côté client)

## 🐛 Dépannage

### Le site ne s'affiche pas
1. Vérifiez que GitHub Pages est activé (Settings > Pages)
2. Vérifiez que le workflow a réussi (onglet Actions)
3. Attendez quelques minutes pour la propagation DNS

### Erreur 404
1. Vérifiez le `basePath` dans `next.config.js`
2. Assurez-vous que les fichiers `.nojekyll` sont présents

### Le build échoue
1. Vérifiez les logs dans l'onglet Actions
2. Assurez-vous que toutes les dépendances sont à jour
3. Testez le build localement : `npm run build`

## ✅ Checklist de déploiement

- [ ] Code pushé sur la branche main
- [ ] GitHub Pages activé dans Settings
- [ ] Source définie sur "GitHub Actions"
- [ ] Workflow exécuté avec succès
- [ ] Site accessible sur bitzibox.github.io/AgentIA_Commercial

## 🎉 Après le déploiement

1. Testez l'application en ligne
2. Configurez votre clé API Gemini
3. Testez toutes les fonctionnalités
4. Partagez le lien !

---

**Besoin d'aide ?** Ouvrez une [issue](https://github.com/Bitzibox/AgentIA_Commercial/issues)
