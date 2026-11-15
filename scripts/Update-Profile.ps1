[CmdletBinding()]
param(
    [switch]$CheckLinks,
    [switch]$CheckOnly,
    [string]$PythonExe = ""
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot

function Resolve-PythonExecutable {
    param([string]$Preferred)

    if ($Preferred -and (Test-Path $Preferred)) {
        return $Preferred
    }

    $candidates = @()
    $cmd = Get-Command python -ErrorAction SilentlyContinue
    if ($cmd -and $cmd.Source -and ($cmd.Source -notlike "*\WindowsApps\python.exe")) {
        $candidates += $cmd.Source
    }
    $pyLauncher = Get-Command py -ErrorAction SilentlyContinue
    if ($pyLauncher) {
        $candidates += $pyLauncher.Source
    }

    $scratchPy = "C:\Users\$env:USERNAME\.gemini\antigravity\brain\8a6c8ab3-96c8-450c-b02b-fe81a78a1fdc\scratch\python\python.exe"
    if (Test-Path $scratchPy) {
        $candidates += $scratchPy
    }

    foreach ($candidate in $candidates) {
        try {
            $ver = & $candidate --version 2>&1
            if ($LASTEXITCODE -eq 0 -and $ver -match "Python 3") {
                return $candidate
            }
        } catch {
            continue
        }
    }

    throw "No working Python 3 runtime found. Install Python 3.10+ or pass -PythonExe <path>."
}

$py = Resolve-PythonExecutable -Preferred $PythonExe
Write-Host "Using Python: $py" -ForegroundColor Cyan

Push-Location $RepoRoot
try {
    if ($CheckOnly) {
        & $py "scripts/validate_data.py" --check-assets
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
        & $py "scripts/generate_readme.py" --check
        exit $LASTEXITCODE
    }

    & $py "scripts/sync_profile.py"
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    & $py "scripts/generate_readme.py"
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    if ($CheckLinks) {
        & $py "scripts/validate_data.py" --check-assets --check-links
    } else {
        & $py "scripts/validate_data.py" --check-assets
    }
    exit $LASTEXITCODE
} finally {
    Pop-Location
}
