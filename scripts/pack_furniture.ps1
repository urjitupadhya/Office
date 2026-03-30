# scripts/pack_furniture.ps1
# Packs 64x64 extracted furniture PNGs into the 256x256 runtime atlas (8x8 @ 32px).
# Position mirrors the FURNITURE constant in src/constants/spriteMap.ts exactly.

Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = 'Stop'

$workspace     = Split-Path -Parent $PSScriptRoot
$furnitureRoot = Join-Path $workspace 'assets\furniture'
$outputPath    = Join-Path $workspace 'assets\sprites\furniture.png'

$TILE_SIZE    = 32
$ATLAS_COLS   = 8
$ATLAS_ROWS   = 8
$ATLAS_WIDTH  = $TILE_SIZE * $ATLAS_COLS   # 256
$ATLAS_HEIGHT = $TILE_SIZE * $ATLAS_ROWS   # 256

# Map: [row, col] => path relative to assets\furniture\
# Mirrors FURNITURE entries in spriteMap.ts. $null = placeholder (magenta).
$furnitureMap = @(
    # Row 0
    @{ Row=0; Col=0; File='desks\desk_simple.png' },           # DESK_STANDARD
    @{ Row=0; Col=1; File='desks\desk_dual_monitor.png' },     # DESK_PREMIUM
    @{ Row=0; Col=2; File='desks\desk_corner_l.png' },         # DESK_BOSS_LEFT
    @{ Row=0; Col=3; File='desks\desk_l_shape.png' },          # DESK_BOSS_RIGHT
    @{ Row=0; Col=4; File='chairs\chair_office_basic.png' },   # CHAIR_STANDARD
    @{ Row=0; Col=5; File='chairs\chair_boss_brown.png' },     # CHAIR_BOSS
    @{ Row=0; Col=6; File='plants\plant_small.png' },          # PLANT_SMALL
    @{ Row=0; Col=7; File='plants\plant_round.png' },          # PLANT_TALL

    # Row 1
    @{ Row=1; Col=0; File=$null },                             # BOOKSHELF — placeholder
    @{ Row=1; Col=1; File='utilities\whiteboard.png' },        # WHITEBOARD
    @{ Row=1; Col=2; File='utilities\cabinet_storage.png' },   # FILING_CABINET
    @{ Row=1; Col=3; File='chairs\chair_gaming_black.png' },   # CHAIR_PREMIUM
    @{ Row=1; Col=4; File=$null },                             # SERVER_RACK — placeholder
    @{ Row=1; Col=5; File='desks\desk_laptop.png' },           # MONITOR_DESK
    @{ Row=1; Col=6; File='desks\desk_pc_modern.png' },        # DISPLAY_LARGE
    @{ Row=1; Col=7; File=$null },                             # TOOLBOX — placeholder

    # Row 2
    @{ Row=2; Col=0; File=$null },                             # PIPELINE_BOARD
    @{ Row=2; Col=1; File=$null },                             # DESIGN_BOARD
    @{ Row=2; Col=2; File=$null },                             # MEDIA_FRAME
    @{ Row=2; Col=3; File=$null },                             # STICKY_BOARD
    @{ Row=2; Col=4; File=$null },                             # ARTWORK
    @{ Row=2; Col=5; File=$null },                             # TROPHY_SHELF
    @{ Row=2; Col=6; File=$null },                             # AWARDS_PLAQUE
    @{ Row=2; Col=7; File=$null },                             # SHOWCASE_GOLD

    # Row 3
    @{ Row=3; Col=0; File='utilities\floor_mat.png' },         # ENTRANCE_MAT
    @{ Row=3; Col=1; File='infrastructure\reception_main.png' }, # RECEPTION_LEFT
    @{ Row=3; Col=2; File='infrastructure\reception_curved.png' }, # RECEPTION_RIGHT
    @{ Row=3; Col=3; File='chairs\sofa_waiting.png' },         # SOFA_BENCH
    @{ Row=3; Col=4; File='utilities\coffee_machine.png' },    # COFFEE_MACHINE
    @{ Row=3; Col=5; File=$null },                             # MINI_FRIDGE
    @{ Row=3; Col=6; File=$null },                             # KITCHEN_COUNTER
    @{ Row=3; Col=7; File='utilities\wall_clock.png' }         # WALL_CLOCK
    # Rows 4-7: reserved (stay magenta)
)

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

$atlas  = New-Object System.Drawing.Bitmap $ATLAS_WIDTH, $ATLAS_HEIGHT, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$atlasG = [System.Drawing.Graphics]::FromImage($atlas)

try {
    $atlasG.Clear([System.Drawing.Color]::Transparent)
    $atlasG.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy

    $placed = 0
    foreach ($entry in $furnitureMap) {
        if ($null -eq $entry.File) { continue }
        $srcPath = Join-Path $furnitureRoot $entry.File
        if (-not (Test-Path -LiteralPath $srcPath)) {
            Write-Warning "Furniture not found (skipping): $srcPath"
            continue
        }
        $srcBmp  = [System.Drawing.Bitmap]::FromFile($srcPath)
        $resized = New-ResizedBitmap $srcBmp $TILE_SIZE $TILE_SIZE
        $srcBmp.Dispose()
        $destX = $entry.Col * $TILE_SIZE
        $destY = $entry.Row * $TILE_SIZE
        $atlasG.DrawImage($resized,
            (New-Object System.Drawing.Rectangle $destX, $destY, $TILE_SIZE, $TILE_SIZE),
            (New-Object System.Drawing.Rectangle 0, 0, $TILE_SIZE, $TILE_SIZE),
            [System.Drawing.GraphicsUnit]::Pixel)
        $resized.Dispose()
        $placed++
    }

    New-Item -ItemType Directory -Force -Path (Split-Path $outputPath) | Out-Null
    $atlas.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Host "furniture.png written: ${ATLAS_WIDTH}x${ATLAS_HEIGHT}, $placed sprites placed."
} finally {
    $atlasG.Dispose()
    $atlas.Dispose()
}
