#!/usr/bin/env bash
set -euo pipefail

# ═══════════════════════════════════════════════════════════════
#  PlumAi - Panel de Desarrollo
#  Script unificado para desarrollo, build y mantenimiento.
# ═══════════════════════════════════════════════════════════════

# ─── Configuración Inicial ────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

RELEASES_DIR="$SCRIPT_DIR/releases"
TAURI_CONF="$SCRIPT_DIR/src-tauri/tauri.conf.json"
APP_NAME="plumai"

# Colores ANSI
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

# Funciones de logging
info()  { echo -e "  ${CYAN}▸${NC} $*"; }
ok()    { echo -e "  ${GREEN}✓${NC} $*"; }
warn()  { echo -e "  ${YELLOW}⚠${NC} $*"; }
fail()  { echo -e "  ${RED}✗${NC} $*"; }

# ─── Info del Proyecto ────────────────────────────────────────
get_version() {
    if command -v python3 &>/dev/null; then
        python3 -c "import json; print(json.load(open('$TAURI_CONF'))['version'])" 2>/dev/null || echo "0.0.0"
    elif command -v node &>/dev/null; then
        node -e "console.log(require('$TAURI_CONF').version)" 2>/dev/null || echo "0.0.0"
    else
        echo "0.0.0"
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

VERSION="$(get_version)"
PLATFORM="$(get_platform)"

# ═══════════════════════════════════════════════════════════════
#  Funciones Auxiliares
# ═══════════════════════════════════════════════════════════════

# ─── Limpiar Procesos ─────────────────────────────────────────
# Busca y termina procesos de PlumAi previos para evitar
# conflictos de puertos o instancias duplicadas.
cleanup_processes() {
    local pids
    pids=$(pgrep -f "$APP_NAME" 2>/dev/null | grep -v "^$$\$" || true)

    if [ -n "$pids" ]; then
        warn "Procesos de $APP_NAME detectados en segundo plano."
        echo -e "  ${DIM}PIDs: $pids${NC}"
        echo -en "  ¿Terminar procesos anteriores? [${BOLD}s${NC}/n]: "
        read -r answer
        if [[ "${answer:-s}" =~ ^[sS]$ ]]; then
            echo "$pids" | xargs kill -TERM 2>/dev/null || true
            sleep 1
            # Si alguno sigue vivo, forzar
            pids=$(pgrep -f "$APP_NAME" 2>/dev/null | grep -v "^$$\$" || true)
            if [ -n "$pids" ]; then
                echo "$pids" | xargs kill -9 2>/dev/null || true
            fi
            ok "Procesos anteriores terminados."
        fi
    fi
}

# ─── Verificar Dependencias del Sistema ───────────────────────
check_system_deps() {
    local missing=0

    if ! command -v node &>/dev/null; then
        fail "Node.js no encontrado. Se requiere Node.js >= 18."
        missing=1
    else
        local node_ver
        node_ver="$(node -v)"
        ok "Node.js ${node_ver}"
    fi

    if ! command -v npm &>/dev/null; then
        fail "npm no encontrado."
        missing=1
    else
        ok "npm $(npm -v 2>/dev/null)"
    fi

    if ! command -v cargo &>/dev/null; then
        warn "Rust/Cargo no encontrado. Solo dispondrás del modo web."
    else
        ok "Cargo $(cargo --version 2>/dev/null | awk '{print $2}')"
    fi

    if [ $missing -eq 1 ]; then
        echo ""
        fail "Faltan dependencias obligatorias. Abortando."
        exit 1
    fi
}

# ─── Instalar Dependencias ────────────────────────────────────
# Frontend: npm install
# Backend:  cargo fetch (descarga crates sin compilar)
install_deps() {
    echo ""
    info "Instalando dependencias del frontend..."
    npm install
    ok "Dependencias de Node instaladas."

    if command -v cargo &>/dev/null; then
        echo ""
        info "Descargando crates de Rust (cargo fetch)..."
        (cd src-tauri && cargo fetch)
        ok "Crates descargados."
    else
        warn "Cargo no disponible, saltando crates de Rust."
    fi

    echo ""
    ok "Todas las dependencias instaladas."
}

# ─── Build Frontend ───────────────────────────────────────────
# Compila el frontend con Vite. Instala node_modules si faltan.
build_frontend() {
    if [ ! -d "node_modules" ]; then
        info "node_modules no encontrado, instalando..."
        npm install
    fi

    info "Compilando frontend (Vite)..."
    npm run build
    ok "Frontend compilado en dist/."
}

# ─── Dev Web ──────────────────────────────────────────────────
# Levanta solo el servidor Vite (sin Tauri).
run_dev_web() {
    cleanup_processes
    echo ""
    info "Levantando Vite dev server en ${BOLD}http://localhost:3000${NC} ..."
    echo ""
    npm run dev
}

# ─── Dev Tauri ────────────────────────────────────────────────
# Inicia el entorno de desarrollo completo (frontend + Rust).
# Acepta un flag --release para compilar el backend optimizado
# manteniendo el frontend con HMR.
run_dev_tauri() {
    local release_flag="${1:-}"

    if ! command -v cargo &>/dev/null; then
        fail "Rust/Cargo es necesario para el modo Tauri."
        exit 1
    fi

    cleanup_processes

    if [ ! -d "node_modules" ]; then
        info "node_modules no encontrado, instalando..."
        npm install
    fi

    # Touch para forzar recompilación
    touch src-tauri/src/lib.rs

    echo ""
    if [ "$release_flag" = "--release" ]; then
        info "Levantando Tauri en modo ${BOLD}alta velocidad${NC} (backend release + HMR)..."
        npm run tauri:dev -- --release
    else
        info "Levantando Tauri en modo desarrollo..."
        npm run tauri:dev
    fi
}

# ─── Dev Limpio ───────────────────────────────────────────────
# Limpia la caché de Rust y levanta Tauri desde cero.
run_dev_clean() {
    if ! command -v cargo &>/dev/null; then
        fail "Rust/Cargo es necesario para el modo Tauri."
        exit 1
    fi

    cleanup_processes

    info "Limpiando build de Rust (cargo clean)..."
    (cd src-tauri && cargo clean)
    ok "Caché de Rust eliminada."

    if [ ! -d "node_modules" ]; then
        info "node_modules no encontrado, instalando..."
        npm install
    fi

    echo ""
    touch src-tauri/src/lib.rs
    info "Levantando Tauri (build limpio)..."
    npm run tauri:dev
}

# ─── Build Producción ─────────────────────────────────────────
# Orquesta el build de producción completo:
# 1. Compila frontend
# 2. Compila backend en release
# 3. Empaqueta la app
# 4. Archiva artefactos en releases/
do_build() {
    if ! command -v cargo &>/dev/null; then
        fail "Rust/Cargo es necesario para builds de producción."
        exit 1
    fi

    local timestamp build_tag
    timestamp="$(date +%Y%m%d-%H%M%S)"
    build_tag="v${VERSION}_${timestamp}_${PLATFORM}"

    mkdir -p "$RELEASES_DIR"

    echo ""
    info "Iniciando build de producción..."
    echo -e "  ${DIM}Tag: ${build_tag}${NC}"
    echo ""

    # 1. Build frontend
    build_frontend
    echo ""

    # 2. Build Tauri (frontend + backend + bundle)
    info "Construyendo aplicación Tauri (release)..."
    npm run tauri:build

    # 3. Archivar artefactos
    local bundle_dir="$SCRIPT_DIR/src-tauri/target/release/bundle"
    local dest="$RELEASES_DIR/tauri_${build_tag}"
    mkdir -p "$dest"

    local found=0

    # Linux
    if ls "$bundle_dir"/appimage/*.AppImage 2>/dev/null 1>&2; then
        cp "$bundle_dir"/appimage/*.AppImage "$dest/"
        ok "AppImage copiado."
        found=1
    fi
    if ls "$bundle_dir"/deb/*.deb 2>/dev/null 1>&2; then
        cp "$bundle_dir"/deb/*.deb "$dest/"
        ok "Paquete .deb copiado."
        found=1
    fi
    if ls "$bundle_dir"/rpm/*.rpm 2>/dev/null 1>&2; then
        cp "$bundle_dir"/rpm/*.rpm "$dest/"
        ok "Paquete .rpm copiado."
        found=1
    fi

    # macOS
    if ls "$bundle_dir"/dmg/*.dmg 2>/dev/null 1>&2; then
        cp "$bundle_dir"/dmg/*.dmg "$dest/"
        ok "DMG copiado."
        found=1
    fi
    if ls -d "$bundle_dir"/macos/*.app 2>/dev/null 1>&2; then
        cp -r "$bundle_dir"/macos/*.app "$dest/"
        ok "App bundle copiado."
        found=1
    fi

    # Windows
    if ls "$bundle_dir"/msi/*.msi 2>/dev/null 1>&2; then
        cp "$bundle_dir"/msi/*.msi "$dest/"
        ok "MSI copiado."
        found=1
    fi
    if ls "$bundle_dir"/nsis/*.exe 2>/dev/null 1>&2; then
        cp "$bundle_dir"/nsis/*.exe "$dest/"
        ok "NSIS installer copiado."
        found=1
    fi

    # Fallback: binario sin bundle
    if [ $found -eq 0 ]; then
        local bin="$SCRIPT_DIR/src-tauri/target/release/$APP_NAME"
        if [ -f "$bin" ]; then
            cp "$bin" "$dest/"
            ok "Binario copiado (sin bundle)."
        else
            warn "No se encontraron artefactos de build."
        fi
    fi

    # 4. Crear tarball
    (cd "$RELEASES_DIR" && tar -czf "tauri_${build_tag}.tar.gz" "tauri_${build_tag}/")
    ok "Tarball creado: tauri_${build_tag}.tar.gz"

    echo ""
    ok "Build de producción completado."
    echo -e "  ${DIM}Destino: releases/tauri_${build_tag}/${NC}"

    # Resumen de releases
    show_releases
}

# ─── Limpiar Todo ─────────────────────────────────────────────
# Hard reset: borra node_modules, dist y ejecuta cargo clean.
clean_all() {
    echo ""
    warn "Esto eliminará node_modules, dist y la caché de Rust."
    echo -en "  ¿Continuar? [s/${BOLD}n${NC}]: "
    read -r answer
    if [[ ! "${answer:-n}" =~ ^[sS]$ ]]; then
        info "Cancelado."
        return
    fi

    echo ""
    if [ -d "node_modules" ]; then
        info "Eliminando node_modules/..."
        rm -rf node_modules
        ok "node_modules eliminado."
    fi

    if [ -d "dist" ]; then
        info "Eliminando dist/..."
        rm -rf dist
        ok "dist eliminado."
    fi

    if command -v cargo &>/dev/null && [ -d "src-tauri/target" ]; then
        info "Ejecutando cargo clean..."
        (cd src-tauri && cargo clean)
        ok "Caché de Rust eliminada."
    fi

    echo ""
    ok "Limpieza completa."
}

# ─── Mostrar Releases ────────────────────────────────────────
show_releases() {
    echo ""
    echo -e "  ${BOLD}── Builds disponibles ──${NC}"
    echo ""
    if [ -d "$RELEASES_DIR" ] && ls -1d "$RELEASES_DIR"/*/ 2>/dev/null | head -1 &>/dev/null; then
        ls -1d "$RELEASES_DIR"/*/ 2>/dev/null | while read -r dir; do
            local name size
            name="$(basename "$dir")"
            size="$(du -sh "$dir" 2>/dev/null | cut -f1)"
            echo -e "    ${GREEN}▸${NC} ${name}  ${DIM}(${size})${NC}"
        done
        echo ""
        local total
        total="$(du -sh "$RELEASES_DIR" 2>/dev/null | cut -f1)"
        echo -e "    Total en releases/: ${BOLD}${total}${NC}"
    else
        echo -e "    ${DIM}(sin builds previos)${NC}"
    fi
    echo ""
}

# ─── Lanzar Build Existente ─────────────────────────────────
# Lista los builds en releases/, muestra timestamp legible,
# y permite al usuario elegir cuál ejecutar.
launch_build() {
    echo ""

    if [ ! -d "$RELEASES_DIR" ]; then
        warn "No existe el directorio releases/."
        return
    fi

    # Recoger directorios de builds (ordenados por fecha, más reciente primero)
    local dirs=()
    while IFS= read -r dir; do
        dirs+=("$dir")
    done < <(ls -1dt "$RELEASES_DIR"/*/ 2>/dev/null)

    if [ ${#dirs[@]} -eq 0 ]; then
        warn "No hay builds disponibles en releases/."
        return
    fi

    echo -e "  ${BOLD}── Builds disponibles ──${NC}"
    echo ""

    local i=1
    for dir in "${dirs[@]}"; do
        local name size ts_raw ts_display
        name="$(basename "$dir")"
        size="$(du -sh "$dir" 2>/dev/null | cut -f1)"

        # Extraer timestamp del nombre: tauri_v0.1.0_20250615-143022_linux_x86_64
        ts_raw=$(echo "$name" | grep -oP '\d{8}-\d{6}' || true)
        if [ -n "$ts_raw" ]; then
            # Convertir 20250615-143022 → 2025-06-15 14:30:22
            ts_display=$(date -d "${ts_raw:0:4}-${ts_raw:4:2}-${ts_raw:6:2} ${ts_raw:9:2}:${ts_raw:11:2}:${ts_raw:13:2}" "+%Y-%m-%d %H:%M:%S" 2>/dev/null || echo "$ts_raw")
        else
            ts_display="$(stat -c '%y' "$dir" 2>/dev/null | cut -d'.' -f1 || echo "?")"
        fi

        echo -e "    ${CYAN}${i})${NC} ${name}"
        echo -e "       ${DIM}Fecha: ${ts_display}  |  Tamaño: ${size}${NC}"
        ((i++))
    done

    echo ""
    echo -e "    ${DIM}0) Cancelar${NC}"
    echo ""
    echo -en "  Selecciona un build [${BOLD}0-${#dirs[@]}${NC}]: "
    read -r pick

    if [[ "$pick" == "0" || -z "$pick" ]]; then
        info "Cancelado."
        return
    fi

    if ! [[ "$pick" =~ ^[0-9]+$ ]] || [ "$pick" -lt 1 ] || [ "$pick" -gt ${#dirs[@]} ]; then
        warn "Opción inválida."
        return
    fi

    local chosen="${dirs[$((pick - 1))]}"
    local executable=""

    # Buscar ejecutable según plataforma
    # Linux: AppImage > binario
    executable=$(find "$chosen" -maxdepth 1 -name "*.AppImage" -type f 2>/dev/null | head -1)
    if [ -z "$executable" ]; then
        executable=$(find "$chosen" -maxdepth 1 -name "$APP_NAME" -type f -executable 2>/dev/null | head -1)
    fi
    # macOS: .app bundle
    if [ -z "$executable" ]; then
        local app_bundle
        app_bundle=$(find "$chosen" -maxdepth 1 -name "*.app" -type d 2>/dev/null | head -1)
        if [ -n "$app_bundle" ]; then
            executable="open:$app_bundle"
        fi
    fi
    # Windows: .exe
    if [ -z "$executable" ]; then
        executable=$(find "$chosen" -maxdepth 1 -name "*.exe" -type f 2>/dev/null | head -1)
    fi

    if [ -z "$executable" ]; then
        fail "No se encontró un ejecutable en $(basename "$chosen")."
        echo -e "  ${DIM}Contenido:${NC}"
        ls -1 "$chosen" | while read -r f; do echo -e "    ${DIM}$f${NC}"; done
        return
    fi

    echo ""
    if [[ "$executable" == open:* ]]; then
        local bundle="${executable#open:}"
        info "Abriendo ${BOLD}$(basename "$bundle")${NC}..."
        open "$bundle" &
    else
        chmod +x "$executable" 2>/dev/null || true
        info "Lanzando ${BOLD}$(basename "$executable")${NC}..."
        "$executable" &
    fi

    ok "Aplicación lanzada (PID: $!)."
}

# ═══════════════════════════════════════════════════════════════
#  Interfaz Interactiva
# ═══════════════════════════════════════════════════════════════

show_menu() {
    clear 2>/dev/null || true
    echo ""
    echo -e "  ${BOLD}═══════════════════════════════════════════════════════${NC}"
    echo -e "  ${BOLD}  PlumAi - Panel de Desarrollo${NC}"
    echo -e "  ${BOLD}═══════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "    Version: ${CYAN}${VERSION}${NC}    Plataforma: ${CYAN}${PLATFORM}${NC}"
    echo ""
    echo -e "  ${MAGENTA}  Desarrollo${NC}"
    echo -e "    ${CYAN}1)${NC} Instalar dependencias        ${DIM}(npm install + cargo fetch)${NC}"
    echo -e "    ${CYAN}2)${NC} Dev web                       ${DIM}(Vite dev server en :3000)${NC}"
    echo -e "    ${CYAN}3)${NC} Dev Tauri                     ${DIM}(app nativa completa)${NC}"
    echo -e "    ${CYAN}4)${NC} Dev limpio                    ${DIM}(limpiar Rust + dev Tauri)${NC}"
    echo -e "    ${CYAN}5)${NC} Dev alta velocidad            ${DIM}(backend release + HMR)${NC}"
    echo ""
    echo -e "  ${MAGENTA}  Producción${NC}"
    echo -e "    ${CYAN}6)${NC} Build producción              ${DIM}(binario + bundle + tarball)${NC}"
    echo -e "    ${CYAN}7)${NC} Lanzar build                  ${DIM}(elegir y ejecutar un build)${NC}"
    echo ""
    echo -e "  ${MAGENTA}  Mantenimiento${NC}"
    echo -e "    ${CYAN}8)${NC} Limpiar todo                  ${DIM}(node_modules + cargo clean)${NC}"
    echo ""
    echo -e "    ${DIM}0) Salir${NC}"
    echo ""
    echo -en "  Selecciona una opción [${BOLD}0-8${NC}]: "
}

# ═══════════════════════════════════════════════════════════════
#  Main
# ═══════════════════════════════════════════════════════════════

run_option() {
    case "$1" in
        install|1)   check_system_deps; install_deps ;;
        web|2)       run_dev_web ;;
        tauri|3)     run_dev_tauri ;;
        clean|4)     run_dev_clean ;;
        fast|5)      run_dev_tauri --release ;;
        build|6)     check_system_deps; do_build ;;
        launch|7)    launch_build ;;
        purge|8)     clean_all ;;
        *)           return 1 ;;
    esac
}

main() {
    # Modo directo: ./plumai.sh <comando>
    if [ $# -gt 0 ]; then
        if run_option "$1"; then
            exit 0
        else
            fail "Comando desconocido: $1"
            echo ""
            echo -e "  Uso: ${BOLD}./plumai.sh${NC} [comando]"
            echo ""
            echo "  Comandos:"
            echo "    install   Instalar dependencias"
            echo "    web       Dev server (Vite)"
            echo "    tauri     Dev Tauri (app nativa)"
            echo "    clean     Dev limpio (cargo clean + dev)"
            echo "    fast      Dev alta velocidad (release)"
            echo "    build     Build de producción"
            echo "    launch    Lanzar un build existente"
            echo "    purge     Limpiar todo"
            echo ""
            exit 1
        fi
    fi

    # Modo interactivo: bucle de menú
    while true; do
        show_menu
        read -r choice
        echo ""

        case "$choice" in
            0) echo -e "  ${DIM}Hasta luego.${NC}"; echo ""; exit 0 ;;
            [1-8])
                run_option "$choice"
                echo ""
                echo -en "  ${DIM}Presiona Enter para volver al menú...${NC}"
                read -r
                ;;
            *)
                warn "Opción inválida."
                sleep 1
                ;;
        esac
    done
}

main "$@"
