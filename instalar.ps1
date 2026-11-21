# Instala en esta laptop las skills y mods guardados en este repo.
# Uso (en PowerShell, dentro de la carpeta del repo):
#   powershell -ExecutionPolicy Bypass -File .\instalar.ps1

$ErrorActionPreference = 'Stop'
$repo = $PSScriptRoot

# 1. Node.js (lo necesita la skill find-skills para buscar e instalar skills)
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host 'Instalando Node.js LTS...'
    winget install --id OpenJS.NodeJS.LTS -e --accept-source-agreements --accept-package-agreements --silent
}

# 2. Skills -> ~/.claude/skills
$destino = Join-Path $env:USERPROFILE '.claude\skills'
New-Item -ItemType Directory -Force $destino | Out-Null
Get-ChildItem (Join-Path $repo 'skills') -Directory | ForEach-Object {
    Copy-Item $_.FullName $destino -Recurse -Force
    Write-Host "Skill instalada: $($_.Name)"
}

# 3. Mods (plugins) -> se instalan con la CLI de Claude Code
$claude = Get-Command claude -ErrorAction SilentlyContinue
if ($claude) {
    & claude plugin marketplace add $repo
    foreach ($mod in 'portero', 'vigilante', 'panel-agentes') {
        & claude plugin install "$mod@mis-mods"
    }
} else {
    Write-Host ''
    Write-Host 'No encontre el comando "claude" en esta laptop.'
    Write-Host 'Para los mods: en la app de Claude, pulsa + junto al cuadro de mensaje > Plugins >'
    Write-Host "Add marketplace con la ruta $repo, y despues Add plugin para portero, vigilante y panel-agentes."
}

Write-Host ''
Write-Host 'Listo. Reinicia Claude para que cargue todo.'
