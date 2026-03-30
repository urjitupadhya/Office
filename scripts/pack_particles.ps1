# scripts/pack_particles.ps1
# Generates the 64x64 particles atlas (2 cols x 2 rows @ 32px) from solid-color placeholders.
# No source art exists yet — uses distinct colors so each particle type is visually distinguishable.
# When real particle art is created, update this script to load from assets/source/particles/.

Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = 'Stop'

$workspace  = Split-Path -Parent $PSScriptRoot
$outputPath = Join-Path $workspace 'assets\sprites\particles.png'

$TILE_SIZE  = 32
$ATLAS_SIZE = 64   # 2x2

# Particle slot colors (mirrors PARTICLE entries in spriteMap.ts)
# [row, col] => ARGB color + label
$particles = @(
    @{ Row=0; Col=0; R=255; G=215; B=0;   Name='ZONE_GLOW — warm gold'     },  # #FFD700
    @{ Row=0; Col=1; R=0;   G=255; B=255; Name='COMMIT_BURST — cyan'        },  # #00FFFF
    @{ Row=1; Col=0; R=68;  G=136; B=255; Name='DESK_WORK_DOT — soft blue'  },  # #4488FF
    @{ Row=1; Col=1; R=170; G=68;  B=255; Name='AMBIENT_SHIMMER — purple'   }   # #AA44FF
)

function New-RadialGradientTile([int]$r, [int]$g, [int]$b, [int]$size) {
    $bmp  = New-Object System.Drawing.Bitmap $size, $size, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $gfx  = [System.Drawing.Graphics]::FromImage($bmp)
    try {
        $gfx.Clear([System.Drawing.Color]::Transparent)
        $center = $size / 2
        $radius = $center - 2

        # Draw a soft radial glow: bright center fading to transparent edge
        for ($i = $radius; $i -ge 0; $i--) {
            $alpha = [int](255 * ($i / $radius) * ($i / $radius))  # quadratic falloff
            $color = [System.Drawing.Color]::FromArgb($alpha, $r, $g, $b)
            $brush = New-Object System.Drawing.SolidBrush($color)
            $gfx.FillEllipse($brush,
                ($center - $i), ($center - $i), ($i * 2), ($i * 2))
            $brush.Dispose()
        }
    } finally { $gfx.Dispose() }
    return $bmp
}

$atlas  = New-Object System.Drawing.Bitmap $ATLAS_SIZE, $ATLAS_SIZE, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$atlasG = [System.Drawing.Graphics]::FromImage($atlas)

try {
    $atlasG.Clear([System.Drawing.Color]::Transparent)

    foreach ($p in $particles) {
        $tile  = New-RadialGradientTile $p.R $p.G $p.B $TILE_SIZE
        $destX = $p.Col * $TILE_SIZE
        $destY = $p.Row * $TILE_SIZE
        $atlasG.DrawImage($tile,
            (New-Object System.Drawing.Rectangle $destX, $destY, $TILE_SIZE, $TILE_SIZE),
            (New-Object System.Drawing.Rectangle 0, 0, $TILE_SIZE, $TILE_SIZE),
            [System.Drawing.GraphicsUnit]::Pixel)
        $tile.Dispose()
        Write-Host "  [$($p.Row),$($p.Col)] $($p.Name)"
    }

    New-Item -ItemType Directory -Force -Path (Split-Path $outputPath) | Out-Null
    $atlas.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Host "particles.png written: ${ATLAS_SIZE}x${ATLAS_SIZE}, 4 radial glow tiles."
} finally {
    $atlasG.Dispose()
    $atlas.Dispose()
}
