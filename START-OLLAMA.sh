#!/bin/bash

# Script para iniciar Ollama con CORS habilitado
# Para Linux / macOS

echo "🦙 Iniciando Ollama con CORS habilitado..."
echo ""
echo "⚠️  IMPORTANTE: Mantén esta terminal abierta mientras uses PlumAI"
echo ""
echo "Presiona Ctrl+C para detener Ollama"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Configurar CORS para permitir peticiones desde el navegador
export OLLAMA_ORIGINS="*"

# Iniciar Ollama
ollama serve
