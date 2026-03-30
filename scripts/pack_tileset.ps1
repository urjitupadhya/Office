# scripts/pack_tileset.ps1
# Packs 64x64 extracted tile PNGs into the 256x256 runtime atlas (8x8 @ 32px)
# Position of each tile is determined by spriteMap.ts TILE[row][col] coordinates.
# Unfilled slots are filled with solid magenta #FF00FF as a visible placeholder.

Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = 'Stop'

$workspace = Split-Path -Parent $PSScriptRoot
$tilesRoot  = Join-Path $workspace 'assets\tiles'
$outputPath = Join-Path $workspace 'assets\sprites\tileset.png'

$TILE_SIZE    = 32
$ATLAS_COLS   = 8
$ATLAS_ROWS   = 8
$ATLAS_WIDTH  = $TILE_SIZE * $ATLAS_COLS   # 256
$ATLAS_HEIGHT = $TILE_SIZE * $ATLAS_ROWS   # 256

# Map: [row, col] => relative path inside assets\tiles\
# Mirrors the TILE constant in src/constants/spriteMap.ts exactly.
$tileMap = @(
    # Row 0 — Base structure
    @{ Row=0; Col=0; File=$null },               # VOID — transparent
    @{ Row=0; Col=1; File='floor\floor_light.png' },      # FLOOR_BASIC
    @{ Row=0; Col=2; File='walls\wall_horizontal.png' },  # WALL_H
    @{ Row=0; Col=3; File='walls\wall_vertical.png' },    # WALL_V
    @{ Row=0; Col=4; File='corners\wall_corner_nw.png' }, # CORNER_NW
    @{ Row=0; Col=5; File='corners\wall_corner_ne.png' }, # CORNER_NE
    @{ Row=0; Col=6; File='corners\wall_corner_sw.png' }, # CORNER_SW
    @{ Row=0; Col=7; File='corners\wall_corner_se.png' }, # CORNER_SE

    # Row 1 — Doors, floor variants, overlays
    @{ Row=1; Col=0; File='doors\door_closed.png' },       # DOOR_SINGLE_CLOSED
    @{ Row=1; Col=1; File='doors\door_frame.png' },        # DOOR_DOUBLE_CLOSED
    @{ Row=1; Col=2; File=$null },                         # WINDOW — placeholder
    @{ Row=1; Col=3; File='floor\floor_corridor.png' },    # FLOOR_CORRIDOR
    @{ Row=1; Col=4; File='special\elevator_floor.png' },  # FLOOR_ELEVATOR
    @{ Row=1; Col=5; File='special\boundary_tile.png' },   # ZONE_BOUNDARY
    @{ Row=1; Col=6; File='special\glow_tile.png' },       # GLOW_ACTIVE
    @{ Row=1; Col=7; File=$null },                         # GLOW_INACTIVE — placeholder

    # Row 2 — Signs, lobby, prestige, infra (all placeholders for now)
    @{ Row=2; Col=0; File=$null },  # NAMEPLATE
    @{ Row=2; Col=1; File=$null },  # ENTRANCE_MAT
    @{ Row=2; Col=2; File=$null },  # FLOOR_LOBBY
    @{ Row=2; Col=3; File=$null },  # TROPHY_SHELF
    @{ Row=2; Col=4; File=$null },  # AWARDS_PLAQUE
    @{ Row=2; Col=5; File=$null },  # SHOWCASE_GOLD
    @{ Row=2; Col=6; File=$null },  # GOLD_STAR
    @{ Row=2; Col=7; File=$null },  # SERVER_RACK

    # Row 3 — Zone props/decor (all placeholders for now)
    @{ Row=3; Col=0; File=$null },  # MONITOR
    @{ Row=3; Col=1; File=$null },  # FILING_CABINET
    @{ Row=3; Col=2; File=$null },  # TOOLBOX
    @{ Row=3; Col=3; File=$null },  # PIPELINE_BOARD
    @{ Row=3; Col=4; File=$null },  # MEDIA_DISPLAY
    @{ Row=3; Col=5; File=$null },  # STICKY_NOTES
    @{ Row=3; Col=6; File=$null },  # COBWEB
    @{ Row=3; Col=7; File=$null },  # FRAMED_ARTWORK

    # Row 4 — Extended tiles, open doors, group desk cluster
    @{ Row=4; Col=0; File=$null },  # LARGE_DESK_LEFT
    @{ Row=4; Col=1; File=$null },  # LARGE_DESK_RIGHT
    @{ Row=4; Col=2; File=$null },  # DESIGN_BOARD
    @{ Row=4; Col=3; File='doors\door_open.png' },         # DOOR_SINGLE_OPEN
    @{ Row=4; Col=4; File=$null },  # DOOR_DOUBLE_OPEN
    @{ Row=4; Col=5; File=$null },  # GROUP_DESK_TL
    @{ Row=4; Col=6; File=$null },  # GROUP_DESK_TR
    @{ Row=4; Col=7; File=$null },  # GROUP_DESK_BL

    # Row 5 — Group desk cluster (bottom), scalability tiles, floor/wall variants
    @{ Row=5; Col=0; File=$null },  # GROUP_DESK_BR
    @{ Row=5; Col=1; File=$null },  # CROWD_ZONE
    @{ Row=5; Col=2; File='corridors\corridor_t_junction.png' },    # CORRIDOR_T
    @{ Row=5; Col=3; File='corridors\corridor_cross.png' },         # CORRIDOR_CROSS
    @{ Row=5; Col=4; File='floor\floor_dark.png' },                 # FLOOR_VARIANT_B
    @{ Row=5; Col=5; File='floor\floor_dark_variant.png' },         # FLOOR_VARIANT_C
    @{ Row=5; Col=6; File='walls\wall_panel_horizontal.png' },      # WALL_H_PANEL
    @{ Row=5; Col=7; File='walls\wall_panel_vertical.png' }         # WALL_V_PANEL
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

$atlas   = New-Object System.Drawing.Bitmap $ATLAS_WIDTH, $ATLAS_HEIGHT, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$atlasG  = [System.Drawing.Graphics]::FromImage($atlas)

try {
    $atlasG.Clear([System.Drawing.Color]::Transparent)


    # Void tile [0,0] = fully transparent
    $atlasG.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
    $transparentBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::Transparent)
    $atlasG.FillRectangle($transparentBrush, 0, 0, $TILE_SIZE, $TILE_SIZE)
    $transparentBrush.Dispose()

    $placed = 0
    foreach ($entry in $tileMap) {
        if ($null -eq $entry.File) { continue }
        $srcPath = Join-Path $tilesRoot $entry.File
        if (-not (Test-Path -LiteralPath $srcPath)) {
            Write-Warning "Tile not found (skipping): $srcPath"
            continue
        }
        $srcBmp    = [System.Drawing.Bitmap]::FromFile($srcPath)
        $resized   = New-ResizedBitmap $srcBmp $TILE_SIZE $TILE_SIZE
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
    Write-Host "tileset.png written: ${ATLAS_WIDTH}x${ATLAS_HEIGHT}, $placed tiles placed."
} finally {
    $atlasG.Dispose()
    $atlas.Dispose()
}
