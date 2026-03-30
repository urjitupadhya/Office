Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = 'Stop'

$workspace = Split-Path -Parent $PSScriptRoot
$sourcePath = Join-Path $workspace 'assets\rawgenerated\Gemini_Generated_Image_7b0v4k7b0v4k7b0v - Copy.png'
$tilesetPath = Join-Path $workspace 'assets\sprites\tileset.png'
$outputRoot = Join-Path $workspace 'assets\tiles'
$manifestDir = Join-Path $workspace 'assets\source\tiles\sheet_gemini_generated_image_7b0v4k7b0v4k7b0v_copy'
$manifestPath = Join-Path $manifestDir 'manifest.csv'
$blockOutputDir = Join-Path $manifestDir 'blocks'

$sourceSheetSize = 2048
$outputTileSize = 64
$scoringTileSize = 32
$atlasTileSize = 32

# The Gemini sheet is arranged as 10x10 large blocks separated by dark guide lines.
# These ranges were measured from the actual image so each crop stays inside its own block.
$columnLineRanges = @(
    @{ Start = 0;    End = 3 },
    @{ Start = 203;  End = 206 },
    @{ Start = 408;  End = 411 },
    @{ Start = 612;  End = 615 },
    @{ Start = 818;  End = 821 },
    @{ Start = 1022; End = 1025 },
    @{ Start = 1227; End = 1229 },
    @{ Start = 1432; End = 1439 },
    @{ Start = 1639; End = 1645 },
    @{ Start = 1844; End = 1849 },
    @{ Start = 2044; End = 2046 }
)

$rowLineRanges = @(
    @{ Start = 0;    End = 2 },
    @{ Start = 203;  End = 206 },
    @{ Start = 408;  End = 411 },
    @{ Start = 612;  End = 615 },
    @{ Start = 818;  End = 821 },
    @{ Start = 1022; End = 1029 },
    @{ Start = 1224; End = 1234 },
    @{ Start = 1429; End = 1434 },
    @{ Start = 1633; End = 1644 },
    @{ Start = 1838; End = 1849 },
    @{ Start = 2044; End = 2047 }
)

function New-NearestNeighborBitmap {
    param(
        [System.Drawing.Bitmap]$Bitmap,
        [int]$Width,
        [int]$Height
    )

    $resized = New-Object System.Drawing.Bitmap $Width, $Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($resized)

    try {
        $graphics.Clear([System.Drawing.Color]::Transparent)
        $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighSpeed
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::None
        $graphics.DrawImage(
            $Bitmap,
            (New-Object System.Drawing.Rectangle 0, 0, $Width, $Height),
            (New-Object System.Drawing.Rectangle 0, 0, $Bitmap.Width, $Bitmap.Height),
            [System.Drawing.GraphicsUnit]::Pixel
        )
    } finally {
        $graphics.Dispose()
    }

    return $resized
}

function Get-BitmapBytes {
    param(
        [System.Drawing.Bitmap]$Bitmap
    )

    $rect = New-Object System.Drawing.Rectangle 0, 0, $Bitmap.Width, $Bitmap.Height
    $data = $Bitmap.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

    try {
        $buffer = New-Object byte[] ($data.Stride * $Bitmap.Height)
        [Runtime.InteropServices.Marshal]::Copy($data.Scan0, $buffer, 0, $buffer.Length)
        return @{
            Bytes = $buffer
            Stride = $data.Stride
        }
    } finally {
        $Bitmap.UnlockBits($data)
    }
}

function Convert-ToGrayscaleBytes {
    param(
        [byte[]]$Bytes,
        [int]$Stride,
        [int]$Width,
        [int]$Height
    )

    $gray = New-Object byte[] ($Width * $Height)
    for ($y = 0; $y -lt $Height; $y++) {
        for ($x = 0; $x -lt $Width; $x++) {
            $offset = ($y * $Stride) + ($x * 4)
            $b = $Bytes[$offset]
            $g = $Bytes[$offset + 1]
            $r = $Bytes[$offset + 2]
            $a = $Bytes[$offset + 3]
            if ($a -eq 0) {
                $gray[($y * $Width) + $x] = 0
                continue
            }

            $gray[($y * $Width) + $x] = [byte][Math]::Round(($r * 0.299) + ($g * 0.587) + ($b * 0.114))
        }
    }

    return $gray
}

function Get-AtlasTileBitmap {
    param(
        [System.Drawing.Bitmap]$Atlas,
        [int]$Row,
        [int]$Col,
        [int]$TileSize
    )

    $rect = New-Object System.Drawing.Rectangle ($Col * $TileSize), ($Row * $TileSize), $TileSize, $TileSize
    return $Atlas.Clone($rect, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
}

function Get-Score {
    param(
        [byte[]]$Candidate,
        [byte[]]$Template
    )

    $score = 0
    for ($i = 0; $i -lt $Candidate.Length; $i++) {
        $delta = [int]$Candidate[$i] - [int]$Template[$i]
        if ($delta -lt 0) {
            $delta = -$delta
        }
        $score += $delta
    }

    return $score
}

function Get-BlockRects {
    param(
        [object[]]$HorizontalLines,
        [object[]]$VerticalLines
    )

    $rects = New-Object System.Collections.Generic.List[object]
    for ($row = 0; $row -lt ($HorizontalLines.Count - 1); $row++) {
        for ($col = 0; $col -lt ($VerticalLines.Count - 1); $col++) {
            $x = $VerticalLines[$col].End + 1
            $y = $HorizontalLines[$row].End + 1
            $width = $VerticalLines[$col + 1].Start - $x
            $height = $HorizontalLines[$row + 1].Start - $y

            if ($width -lt 150 -or $height -lt 150) {
                throw "Suspicious block size at r${row} c${col}: ${width}x${height}"
            }

            $rects.Add([PSCustomObject]@{
                Row = $row
                Col = $col
                X = $x
                Y = $y
                Width = $width
                Height = $height
            }) | Out-Null
        }
    }

    return $rects
}

if (-not (Test-Path -LiteralPath $sourcePath)) {
    throw "Source tileset not found: $sourcePath"
}

if (-not (Test-Path -LiteralPath $tilesetPath)) {
    throw "Reference tileset not found: $tilesetPath"
}

New-Item -ItemType Directory -Force -Path $outputRoot, $manifestDir, $blockOutputDir | Out-Null
foreach ($category in @('floor', 'walls', 'corners', 'corridors', 'doors', 'special')) {
    New-Item -ItemType Directory -Force -Path (Join-Path $outputRoot $category) | Out-Null
}

$templateAtlas = [System.Drawing.Bitmap]::FromFile($tilesetPath)
$sourceBitmap = [System.Drawing.Bitmap]::FromFile($sourcePath)

if ($sourceBitmap.Width -ne $sourceSheetSize -or $sourceBitmap.Height -ne $sourceSheetSize) {
    $templateAtlas.Dispose()
    $sourceBitmap.Dispose()
    throw "Expected a ${sourceSheetSize}x${sourceSheetSize} tileset, got $($sourceBitmap.Width)x$($sourceBitmap.Height)"
}

$templateBitmaps = @{
    floor_light = Get-AtlasTileBitmap -Atlas $templateAtlas -Row 0 -Col 1 -TileSize $atlasTileSize
    floor_dark = Get-AtlasTileBitmap -Atlas $templateAtlas -Row 5 -Col 4 -TileSize $atlasTileSize
    floor_dark_variant = Get-AtlasTileBitmap -Atlas $templateAtlas -Row 5 -Col 5 -TileSize $atlasTileSize
    floor_corridor = Get-AtlasTileBitmap -Atlas $templateAtlas -Row 1 -Col 3 -TileSize $atlasTileSize
    wall_horizontal = Get-AtlasTileBitmap -Atlas $templateAtlas -Row 0 -Col 2 -TileSize $atlasTileSize
    wall_vertical = Get-AtlasTileBitmap -Atlas $templateAtlas -Row 0 -Col 3 -TileSize $atlasTileSize
    wall_panel_horizontal = Get-AtlasTileBitmap -Atlas $templateAtlas -Row 5 -Col 6 -TileSize $atlasTileSize
    wall_panel_vertical = Get-AtlasTileBitmap -Atlas $templateAtlas -Row 5 -Col 7 -TileSize $atlasTileSize
    wall_corner_nw = Get-AtlasTileBitmap -Atlas $templateAtlas -Row 0 -Col 4 -TileSize $atlasTileSize
    wall_corner_ne = Get-AtlasTileBitmap -Atlas $templateAtlas -Row 0 -Col 5 -TileSize $atlasTileSize
    wall_corner_sw = Get-AtlasTileBitmap -Atlas $templateAtlas -Row 0 -Col 6 -TileSize $atlasTileSize
    wall_corner_se = Get-AtlasTileBitmap -Atlas $templateAtlas -Row 0 -Col 7 -TileSize $atlasTileSize
    corridor_t_junction = Get-AtlasTileBitmap -Atlas $templateAtlas -Row 5 -Col 2 -TileSize $atlasTileSize
    corridor_cross = Get-AtlasTileBitmap -Atlas $templateAtlas -Row 5 -Col 3 -TileSize $atlasTileSize
    door_frame = Get-AtlasTileBitmap -Atlas $templateAtlas -Row 1 -Col 1 -TileSize $atlasTileSize
    door_open = Get-AtlasTileBitmap -Atlas $templateAtlas -Row 4 -Col 3 -TileSize $atlasTileSize
    door_closed = Get-AtlasTileBitmap -Atlas $templateAtlas -Row 1 -Col 0 -TileSize $atlasTileSize
    elevator_floor = Get-AtlasTileBitmap -Atlas $templateAtlas -Row 1 -Col 4 -TileSize $atlasTileSize
    boundary_tile = Get-AtlasTileBitmap -Atlas $templateAtlas -Row 1 -Col 5 -TileSize $atlasTileSize
    glow_tile = Get-AtlasTileBitmap -Atlas $templateAtlas -Row 1 -Col 6 -TileSize $atlasTileSize
}

$corridorVerticalBitmap = [System.Drawing.Bitmap]$templateBitmaps.floor_corridor.Clone()
$corridorVerticalBitmap.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipNone)
$templateBitmaps.corridor_straight_vertical = $corridorVerticalBitmap
$templateBitmaps.corridor_straight_horizontal = [System.Drawing.Bitmap]$templateBitmaps.floor_corridor.Clone()
$templateBitmaps.floor_light_variant = [System.Drawing.Bitmap]$templateBitmaps.floor_light.Clone()
$templateBitmaps.floor_speckled = [System.Drawing.Bitmap]$templateBitmaps.floor_light.Clone()
$templateBitmaps.elevator_door = [System.Drawing.Bitmap]$templateBitmaps.door_frame.Clone()

$templateGray = @{}
foreach ($templateName in $templateBitmaps.Keys) {
    $templateBytes = Get-BitmapBytes -Bitmap $templateBitmaps[$templateName]
    $templateGray[$templateName] = Convert-ToGrayscaleBytes -Bytes $templateBytes.Bytes -Stride $templateBytes.Stride -Width $atlasTileSize -Height $atlasTileSize
}

$blockRects = Get-BlockRects -HorizontalLines $rowLineRanges -VerticalLines $columnLineRanges
$blockManifestRows = New-Object System.Collections.Generic.List[object]
$candidateCache = @{}

$targets = @(
    @{ Name = 'glow_tile'; Category = 'special'; Template = 'glow_tile'; RowMin = 9; RowMax = 9; ColMin = 9; ColMax = 9 },
    @{ Name = 'boundary_tile'; Category = 'special'; Template = 'boundary_tile'; RowMin = 8; RowMax = 9; ColMin = 0; ColMax = 4 },
    @{ Name = 'elevator_door'; Category = 'special'; Template = 'elevator_door'; RowMin = 8; RowMax = 9; ColMin = 8; ColMax = 9 },
    @{ Name = 'elevator_floor'; Category = 'special'; Template = 'elevator_floor'; RowMin = 5; RowMax = 8; ColMin = 5; ColMax = 7 },
    @{ Name = 'door_frame'; Category = 'doors'; Template = 'door_frame'; RowMin = 0; RowMax = 4; ColMin = 8; ColMax = 9 },
    @{ Name = 'door_closed'; Category = 'doors'; Template = 'door_closed'; RowMin = 0; RowMax = 4; ColMin = 8; ColMax = 9 },
    @{ Name = 'door_open'; Category = 'doors'; Template = 'door_open'; RowMin = 0; RowMax = 4; ColMin = 7; ColMax = 9 },
    @{ Name = 'wall_corner_nw'; Category = 'corners'; Template = 'wall_corner_nw'; RowMin = 0; RowMax = 4; ColMin = 5; ColMax = 9 },
    @{ Name = 'wall_corner_ne'; Category = 'corners'; Template = 'wall_corner_ne'; RowMin = 0; RowMax = 4; ColMin = 5; ColMax = 9 },
    @{ Name = 'wall_corner_sw'; Category = 'corners'; Template = 'wall_corner_sw'; RowMin = 0; RowMax = 4; ColMin = 5; ColMax = 9 },
    @{ Name = 'wall_corner_se'; Category = 'corners'; Template = 'wall_corner_se'; RowMin = 0; RowMax = 4; ColMin = 5; ColMax = 9 },
    @{ Name = 'wall_horizontal'; Category = 'walls'; Template = 'wall_horizontal'; RowMin = 0; RowMax = 4; ColMin = 5; ColMax = 6 },
    @{ Name = 'wall_vertical'; Category = 'walls'; Template = 'wall_vertical'; RowMin = 0; RowMax = 4; ColMin = 7; ColMax = 8 },
    @{ Name = 'wall_panel_horizontal'; Category = 'walls'; Template = 'wall_panel_horizontal'; RowMin = 1; RowMax = 4; ColMin = 5; ColMax = 6 },
    @{ Name = 'wall_panel_vertical'; Category = 'walls'; Template = 'wall_panel_vertical'; RowMin = 1; RowMax = 4; ColMin = 8; ColMax = 9 },
    @{ Name = 'corridor_cross'; Category = 'corridors'; Template = 'corridor_cross'; RowMin = 5; RowMax = 7; ColMin = 5; ColMax = 7 },
    @{ Name = 'corridor_t_junction'; Category = 'corridors'; Template = 'corridor_t_junction'; RowMin = 5; RowMax = 7; ColMin = 5; ColMax = 7 },
    @{ Name = 'corridor_straight_horizontal'; Category = 'corridors'; Template = 'corridor_straight_horizontal'; RowMin = 5; RowMax = 8; ColMin = 5; ColMax = 6 },
    @{ Name = 'corridor_straight_vertical'; Category = 'corridors'; Template = 'corridor_straight_vertical'; RowMin = 5; RowMax = 8; ColMin = 6; ColMax = 8 },
    @{ Name = 'floor_light'; Category = 'floor'; Template = 'floor_light'; RowMin = 0; RowMax = 4; ColMin = 0; ColMax = 1 },
    @{ Name = 'floor_light_variant'; Category = 'floor'; Template = 'floor_light_variant'; RowMin = 0; RowMax = 4; ColMin = 1; ColMax = 3 },
    @{ Name = 'floor_speckled'; Category = 'floor'; Template = 'floor_speckled'; RowMin = 0; RowMax = 4; ColMin = 3; ColMax = 4 },
    @{ Name = 'floor_dark'; Category = 'floor'; Template = 'floor_dark'; RowMin = 5; RowMax = 9; ColMin = 0; ColMax = 2 },
    @{ Name = 'floor_dark_variant'; Category = 'floor'; Template = 'floor_dark_variant'; RowMin = 5; RowMax = 9; ColMin = 1; ColMax = 4 },
    @{ Name = 'floor_corridor'; Category = 'floor'; Template = 'floor_corridor'; RowMin = 5; RowMax = 8; ColMin = 5; ColMax = 7 }
)

try {
    foreach ($rectInfo in $blockRects) {
        $rect = New-Object System.Drawing.Rectangle $rectInfo.X, $rectInfo.Y, $rectInfo.Width, $rectInfo.Height
        $crop = $sourceBitmap.Clone($rect, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
        $blockBitmap = New-NearestNeighborBitmap -Bitmap $crop -Width $outputTileSize -Height $outputTileSize
        $scoringBitmap = New-NearestNeighborBitmap -Bitmap $crop -Width $scoringTileSize -Height $scoringTileSize
        $bytesInfo = Get-BitmapBytes -Bitmap $scoringBitmap
        $gray = Convert-ToGrayscaleBytes -Bytes $bytesInfo.Bytes -Stride $bytesInfo.Stride -Width $scoringTileSize -Height $scoringTileSize
        $blockPath = Join-Path $blockOutputDir ("block_r{0:00}_c{1:00}.png" -f $rectInfo.Row, $rectInfo.Col)
        $blockBitmap.Save($blockPath, [System.Drawing.Imaging.ImageFormat]::Png)

        $key = "{0},{1}" -f $rectInfo.Row, $rectInfo.Col
        $candidateCache[$key] = [PSCustomObject]@{
            Row = $rectInfo.Row
            Col = $rectInfo.Col
            Bitmap = $blockBitmap
            Gray = $gray
            SourceX = $rectInfo.X
            SourceY = $rectInfo.Y
            SourceWidth = $rectInfo.Width
            SourceHeight = $rectInfo.Height
            BlockPath = "assets/source/tiles/sheet_gemini_generated_image_7b0v4k7b0v4k7b0v_copy/blocks/$(Split-Path -Leaf $blockPath)"
        }

        $blockManifestRows.Add([PSCustomObject]@{
            block_name = ("block_r{0:00}_c{1:00}" -f $rectInfo.Row, $rectInfo.Col)
            row = $rectInfo.Row
            col = $rectInfo.Col
            source_x = $rectInfo.X
            source_y = $rectInfo.Y
            source_width = $rectInfo.Width
            source_height = $rectInfo.Height
            output_size = "${outputTileSize}x${outputTileSize}"
            output_path = "assets/source/tiles/sheet_gemini_generated_image_7b0v4k7b0v4k7b0v_copy/blocks/$(Split-Path -Leaf $blockPath)"
        }) | Out-Null

        $crop.Dispose()
        $scoringBitmap.Dispose()
    }

    $usedKeys = New-Object 'System.Collections.Generic.HashSet[string]'
    $selectionRows = New-Object System.Collections.Generic.List[object]

    foreach ($target in $targets) {
        $best = $null
        $template = $templateGray[$target.Template]

        for ($row = $target.RowMin; $row -le $target.RowMax; $row++) {
            for ($col = $target.ColMin; $col -le $target.ColMax; $col++) {
                $key = "{0},{1}" -f $row, $col
                if ($usedKeys.Contains($key)) {
                    continue
                }

                $candidate = $candidateCache[$key]
                $score = Get-Score -Candidate $candidate.Gray -Template $template
                if ($null -eq $best -or $score -lt $best.Score) {
                    $best = [PSCustomObject]@{
                        Key = $key
                        Score = $score
                    }
                }
            }
        }

        if ($null -eq $best) {
            throw "No candidate block found for $($target.Name)"
        }

        $usedKeys.Add($best.Key) | Out-Null
        $candidate = $candidateCache[$best.Key]
        $outputPath = Join-Path (Join-Path $outputRoot $target.Category) "$($target.Name).png"
        $candidate.Bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)

        $selectionRows.Add([PSCustomObject]@{
            name = $target.Name
            category = $target.Category
            template = $target.Template
            source_block_row = $candidate.Row
            source_block_col = $candidate.Col
            source_x = $candidate.SourceX
            source_y = $candidate.SourceY
            source_width = $candidate.SourceWidth
            source_height = $candidate.SourceHeight
            output_size = "${outputTileSize}x${outputTileSize}"
            output_path = "assets/tiles/$($target.Category)/$($target.Name).png"
            block_path = $candidate.BlockPath
            score = $best.Score
        }) | Out-Null
    }

    $manifest = [PSCustomObject]@{
        block_exports = $blockManifestRows
        selections = $selectionRows
    }

    $selectionRows | Export-Csv -Path $manifestPath -NoTypeInformation
    $blockManifestRows | Export-Csv -Path (Join-Path $manifestDir 'blocks_manifest.csv') -NoTypeInformation

    Write-Host "Saved $($blockManifestRows.Count) clean 10x10 block exports."
    Write-Host "Saved $($selectionRows.Count) semantic tiles at ${outputTileSize}x${outputTileSize}."
    Write-Host "Selection manifest written to $manifestPath"
} finally {
    foreach ($entry in $candidateCache.Values) {
        $entry.Bitmap.Dispose()
    }

    foreach ($templateBitmap in $templateBitmaps.Values) {
        $templateBitmap.Dispose()
    }

    $templateAtlas.Dispose()
    $sourceBitmap.Dispose()
}
