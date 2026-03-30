Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = 'Stop'

$workspace = Split-Path -Parent $PSScriptRoot
$sourcePath = Join-Path $workspace 'assets\rawgenerated\Untitled design (5).png'
$manifestPath = Join-Path $workspace 'assets\source\furniture\sheet_untitled_design_2\manifest.csv'
$sourceSheetSize = 1080
$gridSize = 8
$sourceTileSize = [int]($sourceSheetSize / $gridSize)
$outputTileSize = 64

$targets = @(
    @{ SourceRow = 1; ManifestRow = 2; Col = 0; Name = 'desk_pc_old_back';       Category = 'desks'  },
    @{ SourceRow = 1; ManifestRow = 2; Col = 1; Name = 'desk_pc_basic_back';     Category = 'desks'  },
    @{ SourceRow = 1; ManifestRow = 2; Col = 2; Name = 'desk_laptop_back';       Category = 'desks'  },
    @{ SourceRow = 1; ManifestRow = 2; Col = 3; Name = 'desk_dual_monitor_back'; Category = 'desks'  },
    @{ SourceRow = 1; ManifestRow = 2; Col = 4; Name = 'desk_laptop_small_back'; Category = 'desks'  },
    @{ SourceRow = 1; ManifestRow = 2; Col = 5; Name = 'desk_tablet_back';       Category = 'desks'  },
    @{ SourceRow = 1; ManifestRow = 2; Col = 6; Name = 'desk_pc_modern_back';    Category = 'desks'  },
    @{ SourceRow = 1; ManifestRow = 2; Col = 7; Name = 'desk_empty_back';        Category = 'desks'  },
    @{ SourceRow = 2; ManifestRow = 3; Col = 0; Name = 'chair_gaming_black_back'; Category = 'chairs' },
    @{ SourceRow = 2; ManifestRow = 3; Col = 1; Name = 'chair_boss_brown_back';   Category = 'chairs' },
    @{ SourceRow = 2; ManifestRow = 3; Col = 2; Name = 'chair_office_basic_back'; Category = 'chairs' },
    @{ SourceRow = 2; ManifestRow = 3; Col = 3; Name = 'chair_mesh_back';         Category = 'chairs' },
    @{ SourceRow = 2; ManifestRow = 3; Col = 4; Name = 'chair_simple_back';       Category = 'chairs' },
    @{ SourceRow = 2; ManifestRow = 3; Col = 5; Name = 'stool_back';              Category = 'chairs' },
    @{ SourceRow = 2; ManifestRow = 3; Col = 6; Name = 'chair_wood_back';         Category = 'chairs' },
    @{ SourceRow = 2; ManifestRow = 3; Col = 7; Name = 'chair_lounge_back';       Category = 'chairs' }
)

function New-ScaledTile {
    param(
        [System.Drawing.Bitmap] $Sheet,
        [int] $SourceX,
        [int] $SourceY,
        [int] $SourceSize,
        [int] $OutputSize
    )

    $tile = New-Object System.Drawing.Bitmap $OutputSize, $OutputSize, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($tile)

    try {
        $graphics.Clear([System.Drawing.Color]::Transparent)
        $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighSpeed
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::None
        $graphics.DrawImage(
            $Sheet,
            (New-Object System.Drawing.Rectangle 0, 0, $OutputSize, $OutputSize),
            (New-Object System.Drawing.Rectangle $SourceX, $SourceY, $SourceSize, $SourceSize),
            [System.Drawing.GraphicsUnit]::Pixel
        )
    } finally {
        $graphics.Dispose()
    }

    return $tile
}

function Get-ImageHash {
    param(
        [System.Drawing.Bitmap] $Bitmap
    )

    $stream = New-Object System.IO.MemoryStream
    try {
        $Bitmap.Save($stream, [System.Drawing.Imaging.ImageFormat]::Png)
        $stream.Position = 0
        $hashBytes = [System.Security.Cryptography.SHA256]::Create().ComputeHash($stream)
        return ([System.BitConverter]::ToString($hashBytes)).Replace('-', '').ToLowerInvariant()
    } finally {
        $stream.Dispose()
    }
}

function Get-NonTransparentPixelCount {
    param(
        [System.Drawing.Bitmap] $Bitmap
    )

    $count = 0
    for ($y = 0; $y -lt $Bitmap.Height; $y++) {
        for ($x = 0; $x -lt $Bitmap.Width; $x++) {
            if ($Bitmap.GetPixel($x, $y).A -gt 10) {
                $count++
            }
        }
    }

    return $count
}

if (-not (Test-Path -LiteralPath $sourcePath)) {
    throw "Source image not found: $sourcePath"
}

$existingManifestRows = @()
if (Test-Path -LiteralPath $manifestPath) {
    $existingManifestRows = @(Import-Csv -Path $manifestPath)
}

$existingNames = New-Object 'System.Collections.Generic.HashSet[string]'
foreach ($row in $existingManifestRows) {
    if (-not [string]::IsNullOrWhiteSpace($row.source_name)) {
        $existingNames.Add($row.source_name) | Out-Null
    }
}

$existingHashesByCategory = @{
    desks = New-Object 'System.Collections.Generic.HashSet[string]'
    chairs = New-Object 'System.Collections.Generic.HashSet[string]'
}

foreach ($category in $existingHashesByCategory.Keys) {
    $categoryDir = Join-Path (Join-Path $workspace 'assets\furniture') $category
    if (-not (Test-Path -LiteralPath $categoryDir)) {
        continue
    }

    foreach ($file in Get-ChildItem -LiteralPath $categoryDir -Filter *.png) {
        $bitmap = [System.Drawing.Bitmap]::FromFile($file.FullName)
        try {
            $existingHashesByCategory[$category].Add((Get-ImageHash -Bitmap $bitmap)) | Out-Null
        } finally {
            $bitmap.Dispose()
        }
    }
}

$sheet = [System.Drawing.Bitmap]::FromFile($sourcePath)
if ($sheet.Width -ne $sourceSheetSize -or $sheet.Height -ne $sourceSheetSize) {
    $sheet.Dispose()
    throw "Expected a ${sourceSheetSize}x${sourceSheetSize} sheet, got $($sheet.Width)x$($sheet.Height)"
}

$newManifestRows = New-Object System.Collections.Generic.List[object]
$savedCount = 0
$skippedCount = 0

try {
    foreach ($target in $targets) {
        if ($existingNames.Contains($target.Name)) {
            $skippedCount++
            continue
        }

        $outputPath = Join-Path (Join-Path $workspace "assets\furniture\$($target.Category)") "$($target.Name).png"
        $sourceX = $target.Col * $sourceTileSize
        $sourceY = $target.SourceRow * $sourceTileSize
        $tile = New-ScaledTile -Sheet $sheet -SourceX $sourceX -SourceY $sourceY -SourceSize $sourceTileSize -OutputSize $outputTileSize

        try {
            $hash = Get-ImageHash -Bitmap $tile
            $fileAlreadyExists = Test-Path -LiteralPath $outputPath
            if ($existingHashesByCategory[$target.Category].Contains($hash) -and -not $fileAlreadyExists) {
                $skippedCount++
                continue
            }

            $nonTransparentPixels = Get-NonTransparentPixelCount -Bitmap $tile
            if ($nonTransparentPixels -eq 0) {
                $skippedCount++
                continue
            }

            if (-not $fileAlreadyExists) {
                $tile.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
            }

            $existingHashesByCategory[$target.Category].Add($hash) | Out-Null
            $existingNames.Add($target.Name) | Out-Null

            $newManifestRows.Add([PSCustomObject]@{
                row = $target.ManifestRow
                col = $target.Col + 1
                source_name = $target.Name
                category = $target.Category
                output_size = "${outputTileSize}x${outputTileSize}"
                non_transparent_pixels = $nonTransparentPixels
                status = 'saved'
                output_path = "assets/furniture/$($target.Category)/$($target.Name).png"
            }) | Out-Null

            $savedCount++
        } finally {
            $tile.Dispose()
        }
    }
} finally {
    $sheet.Dispose()
}

if ($newManifestRows.Count -gt 0) {
    $combinedRows = New-Object System.Collections.Generic.List[object]
    foreach ($row in $existingManifestRows) {
        $combinedRows.Add($row) | Out-Null
    }
    foreach ($row in $newManifestRows) {
        $combinedRows.Add($row) | Out-Null
    }
    $combinedRows | Export-Csv -Path $manifestPath -NoTypeInformation
}

Write-Host "Saved $savedCount new back-view furniture sprites."
Write-Host "Skipped $skippedCount duplicates or already-present assets."
Write-Host "Manifest updated at $manifestPath"
