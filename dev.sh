#!/usr/bin/env bash
set -euo pipefail

# ─── PlumAi Dev ───────────────────────────────────────────────
# Levanta el entorno de desarrollo de forma sencilla.
# ───────────────────────────────────────────────────────────────

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

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

# ─── Verificar dependencias ──────────────────────────────────
check_deps() {
    local missing=0

    if ! command -v node &>/dev/null; then
        error "Node.js no encontrado. Instala Node.js >= 18."
        missing=1
    fi

    if ! command -v npm &>/dev/null; then
        error "npm no encontrado."
        missing=1
    fi

    if ! command -v cargo &>/dev/null; then
        warn "Rust/Cargo no encontrado. Solo podrás usar el modo web."
    fi

    if [ $missing -eq 1 ]; then
        exit 1
    fi

    # Instalar node_modules si no existen
    if [ ! -d "node_modules" ]; then
        info "Instalando dependencias de Node..."
        npm install
        ok "Dependencias instaladas."
    fi
}

# ─── Menú ─────────────────────────────────────────────────────
show_menu() {
    echo ""
    echo -e "${BOLD}╔══════════════════════════════════════╗${NC}"
    echo -e "${BOLD}║        PlumAi - Dev Mode             ║${NC}"
    echo -e "${BOLD}╚══════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  ${CYAN}1)${NC} Web only      – Vite dev server (localhost:3000)"
    echo -e "  ${CYAN}2)${NC} Tauri app     – App nativa completa (frontend + Rust)"
    echo -e "  ${CYAN}3)${NC} Reinstalar    – Borrar node_modules y reinstalar"
    echo -e "  ${CYAN}4)${NC} Tauri Clean   – Borrar cache de Rust y recompilar desde cero"
    echo ""
    echo -en "  Selecciona [${BOLD}1${NC}/${BOLD}2${NC}/${BOLD}3${NC}/${BOLD}4${NC}]: "
}

# ─── Modo web ─────────────────────────────────────────────────
dev_web() {
    info "Levantando Vite dev server en http://localhost:3000 ..."
    npm run dev
}

# ─── Modo Tauri ───────────────────────────────────────────────
dev_tauri() {
    if ! command -v cargo &>/dev/null; then
        error "Rust/Cargo es necesario para el modo Tauri."
        exit 1
    fi
    info "Forzando detección de cambios (touch)..."
    touch src-tauri/src/lib.rs
    info "Levantando Tauri en modo desarrollo..."
    npm run tauri:dev
}

# ─── Modo Tauri (Clean) ───────────────────────────────────────
dev_tauri_clean() {
    if ! command -v cargo &>/dev/null; then
        error "Rust/Cargo es necesario para el modo Tauri."
        exit 1
    fi
    info "Limpiando build de Rust (cargo clean)..."
    (cd src-tauri && cargo clean)
    info "Levantando Tauri (Clean build)..."
    npm run tauri:dev
}

# ─── Reinstalar deps ─────────────────────────────────────────
reinstall() {
    info "Borrando node_modules..."
    rm -rf node_modules
    info "Instalando dependencias..."
    npm install
    ok "Dependencias reinstaladas."
}

# ─── Main ─────────────────────────────────────────────────────
main() {
    check_deps

    # Soporte para argumento directo: ./dev.sh web | ./dev.sh tauri
    case "${1:-}" in
        web|1)   dev_web;  exit 0 ;;
        tauri|2) dev_tauri; exit 0 ;;
        clean|4) dev_tauri_clean; exit 0 ;;
        reinstall|3) reinstall; exit 0 ;;
    esac

    show_menu
    read -r choice
    echo ""

    case "$choice" in
        1) dev_web ;;
        2) dev_tauri ;;
        3) reinstall ;;
        4) dev_tauri_clean ;;
        *) error "Opción inválida."; exit 1 ;;
    esac
}

main "$@"
