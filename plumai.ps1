# ═══════════════════════════════════════════════════════════════
#  PlumAi - Panel de Desarrollo (PowerShell)
#  Script unificado para desarrollo, build y mantenimiento.
# ═══════════════════════════════════════════════════════════════

param(
    [Parameter(Position = 0)]
    [ValidateSet("install", "web", "tauri", "clean", "fast", "build", "purge", "")]
    [string]$Command = ""
)

$ErrorActionPreference = "Stop"

# ─── Configuración Inicial ────────────────────────────────────
$ScriptDir = $PSScriptRoot
Set-Location $ScriptDir

$ReleasesDir = Join-Path $ScriptDir "releases"
$TauriConf   = Join-Path $ScriptDir "src-tauri" "tauri.conf.json"
$AppName     = "plumai"

# ─── Colores (secuencias ANSI) ────────────────────────────────
$e = [char]27
$RED     = "$e[0;31m"
$GREEN   = "$e[0;32m"
$CYAN    = "$e[0;36m"
$YELLOW  = "$e[1;33m"
$MAGENTA = "$e[0;35m"
$BOLD    = "$e[1m"
$DIM     = "$e[2m"
$NC      = "$e[0m"

# ─── Funciones de Logging ─────────────────────────────────────
function Write-Info  { param([string]$Msg) Write-Host "  ${CYAN}▸${NC} $Msg" }
function Write-Ok    { param([string]$Msg) Write-Host "  ${GREEN}✓${NC} $Msg" }
function Write-Warn  { param([string]$Msg) Write-Host "  ${YELLOW}⚠${NC} $Msg" }
function Write-Fail  { param([string]$Msg) Write-Host "  ${RED}✗${NC} $Msg" }

# ─── Info del Proyecto ────────────────────────────────────────
function Get-ProjectVersion {
    try {
        $conf = Get-Content $TauriConf -Raw | ConvertFrom-Json
        return $conf.version
    } catch {
        return "0.0.0"
    }
}

function Get-BuildPlatform {
    $os = if ($IsWindows -or $env:OS -eq "Windows_NT") { "windows" }
          elseif ($IsMacOS) { "macos" }
          else { "linux" }
    $arch = [System.Runtime.InteropServices.RuntimeInformation]::OSArchitecture.ToString().ToLower()
    return "${os}_${arch}"
}

$Version  = Get-ProjectVersion
$Platform = Get-BuildPlatform

# ═══════════════════════════════════════════════════════════════
#  Funciones Auxiliares
# ═══════════════════════════════════════════════════════════════

# ─── Limpiar Procesos ─────────────────────────────────────────
function Invoke-CleanupProcesses {
    $procs = Get-Process -Name $AppName -ErrorAction SilentlyContinue

    if ($procs) {
        Write-Warn "Procesos de $AppName detectados en segundo plano."
        $pids = ($procs | ForEach-Object { $_.Id }) -join ", "
        Write-Host "  ${DIM}PIDs: $pids${NC}"
        $answer = Read-Host "  ¿Terminar procesos anteriores? [s/n] (s)"
        if (-not $answer -or $answer -match "^[sS]$") {
            $procs | Stop-Process -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 1
            Write-Ok "Procesos anteriores terminados."
        }
    }
}

# ─── Verificar Dependencias del Sistema ───────────────────────
function Test-SystemDeps {
    $missing = 0

    if (Get-Command node -ErrorAction SilentlyContinue) {
        $nodeVer = & node -v 2>$null
        Write-Ok "Node.js $nodeVer"
    } else {
        Write-Fail "Node.js no encontrado. Se requiere Node.js >= 18."
        $missing = 1
    }

    if (Get-Command npm -ErrorAction SilentlyContinue) {
        $npmVer = & npm -v 2>$null
        Write-Ok "npm $npmVer"
    } else {
        Write-Fail "npm no encontrado."
        $missing = 1
    }

    if (Get-Command cargo -ErrorAction SilentlyContinue) {
        $cargoVer = (& cargo --version 2>$null) -replace "cargo ", ""
        Write-Ok "Cargo $cargoVer"
    } else {
        Write-Warn "Rust/Cargo no encontrado. Solo dispondrás del modo web."
    }

    if ($missing -eq 1) {
        Write-Host ""
        Write-Fail "Faltan dependencias obligatorias. Abortando."
        exit 1
    }
}

# ─── Instalar Dependencias ────────────────────────────────────
function Install-Dependencies {
    Write-Host ""
    Write-Info "Instalando dependencias del frontend..."
    & npm install
    if ($LASTEXITCODE -ne 0) { Write-Fail "Error al instalar dependencias de Node."; exit 1 }
    Write-Ok "Dependencias de Node instaladas."

    if (Get-Command cargo -ErrorAction SilentlyContinue) {
        Write-Host ""
        Write-Info "Descargando crates de Rust (cargo fetch)..."
        Push-Location (Join-Path $ScriptDir "src-tauri")
        & cargo fetch
        Pop-Location
        if ($LASTEXITCODE -ne 0) { Write-Fail "Error al descargar crates."; exit 1 }
        Write-Ok "Crates descargados."
    } else {
        Write-Warn "Cargo no disponible, saltando crates de Rust."
    }

    Write-Host ""
    Write-Ok "Todas las dependencias instaladas."
}

# ─── Build Frontend ───────────────────────────────────────────
function Build-Frontend {
    if (-not (Test-Path "node_modules")) {
        Write-Info "node_modules no encontrado, instalando..."
        & npm install
        if ($LASTEXITCODE -ne 0) { Write-Fail "Error al instalar dependencias."; exit 1 }
    }

    Write-Info "Compilando frontend (Vite)..."
    & npm run build
    if ($LASTEXITCODE -ne 0) { Write-Fail "Error al compilar frontend."; exit 1 }
    Write-Ok "Frontend compilado en dist/."
}

# ─── Dev Web ──────────────────────────────────────────────────
function Start-DevWeb {
    Invoke-CleanupProcesses
    Write-Host ""
    Write-Info "Levantando Vite dev server en ${BOLD}http://localhost:3000${NC} ..."
    Write-Host ""
    & npm run dev
}

# ─── Dev Tauri ────────────────────────────────────────────────
function Start-DevTauri {
    param([switch]$Release)

    if (-not (Get-Command cargo -ErrorAction SilentlyContinue)) {
        Write-Fail "Rust/Cargo es necesario para el modo Tauri."
        exit 1
    }

    Invoke-CleanupProcesses

    if (-not (Test-Path "node_modules")) {
        Write-Info "node_modules no encontrado, instalando..."
        & npm install
        if ($LASTEXITCODE -ne 0) { exit 1 }
    }

    # Touch para forzar recompilación
    $librs = Join-Path $ScriptDir "src-tauri" "src" "lib.rs"
    (Get-Item $librs).LastWriteTime = Get-Date

    Write-Host ""
    if ($Release) {
        Write-Info "Levantando Tauri en modo ${BOLD}alta velocidad${NC} (backend release + HMR)..."
        & npm run tauri:dev -- --release
    } else {
        Write-Info "Levantando Tauri en modo desarrollo..."
        & npm run tauri:dev
    }
}

# ─── Dev Limpio ───────────────────────────────────────────────
function Start-DevClean {
    if (-not (Get-Command cargo -ErrorAction SilentlyContinue)) {
        Write-Fail "Rust/Cargo es necesario para el modo Tauri."
        exit 1
    }

    Invoke-CleanupProcesses

    Write-Info "Limpiando build de Rust (cargo clean)..."
    Push-Location (Join-Path $ScriptDir "src-tauri")
    & cargo clean
    Pop-Location
    Write-Ok "Caché de Rust eliminada."

    if (-not (Test-Path "node_modules")) {
        Write-Info "node_modules no encontrado, instalando..."
        & npm install
        if ($LASTEXITCODE -ne 0) { exit 1 }
    }

    Write-Host ""
    $librs = Join-Path $ScriptDir "src-tauri" "src" "lib.rs"
    (Get-Item $librs).LastWriteTime = Get-Date
    Write-Info "Levantando Tauri (build limpio)..."
    & npm run tauri:dev
}

# ─── Build Producción ─────────────────────────────────────────
function Invoke-ProductionBuild {
    if (-not (Get-Command cargo -ErrorAction SilentlyContinue)) {
        Write-Fail "Rust/Cargo es necesario para builds de producción."
        exit 1
    }

    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $buildTag  = "v${Version}_${timestamp}_${Platform}"

    if (-not (Test-Path $ReleasesDir)) { New-Item -ItemType Directory -Path $ReleasesDir | Out-Null }

    Write-Host ""
    Write-Info "Iniciando build de producción..."
    Write-Host "  ${DIM}Tag: ${buildTag}${NC}"
    Write-Host ""

    # 1. Build frontend
    Build-Frontend
    Write-Host ""

    # 2. Build Tauri
    Write-Info "Construyendo aplicación Tauri (release)..."
    & npm run tauri:build
    if ($LASTEXITCODE -ne 0) { Write-Fail "Error en build de Tauri."; exit 1 }

    # 3. Archivar artefactos
    $bundleDir = Join-Path $ScriptDir "src-tauri" "target" "release" "bundle"
    $dest      = Join-Path $ReleasesDir "tauri_$buildTag"
    New-Item -ItemType Directory -Path $dest -Force | Out-Null

    $found = $false

    # Windows: MSI
    $msiFiles = Get-ChildItem (Join-Path $bundleDir "msi" "*.msi") -ErrorAction SilentlyContinue
    if ($msiFiles) {
        $msiFiles | Copy-Item -Destination $dest
        Write-Ok "MSI copiado."
        $found = $true
    }

    # Windows: NSIS
    $nsisFiles = Get-ChildItem (Join-Path $bundleDir "nsis" "*.exe") -ErrorAction SilentlyContinue
    if ($nsisFiles) {
        $nsisFiles | Copy-Item -Destination $dest
        Write-Ok "NSIS installer copiado."
        $found = $true
    }

    # Linux: AppImage
    $appimageFiles = Get-ChildItem (Join-Path $bundleDir "appimage" "*.AppImage") -ErrorAction SilentlyContinue
    if ($appimageFiles) {
        $appimageFiles | Copy-Item -Destination $dest
        Write-Ok "AppImage copiado."
        $found = $true
    }

    # Linux: deb
    $debFiles = Get-ChildItem (Join-Path $bundleDir "deb" "*.deb") -ErrorAction SilentlyContinue
    if ($debFiles) {
        $debFiles | Copy-Item -Destination $dest
        Write-Ok "Paquete .deb copiado."
        $found = $true
    }

    # Linux: rpm
    $rpmFiles = Get-ChildItem (Join-Path $bundleDir "rpm" "*.rpm") -ErrorAction SilentlyContinue
    if ($rpmFiles) {
        $rpmFiles | Copy-Item -Destination $dest
        Write-Ok "Paquete .rpm copiado."
        $found = $true
    }

    # macOS: DMG
    $dmgFiles = Get-ChildItem (Join-Path $bundleDir "dmg" "*.dmg") -ErrorAction SilentlyContinue
    if ($dmgFiles) {
        $dmgFiles | Copy-Item -Destination $dest
        Write-Ok "DMG copiado."
        $found = $true
    }

    # macOS: app bundle
    $appBundles = Get-ChildItem (Join-Path $bundleDir "macos" "*.app") -Directory -ErrorAction SilentlyContinue
    if ($appBundles) {
        $appBundles | Copy-Item -Destination $dest -Recurse
        Write-Ok "App bundle copiado."
        $found = $true
    }

    # Fallback: binario directo
    if (-not $found) {
        $binName = if ($IsWindows -or $env:OS -eq "Windows_NT") { "$AppName.exe" } else { $AppName }
        $bin = Join-Path $ScriptDir "src-tauri" "target" "release" $binName
        if (Test-Path $bin) {
            Copy-Item $bin -Destination $dest
            Write-Ok "Binario copiado (sin bundle)."
        } else {
            Write-Warn "No se encontraron artefactos de build."
        }
    }

    # 4. Crear archivo comprimido
    $zipPath = Join-Path $ReleasesDir "tauri_${buildTag}.zip"
    Compress-Archive -Path $dest -DestinationPath $zipPath -Force
    Write-Ok "Archivo creado: tauri_${buildTag}.zip"

    Write-Host ""
    Write-Ok "Build de producción completado."
    Write-Host "  ${DIM}Destino: releases\tauri_${buildTag}\${NC}"

    Show-Releases
}

# ─── Limpiar Todo ─────────────────────────────────────────────
function Invoke-CleanAll {
    Write-Host ""
    Write-Warn "Esto eliminará node_modules, dist y la caché de Rust."
    $answer = Read-Host "  ¿Continuar? [s/n] (n)"
    if ($answer -notmatch "^[sS]$") {
        Write-Info "Cancelado."
        return
    }

    Write-Host ""
    if (Test-Path "node_modules") {
        Write-Info "Eliminando node_modules/..."
        Remove-Item -Recurse -Force "node_modules"
        Write-Ok "node_modules eliminado."
    }

    if (Test-Path "dist") {
        Write-Info "Eliminando dist/..."
        Remove-Item -Recurse -Force "dist"
        Write-Ok "dist eliminado."
    }

    $tauriTarget = Join-Path "src-tauri" "target"
    if ((Get-Command cargo -ErrorAction SilentlyContinue) -and (Test-Path $tauriTarget)) {
        Write-Info "Ejecutando cargo clean..."
        Push-Location (Join-Path $ScriptDir "src-tauri")
        & cargo clean
        Pop-Location
        Write-Ok "Caché de Rust eliminada."
    }

    Write-Host ""
    Write-Ok "Limpieza completa."
}

# ─── Mostrar Releases ────────────────────────────────────────
function Show-Releases {
    Write-Host ""
    Write-Host "  ${BOLD}── Builds disponibles ──${NC}"
    Write-Host ""

    if ((Test-Path $ReleasesDir) -and (Get-ChildItem $ReleasesDir -Directory -ErrorAction SilentlyContinue)) {
        Get-ChildItem $ReleasesDir -Directory | ForEach-Object {
            $name = $_.Name
            $sizeBytes = (Get-ChildItem $_.FullName -Recurse -File -ErrorAction SilentlyContinue |
                          Measure-Object -Property Length -Sum).Sum
            $sizeMB = [math]::Round($sizeBytes / 1MB, 1)
            Write-Host "    ${GREEN}▸${NC} $name  ${DIM}(${sizeMB} MB)${NC}"
        }
        Write-Host ""
        $totalBytes = (Get-ChildItem $ReleasesDir -Recurse -File -ErrorAction SilentlyContinue |
                       Measure-Object -Property Length -Sum).Sum
        $totalMB = [math]::Round($totalBytes / 1MB, 1)
        Write-Host "    Total en releases\: ${BOLD}${totalMB} MB${NC}"
    } else {
        Write-Host "    ${DIM}(sin builds previos)${NC}"
    }
    Write-Host ""
}

# ═══════════════════════════════════════════════════════════════
#  Interfaz Interactiva
# ═══════════════════════════════════════════════════════════════

function Show-Menu {
    Clear-Host
    Write-Host ""
    Write-Host "  ${BOLD}═══════════════════════════════════════════════════════${NC}"
    Write-Host "  ${BOLD}  PlumAi - Panel de Desarrollo${NC}"
    Write-Host "  ${BOLD}═══════════════════════════════════════════════════════${NC}"
    Write-Host ""
    Write-Host "    Version: ${CYAN}${Version}${NC}    Plataforma: ${CYAN}${Platform}${NC}"
    Write-Host ""
    Write-Host "  ${MAGENTA}  Desarrollo${NC}"
    Write-Host "    ${CYAN}1)${NC} Instalar dependencias        ${DIM}(npm install + cargo fetch)${NC}"
    Write-Host "    ${CYAN}2)${NC} Dev web                       ${DIM}(Vite dev server en :3000)${NC}"
    Write-Host "    ${CYAN}3)${NC} Dev Tauri                     ${DIM}(app nativa completa)${NC}"
    Write-Host "    ${CYAN}4)${NC} Dev limpio                    ${DIM}(limpiar Rust + dev Tauri)${NC}"
    Write-Host "    ${CYAN}5)${NC} Dev alta velocidad            ${DIM}(backend release + HMR)${NC}"
    Write-Host ""
    Write-Host "  ${MAGENTA}  Producción${NC}"
    Write-Host "    ${CYAN}6)${NC} Build producción              ${DIM}(binario + bundle + zip)${NC}"
    Write-Host ""
    Write-Host "  ${MAGENTA}  Mantenimiento${NC}"
    Write-Host "    ${CYAN}7)${NC} Limpiar todo                  ${DIM}(node_modules + cargo clean)${NC}"
    Write-Host ""
    Write-Host "    ${DIM}0) Salir${NC}"
    Write-Host ""
}

# ═══════════════════════════════════════════════════════════════
#  Main
# ═══════════════════════════════════════════════════════════════

function Invoke-Option {
    param([string]$Option)

    switch ($Option) {
        { $_ -in "install", "1" } { Test-SystemDeps;  Install-Dependencies }
        { $_ -in "web",     "2" } { Start-DevWeb }
        { $_ -in "tauri",   "3" } { Start-DevTauri }
        { $_ -in "clean",   "4" } { Start-DevClean }
        { $_ -in "fast",    "5" } { Start-DevTauri -Release }
        { $_ -in "build",   "6" } { Test-SystemDeps;  Invoke-ProductionBuild }
        { $_ -in "purge",   "7" } { Invoke-CleanAll }
        default { return $false }
    }
    return $true
}

# Modo directo: .\plumai.ps1 <comando>
if ($Command) {
    $result = Invoke-Option $Command
    if (-not $result) {
        Write-Fail "Comando desconocido: $Command"
        Write-Host ""
        Write-Host "  Uso: ${BOLD}.\plumai.ps1${NC} [comando]"
        Write-Host ""
        Write-Host "  Comandos:"
        Write-Host "    install   Instalar dependencias"
        Write-Host "    web       Dev server (Vite)"
        Write-Host "    tauri     Dev Tauri (app nativa)"
        Write-Host "    clean     Dev limpio (cargo clean + dev)"
        Write-Host "    fast      Dev alta velocidad (release)"
        Write-Host "    build     Build de producción"
        Write-Host "    purge     Limpiar todo"
        Write-Host ""
        exit 1
    }
    exit 0
}

# Modo interactivo: bucle de menú
while ($true) {
    Show-Menu
    $choice = Read-Host "  Selecciona una opción [0-7]"
    Write-Host ""

    switch ($choice) {
        "0" {
            Write-Host "  ${DIM}Hasta luego.${NC}"
            Write-Host ""
            exit 0
        }
        { $_ -in "1","2","3","4","5","6","7" } {
            Invoke-Option $choice | Out-Null
            Write-Host ""
            Read-Host "  Presiona Enter para volver al menú..."
        }
        default {
            Write-Warn "Opción inválida."
            Start-Sleep -Seconds 1
        }
    }
}
