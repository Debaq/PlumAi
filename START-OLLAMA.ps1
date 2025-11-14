# Script para iniciar Ollama con CORS habilitado
# Para Windows PowerShell

Write-Host ""
Write-Host "🦙 Iniciando Ollama con CORS habilitado..." -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANTE: Mantén esta ventana abierta mientras uses PlumAI" -ForegroundColor Yellow
Write-Host ""
Write-Host "Presiona Ctrl+C para detener Ollama"
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host ""

# Configurar CORS para permitir peticiones desde el navegador
$env:OLLAMA_ORIGINS="*"

# Iniciar Ollama
ollama serve
