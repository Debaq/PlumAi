#!/usr/bin/env bash
set -euo pipefail

# ─── PlumAi Build ─────────────────────────────────────────────
# Crea builds de producción y los almacena en releases/.
# ───────────────────────────────────────────────────────────────

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

RELEASES_DIR="$ROOT_DIR/releases"
TAURI_CONF="$ROOT_DIR/src-tauri/tauri.conf.json"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

info()  { echo -e "${CYAN}[info]${NC}  $*"; }
ok()    { echo -e "${GREEN}[ok]${NC}    $*"; }
warn()  { echo -e "${YELLOW}[warn]${NC}  $*"; }
error() { echo -e "${RED}[error]${NC} $*"; }

# ─── Obtener info del proyecto ────────────────────────────────
get_version() {
    # Lee la versión de tauri.conf.json
    if command -v python3 &>/dev/null; then
        python3 -c "import json; print(json.load(open('$TAURI_CONF'))['version'])" 2>/dev/null || echo "0.0.0"
    else
        node -e "console.log(require('./src-tauri/tauri.conf.json').version)" 2>/dev/null || echo "0.0.0"
    fi
}

get_platform() {
    local os arch
    os="$(uname -s | tr '[:upper:]' '[:lower:]')"
    arch="$(uname -m)"
    case "$os" in
        linux*)  os="linux" ;;
        darwin*) os="macos" ;;
        mingw*|msys*|cygwin*) os="windows" ;;
    esac
    echo "${os}_${arch}"
}

TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
VERSION="$(get_version)"
PLATFORM="$(get_platform)"
BUILD_TAG="v${VERSION}_${TIMESTAMP}_${PLATFORM}"

# ─── Verificar dependencias ──────────────────────────────────
check_deps() {
    local missing=0

    if ! command -v node &>/dev/null; then
        error "Node.js no encontrado."; missing=1
    fi
    if ! command -v npm &>/dev/null; then
        error "npm no encontrado."; missing=1
    fi
    [ $missing -eq 1 ] && exit 1

    if [ ! -d "node_modules" ]; then
        info "Instalando dependencias de Node..."
        npm install
    fi
}

# ─── Menú ─────────────────────────────────────────────────────
show_menu() {
    echo ""
    echo -e "${BOLD}╔══════════════════════════════════════╗${NC}"
    echo -e "${BOLD}║       PlumAi - Build Release         ║${NC}"
    echo -e "${BOLD}╚══════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  Version: ${BOLD}${VERSION}${NC}  Platform: ${BOLD}${PLATFORM}${NC}"
    echo ""
    echo -e "  ${CYAN}1)${NC} Web only      – Build del frontend (dist/)"
    echo -e "  ${CYAN}2)${NC} Tauri app     – Build nativo completo (.deb, .AppImage, etc.)"
    echo -e "  ${CYAN}3)${NC} Ambos         – Frontend + Tauri"
    echo ""
    echo -en "  Selecciona [${BOLD}1${NC}/${BOLD}2${NC}/${BOLD}3${NC}]: "
}

# ─── Build frontend ──────────────────────────────────────────
build_web() {
    info "Construyendo frontend (Vite)..."
    npm run build

    local dest="$RELEASES_DIR/web_${BUILD_TAG}"
    mkdir -p "$dest"
    cp -r dist/* "$dest/"
    ok "Frontend guardado en: releases/web_${BUILD_TAG}/"
}

# ─── Build Tauri ──────────────────────────────────────────────
build_tauri() {
    if ! command -v cargo &>/dev/null; then
        error "Rust/Cargo es necesario para builds nativos."
        exit 1
    fi

    info "Construyendo aplicación Tauri (release)..."
    npm run tauri:build

    local bundle_dir="$ROOT_DIR/src-tauri/target/release/bundle"
    local dest="$RELEASES_DIR/tauri_${BUILD_TAG}"
    mkdir -p "$dest"

    # Copiar bundles generados según plataforma
    local found=0

    # Linux: AppImage
    if ls "$bundle_dir"/appimage/*.AppImage 2>/dev/null 1>&2; then
        cp "$bundle_dir"/appimage/*.AppImage "$dest/"
        ok "AppImage copiado."
        found=1
    fi

    # Linux: deb
    if ls "$bundle_dir"/deb/*.deb 2>/dev/null 1>&2; then
        cp "$bundle_dir"/deb/*.deb "$dest/"
        ok "Paquete .deb copiado."
        found=1
    fi

    # Linux: rpm
    if ls "$bundle_dir"/rpm/*.rpm 2>/dev/null 1>&2; then
        cp "$bundle_dir"/rpm/*.rpm "$dest/"
        ok "Paquete .rpm copiado."
        found=1
    fi

    # macOS: dmg
    if ls "$bundle_dir"/dmg/*.dmg 2>/dev/null 1>&2; then
        cp "$bundle_dir"/dmg/*.dmg "$dest/"
        ok "DMG copiado."
        found=1
    fi

    # macOS: app bundle
    if ls -d "$bundle_dir"/macos/*.app 2>/dev/null 1>&2; then
        cp -r "$bundle_dir"/macos/*.app "$dest/"
        ok "App bundle copiado."
        found=1
    fi

    # Windows: msi
    if ls "$bundle_dir"/msi/*.msi 2>/dev/null 1>&2; then
        cp "$bundle_dir"/msi/*.msi "$dest/"
        ok "MSI copiado."
        found=1
    fi

    # Windows: nsis
    if ls "$bundle_dir"/nsis/*.exe 2>/dev/null 1>&2; then
        cp "$bundle_dir"/nsis/*.exe "$dest/"
        ok "NSIS installer copiado."
        found=1
    fi

    # Fallback: copiar el binario directamente
    if [ $found -eq 0 ]; then
        local bin="$ROOT_DIR/src-tauri/target/release/plumai"
        if [ -f "$bin" ]; then
            cp "$bin" "$dest/"
            ok "Binario copiado (sin bundle)."
        else
            warn "No se encontraron artefactos de build."
        fi
    fi

    ok "Build Tauri guardado en: releases/tauri_${BUILD_TAG}/"
}

# ─── Resumen final ────────────────────────────────────────────
show_summary() {
    echo ""
    echo -e "${BOLD}── Builds disponibles ──${NC}"
    echo ""
    if [ -d "$RELEASES_DIR" ]; then
        ls -1d "$RELEASES_DIR"/*/ 2>/dev/null | while read -r dir; do
            local name size
            name="$(basename "$dir")"
            size="$(du -sh "$dir" 2>/dev/null | cut -f1)"
            echo -e "  ${GREEN}>${NC} ${name}  (${size})"
        done
        echo ""
        local total
        total="$(du -sh "$RELEASES_DIR" 2>/dev/null | cut -f1)"
        echo -e "  Total en releases/: ${BOLD}${total}${NC}"
    fi
    echo ""
}

# ─── Main ─────────────────────────────────────────────────────
main() {
    check_deps
    mkdir -p "$RELEASES_DIR"

    # Soporte para argumento directo: ./build.sh web | tauri | all
    case "${1:-}" in
        web|1)   build_web; show_summary; exit 0 ;;
        tauri|2) build_tauri; show_summary; exit 0 ;;
        all|3)   build_web; build_tauri; show_summary; exit 0 ;;
    esac

    show_menu
    read -r choice
    echo ""

    case "$choice" in
        1) build_web ;;
        2) build_tauri ;;
        3) build_web; build_tauri ;;
        *) error "Opción inválida."; exit 1 ;;
    esac

    show_summary
}

main "$@"
