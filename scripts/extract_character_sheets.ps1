Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = 'Stop'

$workspace = Split-Path -Parent $PSScriptRoot
$sourceRoot = Join-Path $workspace 'assets\char'
$outputRoot = Join-Path $workspace 'assets\source\characters'
$cellSize = 128
$sheetSize = 1024

$jobs = @(
    @{
        Source = Join-Path $sourceRoot 'boss.png'
        Role = 'boss'
    },
    @{
        Source = Join-Path $sourceRoot 'topexectuivegreyonly.png'
        Role = 'executive'
    },
    @{
        Source = Join-Path $sourceRoot 'simpleguygreen.png'
        Role = 'employee'
    }
)

$alphaThreshold = 10
$cropPadding = 2

$getOpaquePixelCount = {
    param(
        [System.Drawing.Bitmap] $Bitmap
    )

    $count = 0
    for ($y = 0; $y -lt $Bitmap.Height; $y++) {
        for ($x = 0; $x -lt $Bitmap.Width; $x++) {
            if ($Bitmap.GetPixel($x, $y).A -gt $alphaThreshold) {
                $count++
            }
        }
    }

    return $count
}

$getCropBounds = {
    param(
        [System.Drawing.Bitmap] $Bitmap
    )

    $rowCounts = New-Object 'int[]' $Bitmap.Height
    for ($y = 0; $y -lt $Bitmap.Height; $y++) {
        $rowCount = 0
        for ($x = 0; $x -lt $Bitmap.Width; $x++) {
            if ($Bitmap.GetPixel($x, $y).A -gt $alphaThreshold) {
                $rowCount++
            }
        }
        $rowCounts[$y] = $rowCount
    }

    $bestStart = -1
    $bestEnd = -1
    $bestWeight = -1
    $runStart = -1
    $runWeight = 0

    for ($y = 0; $y -lt $rowCounts.Length; $y++) {
        if ($rowCounts[$y] -gt 0) {
            if ($runStart -lt 0) {
                $runStart = $y
                $runWeight = 0
            }
            $runWeight += $rowCounts[$y]
            continue
        }

        if ($runStart -ge 0 -and $runWeight -gt $bestWeight) {
            $bestStart = $runStart
            $bestEnd = $y - 1
            $bestWeight = $runWeight
        }

        $runStart = -1
        $runWeight = 0
    }

    if ($runStart -ge 0 -and $runWeight -gt $bestWeight) {
        $bestStart = $runStart
        $bestEnd = $rowCounts.Length - 1
        $bestWeight = $runWeight
    }

    if ($bestStart -lt 0) {
        return $null
    }

    $minX = $Bitmap.Width
    $maxX = -1
    for ($y = $bestStart; $y -le $bestEnd; $y++) {
        for ($x = 0; $x -lt $Bitmap.Width; $x++) {
            if ($Bitmap.GetPixel($x, $y).A -gt $alphaThreshold) {
                if ($x -lt $minX) { $minX = $x }
                if ($x -gt $maxX) { $maxX = $x }
            }
        }
    }

    if ($maxX -lt 0) {
        return $null
    }

    $x = [Math]::Max(0, $minX - $cropPadding)
    $y = [Math]::Max(0, $bestStart - $cropPadding)
    $right = [Math]::Min($Bitmap.Width - 1, $maxX + $cropPadding)
    $bottom = [Math]::Min($Bitmap.Height - 1, $bestEnd + $cropPadding)

    return [PSCustomObject]@{
        X = $x
        Y = $y
        Width = $right - $x + 1
        Height = $bottom - $y + 1
    }
}

$frameSpecs = @(
    @{ Name = 'walk_down_0';   Row = 0; Col = 0; Width = $cellSize; Height = $cellSize },
    @{ Name = 'walk_down_1';   Row = 0; Col = 1; Width = $cellSize; Height = $cellSize },
    @{ Name = 'walk_down_2';   Row = 0; Col = 2; Width = $cellSize; Height = $cellSize },
    @{ Name = 'walk_down_3';   Row = 0; Col = 3; Width = $cellSize; Height = $cellSize },
    @{ Name = 'walk_up_0';     Row = 1; Col = 0; Width = $cellSize; Height = $cellSize },
    @{ Name = 'walk_up_1';     Row = 1; Col = 1; Width = $cellSize; Height = $cellSize },
    @{ Name = 'walk_up_2';     Row = 1; Col = 2; Width = $cellSize; Height = $cellSize },
    @{ Name = 'walk_up_3';     Row = 1; Col = 3; Width = $cellSize; Height = $cellSize },
    @{ Name = 'walk_right_0';  Row = 2; Col = 0; Width = $cellSize; Height = $cellSize },
    @{ Name = 'walk_right_1';  Row = 2; Col = 1; Width = $cellSize; Height = $cellSize },
    @{ Name = 'walk_right_2';  Row = 2; Col = 2; Width = $cellSize; Height = $cellSize },
    @{ Name = 'walk_right_3';  Row = 2; Col = 3; Width = $cellSize; Height = $cellSize },
    @{ Name = 'walk_left_0';   Row = 3; Col = 0; Width = $cellSize; Height = $cellSize },
    @{ Name = 'walk_left_1';   Row = 3; Col = 1; Width = $cellSize; Height = $cellSize },
    @{ Name = 'walk_left_2';   Row = 3; Col = 2; Width = $cellSize; Height = $cellSize },
    @{ Name = 'walk_left_3';   Row = 3; Col = 3; Width = $cellSize; Height = $cellSize },
    @{ Name = 'sit_down_0';    Row = 4; Col = 0; Width = $cellSize; Height = $cellSize * 2 },
    @{ Name = 'sit_down_1';    Row = 4; Col = 1; Width = $cellSize; Height = $cellSize * 2 },
    @{ Name = 'sit_up_0';      Row = 4; Col = 2; Width = $cellSize; Height = $cellSize * 2 },
    @{ Name = 'sit_up_1';      Row = 4; Col = 3; Width = $cellSize; Height = $cellSize * 2 },
    @{ Name = 'sit_right_0';   Row = 4; Col = 4; Width = $cellSize; Height = $cellSize * 2 },
    @{ Name = 'sit_right_1';   Row = 4; Col = 5; Width = $cellSize; Height = $cellSize * 2 },
    @{ Name = 'sit_left_0';    Row = 4; Col = 6; Width = $cellSize; Height = $cellSize * 2 },
    @{ Name = 'sit_left_1';    Row = 4; Col = 7; Width = $cellSize; Height = $cellSize * 2 },
    @{ Name = 'sleep_down_0';  Row = 5; Col = 0; Width = $cellSize; Height = $cellSize * 2 },
    @{ Name = 'sleep_down_1';  Row = 5; Col = 1; Width = $cellSize; Height = $cellSize * 2 },
    @{ Name = 'sleep_up_0';    Row = 5; Col = 2; Width = $cellSize; Height = $cellSize * 2 },
    @{ Name = 'sleep_up_1';    Row = 5; Col = 3; Width = $cellSize; Height = $cellSize * 2 },
    @{ Name = 'sleep_right_0'; Row = 5; Col = 4; Width = $cellSize; Height = $cellSize * 2 },
    @{ Name = 'sleep_right_1'; Row = 5; Col = 5; Width = $cellSize; Height = $cellSize * 2 },
    @{ Name = 'sleep_left_0';  Row = 5; Col = 6; Width = $cellSize; Height = $cellSize * 2 },
    @{ Name = 'sleep_left_1';  Row = 5; Col = 7; Width = $cellSize; Height = $cellSize * 2 },
    @{ Name = 'coffee_down_0'; Row = 7; Col = 0; Width = $cellSize; Height = $cellSize },
    @{ Name = 'coffee_down_1'; Row = 7; Col = 1; Width = $cellSize; Height = $cellSize },
    @{ Name = 'coffee_up_0';   Row = 7; Col = 2; Width = $cellSize; Height = $cellSize },
    @{ Name = 'coffee_up_1';   Row = 7; Col = 3; Width = $cellSize; Height = $cellSize },
    @{ Name = 'coffee_right_0';Row = 7; Col = 4; Width = $cellSize; Height = $cellSize },
    @{ Name = 'coffee_right_1';Row = 7; Col = 5; Width = $cellSize; Height = $cellSize },
    @{ Name = 'coffee_left_0'; Row = 7; Col = 6; Width = $cellSize; Height = $cellSize },
    @{ Name = 'coffee_left_1'; Row = 7; Col = 7; Width = $cellSize; Height = $cellSize }
)

foreach ($job in $jobs) {
    if (-not (Test-Path -LiteralPath $job.Source)) {
        throw "Character sheet not found: $($job.Source)"
    }
}

New-Item -ItemType Directory -Force -Path $outputRoot | Out-Null
$allRows = New-Object System.Collections.Generic.List[object]

foreach ($job in $jobs) {
    $roleDir = Join-Path $outputRoot $job.Role
    New-Item -ItemType Directory -Force -Path $roleDir | Out-Null

    # Redo this role cleanly so old frame names do not linger beside the new layout.
    Get-ChildItem -LiteralPath $roleDir -File -ErrorAction SilentlyContinue | ForEach-Object {
        Remove-Item -LiteralPath $_.FullName -Force
    }

    $sheet = [System.Drawing.Bitmap]::FromFile($job.Source)
    if ($sheet.Width -ne $sheetSize -or $sheet.Height -ne $sheetSize) {
        $sheet.Dispose()
        throw "Expected ${sheetSize}x${sheetSize} for $($job.Source), got $($sheet.Width)x$($sheet.Height)"
    }

    $manifestRows = New-Object System.Collections.Generic.List[object]

    try {
        foreach ($frame in $frameSpecs) {
            $sourceX = $frame.Col * $cellSize
            $sourceY = $frame.Row * $cellSize
            $rect = New-Object System.Drawing.Rectangle $sourceX, $sourceY, $frame.Width, $frame.Height
            $searchTile = $sheet.Clone($rect, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
            $cropBounds = & $getCropBounds $searchTile

            if ($null -eq $cropBounds) {
                $searchTile.Dispose()
                continue
            }

            $finalRect = New-Object System.Drawing.Rectangle $cropBounds.X, $cropBounds.Y, $cropBounds.Width, $cropBounds.Height
            $tile = $searchTile.Clone($finalRect, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
            $searchTile.Dispose()

            $nonTransparent = & $getOpaquePixelCount $tile
            $outputPath = Join-Path $roleDir "$($frame.Name).png"
            $tile.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
            $tile.Dispose()

            $rowData = [PSCustomObject]@{
                role = $job.Role
                animation = $frame.Name
                source_file = [System.IO.Path]::GetFileName($job.Source)
                row = $frame.Row
                col = $frame.Col
                source_x = $sourceX + $cropBounds.X
                source_y = $sourceY + $cropBounds.Y
                tile_size = "$($cropBounds.Width)x$($cropBounds.Height)"
                non_transparent_pixels = $nonTransparent
                output_path = "assets/source/characters/$($job.Role)/$($frame.Name).png"
            }

            $manifestRows.Add($rowData) | Out-Null
            $allRows.Add($rowData) | Out-Null
        }
    } finally {
        $sheet.Dispose()
    }

    $manifestRows | Export-Csv -Path (Join-Path $roleDir 'manifest.csv') -NoTypeInformation
}

$allRows | Export-Csv -Path (Join-Path $outputRoot 'manifest.csv') -NoTypeInformation

Write-Host "Saved $($allRows.Count) character tiles without resizing."
Write-Host "Combined manifest written to $(Join-Path $outputRoot 'manifest.csv')"
