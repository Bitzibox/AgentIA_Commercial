#!/bin/bash

# Script d'initialisation des modèles Ollama
# Télécharge les modèles nécessaires pour AgentIA Commercial

set -e

echo "🚀 Initialisation des modèles Ollama pour AgentIA Commercial"
echo ""

# Vérifier qu'Ollama est installé
if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama n'est pas installé !"
    echo "Installez Ollama depuis https://ollama.com/download"
    exit 1
fi

# Vérifier qu'Ollama tourne
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "❌ Ollama ne semble pas démarré !"
    echo "Lancez 'ollama serve' dans un autre terminal"
    exit 1
fi

echo "✅ Ollama détecté et opérationnel"
echo ""

# Modèles à télécharger
MODELS=(
    "mistral:7b-instruct"
    "nomic-embed-text"
)

# Modèles optionnels (commentés par défaut)
OPTIONAL_MODELS=(
    "mixtral:8x7b"
    "llama3.1:8b"
)

echo "📦 Téléchargement des modèles obligatoires..."
echo ""

for model in "${MODELS[@]}"; do
    echo "⬇️  Téléchargement de $model..."
    ollama pull "$model"
    echo ""
done

echo "✅ Modèles obligatoires installés !"
echo ""

# Proposer les modèles optionnels
echo "📦 Modèles optionnels disponibles :"
echo "  - mixtral:8x7b (meilleur pour l'analyse, nécessite ~26 GB RAM)"
echo "  - llama3.1:8b (bon compromis polyvalent)"
echo ""

read -p "Voulez-vous installer les modèles optionnels ? (o/N) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[OoYy]$ ]]; then
    for model in "${OPTIONAL_MODELS[@]}"; do
        echo "⬇️  Téléchargement de $model..."
        ollama pull "$model"
        echo ""
    done
    echo "✅ Modèles optionnels installés !"
else
    echo "⏭️  Modèles optionnels ignorés"
fi

echo ""
echo "🎉 Configuration Ollama terminée !"
echo ""
echo "Modèles installés :"
ollama list

echo ""
echo "🚀 Vous pouvez maintenant lancer AgentIA Commercial avec :"
echo "   npm run dev"
