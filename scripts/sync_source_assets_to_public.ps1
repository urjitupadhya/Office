$ErrorActionPreference = 'Stop'

$workspace = Split-Path -Parent $PSScriptRoot
$publicRoot = Join-Path $workspace 'public\raw_assets'

function Resolve-ExistingSource {
    param(
        [string[]]$Candidates
    )

    foreach ($candidate in $Candidates) {
        if (Test-Path -LiteralPath $candidate) {
            return $candidate
        }
    }

    return $null
}

function Sync-DirectoryFiles {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Source,

        [Parameter(Mandatory = $true)]
        [string]$Destination,

        [Parameter(Mandatory = $true)]
        [string]$Label
    )

    if (-not (Test-Path -LiteralPath $Source)) {
        Write-Warning "$Label source not found: $Source"
        return 0
    }

    New-Item -ItemType Directory -Force -Path $Destination | Out-Null

    $copied = 0
    foreach ($file in Get-ChildItem -LiteralPath $Source -Recurse -File) {
        $relativePath = $file.FullName.Substring($Source.Length).TrimStart('\')
        $destinationPath = Join-Path $Destination $relativePath
        $destinationDir = Split-Path -Parent $destinationPath

        if ($destinationDir) {
            New-Item -ItemType Directory -Force -Path $destinationDir | Out-Null
        }

        Copy-Item -LiteralPath $file.FullName -Destination $destinationPath -Force
        $copied++
    }

    Write-Host "Synced $copied $Label file(s) from $Source to $Destination"
    return $copied
}

$characterSource = Join-Path $workspace 'assets\source\characters'
$furnitureSource = Resolve-ExistingSource @(
    (Join-Path $workspace 'assets\source\furniture\furniture'),
    (Join-Path $workspace 'assets\source\furniture')
)
$tileSource = Join-Path $workspace 'assets\source\tiles'
$elevatorSource = Join-Path $workspace 'assets\source\elevator'
$hospitalSource = Join-Path $workspace 'assets\source\hospital'

$jobs = @(
    @{
        Label = 'character'
        Source = $characterSource
        Destination = Join-Path $publicRoot 'characters'
    },
    @{
        Label = 'furniture'
        Source = $furnitureSource
        Destination = Join-Path $publicRoot 'furniture'
    },
    @{
        Label = 'tile source'
        Source = $tileSource
        Destination = Join-Path $publicRoot 'tiles\source'
    },
    @{
        Label = 'elevator'
        Source = $elevatorSource
        Destination = Join-Path $publicRoot 'furniture\infrastructure'
    },
    @{
        Label = 'hospital'
        Source = $hospitalSource
        Destination = Join-Path $publicRoot 'hospital'
    }
)

$totalCopied = 0
foreach ($job in $jobs) {
    $totalCopied += Sync-DirectoryFiles -Source $job.Source -Destination $job.Destination -Label $job.Label
}

Write-Host "Asset sync complete. Total files copied: $totalCopied"
