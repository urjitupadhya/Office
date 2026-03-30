# scripts/pack_elevator.ps1
# Packs elevator frames into the 128x256 runtime atlas (4 cols x 8 rows @ 32px).
# Source: assets/furniture/infrastructure/elevator_closed.png + elevator_open.png (64x64).
# Mirrors the ELEVATOR constant in src/constants/spriteMap.ts.

Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = 'Stop'

$workspace   = Split-Path -Parent $PSScriptRoot
$infraRoot   = Join-Path $workspace 'assets\furniture\infrastructure'
$outputPath  = Join-Path $workspace 'assets\sprites\elevator.png'

$TILE_SIZE    = 32
$ATLAS_COLS   = 4
$ATLAS_ROWS   = 8
$ATLAS_WIDTH  = $TILE_SIZE * $ATLAS_COLS   # 128
$ATLAS_HEIGHT = $TILE_SIZE * $ATLAS_ROWS   # 256

$closedPath = Join-Path $infraRoot 'elevator_closed.png'
$openPath   = Join-Path $infraRoot 'elevator_open.png'

foreach ($p in @($closedPath, $openPath)) {
    if (-not (Test-Path -LiteralPath $p)) {
        throw "Required elevator source not found: $p"
    }
}

function New-ResizedBitmap([System.Drawing.Bitmap]$src, [int]$w, [int]$h) {
    $dst = New-Object System.Drawing.Bitmap $w, $h, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g   = [System.Drawing.Graphics]::FromImage($dst)
    try {
        $g.Clear([System.Drawing.Color]::Transparent)
        $g.CompositingMode    = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
        $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighSpeed
        $g.InterpolationMode  = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
        $g.PixelOffsetMode    = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
        $g.SmoothingMode      = [System.Drawing.Drawing2D.SmoothingMode]::None
        $g.DrawImage($src,
            (New-Object System.Drawing.Rectangle 0, 0, $w, $h),
            (New-Object System.Drawing.Rectangle 0, 0, $src.Width, $src.Height),
            [System.Drawing.GraphicsUnit]::Pixel)
    } finally { $g.Dispose() }
    return $dst
}

function Split-Horizontally([System.Drawing.Bitmap]$src) {
    # Split a 32x32 tile into left (0..15) and right (16..31) halves
    $left  = $src.Clone((New-Object System.Drawing.Rectangle 0, 0, 16, 32), [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $right = $src.Clone((New-Object System.Drawing.Rectangle 16, 0, 16, 32), [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    return $left, $right
}

function New-ScaledHalf([System.Drawing.Bitmap]$half) {
    # Resize a 16x32 half back to 32x32 for the atlas cell
    $dst = New-Object System.Drawing.Bitmap 32, 32, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g   = [System.Drawing.Graphics]::FromImage($dst)
    try {
        $g.Clear([System.Drawing.Color]::Transparent)
        $g.CompositingMode   = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
        $g.PixelOffsetMode   = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
        $g.DrawImage($half,
            (New-Object System.Drawing.Rectangle 0, 0, 32, 32),
            (New-Object System.Drawing.Rectangle 0, 0, $half.Width, $half.Height),
            [System.Drawing.GraphicsUnit]::Pixel)
    } finally { $g.Dispose() }
    return $dst
}

# Load + resize source bitmaps to 32x32
$closedBmp = [System.Drawing.Bitmap]::FromFile($closedPath)
$openBmp   = [System.Drawing.Bitmap]::FromFile($openPath)
$closed32  = New-ResizedBitmap $closedBmp 32 32
$open32    = New-ResizedBitmap $openBmp   32 32
$closedBmp.Dispose()
$openBmp.Dispose()

# Split into left/right halves, then scale each half to 32x32 so each occupies one atlas cell
$closedL32, $closedR32 = Split-Horizontally $closed32
$openL32,   $openR32   = Split-Horizontally $open32
$closedL32s = New-ScaledHalf $closedL32
$closedR32s = New-ScaledHalf $closedR32
$openL32s   = New-ScaledHalf $openL32
$openR32s   = New-ScaledHalf $openR32
$closedL32.Dispose(); $closedR32.Dispose()
$openL32.Dispose();   $openR32.Dispose()

# ELEVATOR atlas layout (mirrors spriteMap.ts ELEVATOR entries):
# Each entry: [row, col, bitmap]
# Row 0: shaft top (placeholder gray)
# Row 1: closed left/right, door-opening L/R (reuse open as mid-frame)
# Row 2: open left/right, door-closing L/R
# Row 3: moving left/right (reuse closed), glow left/right (reuse open)
# Row 4: indicator panel (placeholder), up/down/inactive buttons
# Row 5: shaft floor left/right (placeholder)
$placements = @(
    # Row 1 — car closed + opening
    @{ Row=1; Col=0; Bmp=$closedL32s },  # CAR_CLOSED_LEFT
    @{ Row=1; Col=1; Bmp=$closedR32s },  # CAR_CLOSED_RIGHT
    @{ Row=1; Col=2; Bmp=$openL32s   },  # DOOR_OPENING_L (mid-frame: use open half)
    @{ Row=1; Col=3; Bmp=$openR32s   },  # DOOR_OPENING_R

    # Row 2 — car open + closing
    @{ Row=2; Col=0; Bmp=$openL32s   },  # CAR_OPEN_LEFT
    @{ Row=2; Col=1; Bmp=$openR32s   },  # CAR_OPEN_RIGHT
    @{ Row=2; Col=2; Bmp=$closedL32s },  # DOOR_CLOSING_L (mid-frame: use closed half)
    @{ Row=2; Col=3; Bmp=$closedR32s },  # DOOR_CLOSING_R

    # Row 3 — moving + glow
    @{ Row=3; Col=0; Bmp=$closedL32s },  # CAR_MOVING_LEFT
    @{ Row=3; Col=1; Bmp=$closedR32s },  # CAR_MOVING_RIGHT
    @{ Row=3; Col=2; Bmp=$openL32s   },  # CAR_GLOW_LEFT
    @{ Row=3; Col=3; Bmp=$openR32s   }   # CAR_GLOW_RIGHT
)

$atlas  = New-Object System.Drawing.Bitmap $ATLAS_WIDTH, $ATLAS_HEIGHT, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$atlasG = [System.Drawing.Graphics]::FromImage($atlas)

try {
    # Fill with a dark gray shaft background for rows 0,4,5 (shaft structure)
    $atlasG.Clear([System.Drawing.Color]::FromArgb(255, 40, 40, 50))

    foreach ($p in $placements) {
        $destX = $p.Col * $TILE_SIZE
        $destY = $p.Row * $TILE_SIZE
        $atlasG.DrawImage($p.Bmp,
            (New-Object System.Drawing.Rectangle $destX, $destY, $TILE_SIZE, $TILE_SIZE),
            (New-Object System.Drawing.Rectangle 0, 0, $TILE_SIZE, $TILE_SIZE),
            [System.Drawing.GraphicsUnit]::Pixel)
    }

    New-Item -ItemType Directory -Force -Path (Split-Path $outputPath) | Out-Null
    $atlas.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Host "elevator.png written: ${ATLAS_WIDTH}x${ATLAS_HEIGHT}"
} finally {
    foreach ($p in $placements) { $p.Bmp.Dispose() }
    $closed32.Dispose(); $open32.Dispose()
    $atlasG.Dispose(); $atlas.Dispose()
}
