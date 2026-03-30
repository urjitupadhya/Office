Add-Type -AssemblyName System.Drawing

$workspace = Split-Path -Parent $PSScriptRoot
$sourcePath = Join-Path $workspace 'assets\rawgenerated\Untitled design (4).png'
$outputRoot = Join-Path $workspace 'assets\furniture'
$manifestDir = Join-Path $workspace 'assets\source\furniture\sheet_untitled_design_2'
$manifestPath = Join-Path $manifestDir 'manifest.csv'

$sourceSheetSize = 1080
$gridSize = 8
$sourceTileSize = [int]($sourceSheetSize / $gridSize)
$outputTileSize = 64

$mapping = @(
    @(
        @{ Name = 'desk_simple'; Category = 'desks' },
        @{ Name = 'desk_metal'; Category = 'desks' },
        @{ Name = 'table_round'; Category = 'tables' },
        @{ Name = 'desk_small_drawer'; Category = 'desks' },
        @{ Name = 'desk_l_shape'; Category = 'desks' },
        @{ Name = 'desk_compact'; Category = 'desks' },
        @{ Name = 'desk_lamp'; Category = 'utilities' },
        @{ Name = 'desk_workbench'; Category = 'desks' }
    ),
    @(
        @{ Name = 'desk_pc_old'; Category = 'desks' },
        @{ Name = 'desk_pc_basic'; Category = 'desks' },
        @{ Name = 'desk_laptop'; Category = 'desks' },
        @{ Name = 'desk_dual_monitor'; Category = 'desks' },
        @{ Name = 'desk_laptop_small'; Category = 'desks' },
        @{ Name = 'desk_tablet'; Category = 'desks' },
        @{ Name = 'desk_pc_modern'; Category = 'desks' },
        @{ Name = 'desk_empty'; Category = 'desks' }
    ),
    @(
        @{ Name = 'chair_gaming_black'; Category = 'chairs' },
        @{ Name = 'chair_boss_brown'; Category = 'chairs' },
        @{ Name = 'chair_office_basic'; Category = 'chairs' },
        @{ Name = 'chair_mesh'; Category = 'chairs' },
        @{ Name = 'chair_simple'; Category = 'chairs' },
        @{ Name = 'stool'; Category = 'chairs' },
        @{ Name = 'chair_wood'; Category = 'chairs' },
        @{ Name = 'chair_lounge'; Category = 'chairs' }
    ),
    @(
        @{ Name = 'desk_corner_l'; Category = 'desks' },
        @{ Name = 'desk_reception_small'; Category = 'infrastructure' },
        @{ Name = 'meeting_table_large'; Category = 'tables' },
        @{ Name = 'meeting_table_small'; Category = 'tables' },
        @{ Name = 'carpet_rect'; Category = 'utilities' },
        @{ Name = 'reception_curved'; Category = 'infrastructure' },
        @{ Name = 'cabinet_storage'; Category = 'utilities' },
        @{ Name = 'printer_large'; Category = 'utilities' }
    ),
    @(
        @{ Name = 'desk_single_monitor'; Category = 'desks' },
        @{ Name = 'desk_laptop_clean'; Category = 'desks' },
        @{ Name = 'empty'; Category = $null },
        @{ Name = 'empty'; Category = $null },
        @{ Name = 'empty'; Category = $null },
        @{ Name = 'empty'; Category = $null },
        @{ Name = 'empty'; Category = $null },
        @{ Name = 'empty'; Category = $null }
    ),
    @(
        @{ Name = 'plant_small'; Category = 'plants' },
        @{ Name = 'plant_round'; Category = 'plants' },
        @{ Name = 'plant_medium'; Category = 'plants' },
        @{ Name = 'plant_hanging'; Category = 'plants' },
        @{ Name = 'plant_bowl'; Category = 'plants' },
        @{ Name = 'plant_box'; Category = 'plants' },
        @{ Name = 'plant_palm'; Category = 'plants' },
        @{ Name = 'plant_wall'; Category = 'plants' }
    ),
    @(
        @{ Name = 'reception_main'; Category = 'infrastructure' },
        @{ Name = 'water_dispenser'; Category = 'utilities' },
        @{ Name = 'vending_machine'; Category = 'utilities' },
        @{ Name = 'snack_machine'; Category = 'utilities' },
        @{ Name = 'coffee_machine'; Category = 'utilities' },
        @{ Name = 'info_kiosk'; Category = 'utilities' },
        @{ Name = 'sofa_waiting'; Category = 'chairs' },
        @{ Name = 'empty'; Category = $null }
    ),
    @(
        @{ Name = 'elevator_closed'; Category = 'infrastructure' },
        @{ Name = 'elevator_open'; Category = 'infrastructure' },
        @{ Name = 'glass_door'; Category = 'infrastructure' },
        @{ Name = 'scanner_gate'; Category = 'infrastructure' },
        @{ Name = 'wall_clock'; Category = 'utilities' },
        @{ Name = 'whiteboard'; Category = 'utilities' },
        @{ Name = 'trash_bin'; Category = 'utilities' },
        @{ Name = 'floor_mat'; Category = 'utilities' }
    )
)

if (-not (Test-Path -LiteralPath $sourcePath)) {
    throw "Source image not found: $sourcePath"
}

if ($mapping.Count -ne $gridSize) {
    throw "Expected $gridSize mapping rows, found $($mapping.Count)"
}

$seenNames = New-Object 'System.Collections.Generic.HashSet[string]'
foreach ($row in $mapping) {
    if ($row.Count -ne $gridSize) {
        throw "Each mapping row must contain $gridSize entries"
    }

    foreach ($entry in $row) {
        if ($entry.Name -eq 'empty') {
            continue
        }

        if ($entry.Name -notmatch '^[a-z0-9]+(?:_[a-z0-9]+)*$') {
            throw "Invalid asset name '$($entry.Name)'. Use snake_case only."
        }

        if (-not $seenNames.Add($entry.Name)) {
            throw "Duplicate asset name detected: $($entry.Name)"
        }
    }
}

New-Item -ItemType Directory -Force -Path $outputRoot, $manifestDir | Out-Null
foreach ($category in @('desks', 'chairs', 'tables', 'plants', 'utilities', 'infrastructure')) {
    New-Item -ItemType Directory -Force -Path (Join-Path $outputRoot $category) | Out-Null
}

$bitmap = [System.Drawing.Bitmap]::FromFile($sourcePath)
if ($bitmap.Width -ne $sourceSheetSize -or $bitmap.Height -ne $sourceSheetSize) {
    $bitmap.Dispose()
    throw "Expected a ${sourceSheetSize}x${sourceSheetSize} sheet, got $($bitmap.Width)x$($bitmap.Height)"
}

$manifestRows = New-Object System.Collections.Generic.List[object]

try {
    for ($row = 0; $row -lt $gridSize; $row++) {
        for ($col = 0; $col -lt $gridSize; $col++) {
            $entry = $mapping[$row][$col]
            $sourceX = $col * $sourceTileSize
            $sourceY = $row * $sourceTileSize
            $nonTransparentPixels = 0

            for ($y = $sourceY; $y -lt ($sourceY + $sourceTileSize); $y++) {
                for ($x = $sourceX; $x -lt ($sourceX + $sourceTileSize); $x++) {
                    if ($bitmap.GetPixel($x, $y).A -gt 10) {
                        $nonTransparentPixels++
                    }
                }
            }

            $status = 'saved'
            $outputRelativePath = $null

            if ($entry.Name -eq 'empty' -or $nonTransparentPixels -eq 0) {
                $status = 'skipped'
            } else {
                $outputPath = Join-Path (Join-Path $outputRoot $entry.Category) "$($entry.Name).png"
                $tile = New-Object System.Drawing.Bitmap $outputTileSize, $outputTileSize, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
                $graphics = [System.Drawing.Graphics]::FromImage($tile)

                try {
                    # Preserve crisp sprite edges while resizing the AI source tile.
                    $graphics.Clear([System.Drawing.Color]::Transparent)
                    $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
                    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighSpeed
                    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
                    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
                    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::None
                    $graphics.DrawImage(
                        $bitmap,
                        (New-Object System.Drawing.Rectangle 0, 0, $outputTileSize, $outputTileSize),
                        (New-Object System.Drawing.Rectangle $sourceX, $sourceY, $sourceTileSize, $sourceTileSize),
                        [System.Drawing.GraphicsUnit]::Pixel
                    )
                    $tile.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
                    $outputRelativePath = "assets/furniture/$($entry.Category)/$($entry.Name).png"
                } finally {
                    $graphics.Dispose()
                    $tile.Dispose()
                }
            }

            $manifestRows.Add([PSCustomObject]@{
                row = $row + 1
                col = $col + 1
                source_name = $entry.Name
                category = $entry.Category
                output_size = "${outputTileSize}x${outputTileSize}"
                non_transparent_pixels = $nonTransparentPixels
                status = $status
                output_path = $outputRelativePath
            }) | Out-Null
        }
    }
} finally {
    $bitmap.Dispose()
}

$manifestRows | Export-Csv -Path $manifestPath -NoTypeInformation

$savedCount = ($manifestRows | Where-Object { $_.status -eq 'saved' }).Count
$skippedCount = ($manifestRows | Where-Object { $_.status -eq 'skipped' }).Count
Write-Host "Saved $savedCount furniture sprites and skipped $skippedCount empty tiles."
Write-Host "Manifest written to $manifestPath"
