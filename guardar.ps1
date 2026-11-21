# Guarda en el repo las skills nuevas que instalaste en esta laptop y las sube a GitHub.
# Uso: powershell -ExecutionPolicy Bypass -File .\guardar.ps1

$ErrorActionPreference = 'Stop'
$repo = $PSScriptRoot
$origen = Join-Path $env:USERPROFILE '.claude\skills'

if (Test-Path $origen) {
    Get-ChildItem $origen -Directory | ForEach-Object {
        Copy-Item $_.FullName (Join-Path $repo 'skills') -Recurse -Force
    }
}

git -C $repo pull --rebase
git -C $repo add -A
git -C $repo commit -m "Actualizar skills $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
git -C $repo push
