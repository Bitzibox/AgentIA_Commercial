#!/bin/bash

# Script de configuration complète pour le développement

set -e

echo "🚀 Configuration de l'environnement de développement AgentIA Commercial"
echo ""

# 1. Vérifier Node.js
echo "1️⃣  Vérification de Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé !"
    echo "Installez Node.js 20+ depuis https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js version $NODE_VERSION détectée, version 20+ requise"
    exit 1
fi

echo "✅ Node.js $(node -v) détecté"
echo ""

# 2. Vérifier Docker
echo "2️⃣  Vérification de Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé !"
    echo "Installez Docker depuis https://docs.docker.com/get-docker/"
    exit 1
fi

if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker n'est pas démarré !"
    echo "Lancez Docker et réessayez"
    exit 1
fi

echo "✅ Docker $(docker --version) détecté"
echo ""

# 3. Installer les dépendances npm
echo "3️⃣  Installation des dépendances npm..."
npm install
echo "✅ Dépendances installées"
echo ""

# 4. Démarrer Docker Compose
echo "4️⃣  Démarrage des services Docker (PostgreSQL, ChromaDB, Redis)..."
docker-compose up -d
echo "⏳ Attente du démarrage des services..."
sleep 5
echo "✅ Services Docker démarrés"
echo ""

# 5. Initialiser Prisma
echo "5️⃣  Initialisation de Prisma..."
npm run db:generate
npm run db:push
echo "✅ Base de données initialisée"
echo ""

# 6. Vérifier Ollama
echo "6️⃣  Vérification d'Ollama..."
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "⚠️  Ollama ne semble pas démarré"
    echo "Lancez 'ollama serve' dans un autre terminal"
    echo "Puis exécutez : ./scripts/init-ollama.sh"
else
    echo "✅ Ollama opérationnel"
    echo ""
    echo "📦 Modèles Ollama disponibles :"
    ollama list
fi

echo ""
echo "🎉 Configuration terminée !"
echo ""
echo "Pour démarrer l'application :"
echo "  npm run dev"
echo ""
echo "L'application sera accessible sur http://localhost:3000"
echo ""
echo "Commandes utiles :"
echo "  npm run db:studio    # Ouvrir Prisma Studio"
echo "  docker-compose logs  # Voir les logs Docker"
echo "  ollama list          # Lister les modèles Ollama"
