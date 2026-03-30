# scripts/pack_characters.ps1
# Packs extracted character frames into characters.png (384x96, 12 cols x 3 rows @ 32px).
# Role normalization: boss->row0, executive->premium->row1, employee->general->row2.
# MVP frame set: idle_0, idle_1, walk_down x4, walk_up x4, walk_left x4, walk_right x4 = 18 frames
# We use 12 cols for the walk frames + 2 idle = fits in 12 cols per row.
# (idle_0 = walk_down_0 reuse, idle_1 = walk_down_1 reuse)

Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = 'Stop'

$workspace   = Split-Path -Parent $PSScriptRoot
$charsRoot   = Join-Path $workspace 'assets\source\characters'
$outputPath  = Join-Path $workspace 'assets\sprites\characters.png'

$TILE_SIZE    = 32
$ATLAS_COLS   = 18    # matches CHARACTER_FRAME layout in spriteMap.ts (18 cols)
$ATLAS_ROWS   = 3     # MVP: boss(0), premium(1), general(2)
$ATLAS_WIDTH  = $TILE_SIZE * $ATLAS_COLS   # 576
$ATLAS_HEIGHT = $TILE_SIZE * $ATLAS_ROWS   # 96

# Frame column order matches CHARACTER_FRAME in spriteMap.ts:
# IDLE_0=0, IDLE_1=1, WALK_DOWN_0..3=2..5, WALK_UP_0..3=6..9,
# WALK_LEFT_0..3=10..13, WALK_RIGHT_0..3=14..17
$frameList = @(
    @{ Col=0;  File='walk_down_0.png' },   # IDLE_0 (reuse walk_down_0)
    @{ Col=1;  File='walk_down_1.png' },   # IDLE_1 (reuse walk_down_1)
    @{ Col=2;  File='walk_down_0.png' },   # WALK_DOWN_0
    @{ Col=3;  File='walk_down_1.png' },   # WALK_DOWN_1
    @{ Col=4;  File='walk_down_2.png' },   # WALK_DOWN_2
    @{ Col=5;  File='walk_down_3.png' },   # WALK_DOWN_3
    @{ Col=6;  File='walk_up_0.png' },     # WALK_UP_0
    @{ Col=7;  File='walk_up_1.png' },     # WALK_UP_1
    @{ Col=8;  File='walk_up_2.png' },     # WALK_UP_2
    @{ Col=9;  File='walk_up_3.png' },     # WALK_UP_3
    @{ Col=10; File='walk_left_0.png' },   # WALK_LEFT_0
    @{ Col=11; File='walk_left_1.png' },   # WALK_LEFT_1
    @{ Col=12; File='walk_left_2.png' },   # WALK_LEFT_2
    @{ Col=13; File='walk_left_3.png' },   # WALK_LEFT_3
    @{ Col=14; File='walk_right_0.png' },  # WALK_RIGHT_0
    @{ Col=15; File='walk_right_1.png' },  # WALK_RIGHT_1
    @{ Col=16; File='walk_right_2.png' },  # WALK_RIGHT_2
    @{ Col=17; File='walk_right_3.png' }   # WALK_RIGHT_3
)

# Role → atlas row mapping (canonical runtime names)
$roleRows = @(
    @{ SourceFolder='boss';      Row=0 },  # boss
    @{ SourceFolder='executive'; Row=1 },  # premium (normalized)
    @{ SourceFolder='employee';  Row=2 }   # general (normalized)
)

function New-ResizedBitmapCentered([System.Drawing.Bitmap]$src, [int]$w, [int]$h) {
    $dst = New-Object System.Drawing.Bitmap $w, $h, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g   = [System.Drawing.Graphics]::FromImage($dst)
    try {
        $g.Clear([System.Drawing.Color]::Transparent)
        $g.CompositingMode    = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
        $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighSpeed
        $g.InterpolationMode  = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
        $g.PixelOffsetMode    = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
        $g.SmoothingMode      = [System.Drawing.Drawing2D.SmoothingMode]::None

        # Scale to fit within w x h, preserving aspect ratio, centered
        $scaleX = $w / $src.Width
        $scaleY = $h / $src.Height
        $scale  = [Math]::Min($scaleX, $scaleY)
        $newW   = [int]($src.Width  * $scale)
        $newH   = [int]($src.Height * $scale)
        $offX   = [int](($w - $newW) / 2)
        $offY   = [int](($h - $newH) / 2)

        $g.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
        $g.DrawImage($src,
            (New-Object System.Drawing.Rectangle $offX, $offY, $newW, $newH),
            (New-Object System.Drawing.Rectangle 0, 0, $src.Width, $src.Height),
            [System.Drawing.GraphicsUnit]::Pixel)
    } finally { $g.Dispose() }
    return $dst
}

$atlas  = New-Object System.Drawing.Bitmap $ATLAS_WIDTH, $ATLAS_HEIGHT, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$atlasG = [System.Drawing.Graphics]::FromImage($atlas)

try {
    $atlasG.Clear([System.Drawing.Color]::Transparent)

    $totalPlaced = 0
    foreach ($roleEntry in $roleRows) {
        $roleDir = Join-Path $charsRoot $roleEntry.SourceFolder
        if (-not (Test-Path -LiteralPath $roleDir)) {
            Write-Warning "Role folder not found: $roleDir — row $($roleEntry.Row) will be empty."
            continue
        }

        $rowPlaced = 0
        foreach ($frame in $frameList) {
            $srcPath = Join-Path $roleDir $frame.File
            if (-not (Test-Path -LiteralPath $srcPath)) {
                Write-Warning "Frame not found: $srcPath"
                continue
            }
            $srcBmp  = [System.Drawing.Bitmap]::FromFile($srcPath)
            $resized = New-ResizedBitmapCentered $srcBmp $TILE_SIZE $TILE_SIZE
            $srcBmp.Dispose()

            $destX = $frame.Col * $TILE_SIZE
            $destY = $roleEntry.Row * $TILE_SIZE
            $atlasG.DrawImage($resized,
                (New-Object System.Drawing.Rectangle $destX, $destY, $TILE_SIZE, $TILE_SIZE),
                (New-Object System.Drawing.Rectangle 0, 0, $TILE_SIZE, $TILE_SIZE),
                [System.Drawing.GraphicsUnit]::Pixel)
            $resized.Dispose()
            $rowPlaced++
        }

        Write-Host "  Row $($roleEntry.Row) ($($roleEntry.SourceFolder) -> $(if($roleEntry.Row -eq 0){'boss'}elseif($roleEntry.Row -eq 1){'premium'}else{'general'})): $rowPlaced frames"
        $totalPlaced += $rowPlaced
    }

    New-Item -ItemType Directory -Force -Path (Split-Path $outputPath) | Out-Null
    $atlas.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Host "characters.png written: ${ATLAS_WIDTH}x${ATLAS_HEIGHT}, $totalPlaced frames placed."
    Write-Host "NOTE: executive->premium (row 1), employee->general (row 2)"
} finally {
    $atlasG.Dispose()
    $atlas.Dispose()
}
