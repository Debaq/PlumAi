#!/bin/bash

# Script para descargar fuentes gratuitas recomendadas para KDP
# Estas fuentes son libres y funcionan bien para publicación

echo "📚 Descargando fuentes gratuitas para publicación..."

# Crear directorio temporal
mkdir -p temp_fonts
cd temp_fonts

# EB Garamond (excelente alternativa a Garamond)
echo "⬇️  Descargando EB Garamond..."
wget -q https://github.com/google/fonts/raw/main/ofl/ebgaramond/EBGaramond-Regular.ttf
wget -q https://github.com/google/fonts/raw/main/ofl/ebgaramond/EBGaramond-Bold.ttf
wget -q https://github.com/google/fonts/raw/main/ofl/ebgaramond/EBGaramond-Italic.ttf

# Libre Baskerville (alternativa a Baskerville)
echo "⬇️  Descargando Libre Baskerville..."
wget -q https://github.com/google/fonts/raw/main/ofl/librebaskerville/LibreBaskerville-Regular.ttf
wget -q https://github.com/google/fonts/raw/main/ofl/librebaskerville/LibreBaskerville-Bold.ttf
wget -q https://github.com/google/fonts/raw/main/ofl/librebaskerville/LibreBaskerville-Italic.ttf

# Crimson Text (excelente para novelas)
echo "⬇️  Descargando Crimson Text..."
wget -q https://github.com/google/fonts/raw/main/ofl/crimsontext/CrimsonText-Regular.ttf
wget -q https://github.com/google/fonts/raw/main/ofl/crimsontext/CrimsonText-Bold.ttf
wget -q https://github.com/google/fonts/raw/main/ofl/crimsontext/CrimsonText-Italic.ttf

# Mover fuentes a la carpeta principal
echo "📁 Moviendo fuentes..."
mv *.ttf ../

# Limpiar
cd ..
rm -rf temp_fonts

echo "✅ Fuentes descargadas exitosamente!"
echo ""
echo "Fuentes instaladas:"
ls -1 *.ttf 2>/dev/null | sed 's/^/  - /'
echo ""
echo "Para usar Amazon Ember (recomendado para KDP):"
echo "  1. Consigue los archivos .otf de Amazon Ember"
echo "  2. Colócalos en esta carpeta"
echo "  3. Renómbralos: AmazonEmber-Regular.otf, AmazonEmber-Bold.otf, etc."
