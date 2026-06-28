$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$composeFile = Join-Path $repoRoot "backend\docker-compose.yml"

docker compose -f $composeFile down
