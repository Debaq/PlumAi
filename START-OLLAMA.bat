@echo off
REM Script para iniciar Ollama con CORS habilitado
REM Para Windows

echo.
echo 🦙 Iniciando Ollama con CORS habilitado...
echo.
echo ⚠️  IMPORTANTE: Mantén esta ventana abierta mientras uses PlumAI
echo.
echo Presiona Ctrl+C para detener Ollama
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

REM Configurar CORS para permitir peticiones desde el navegador
set OLLAMA_ORIGINS=*

REM Iniciar Ollama
ollama serve
