Add-Type -AssemblyName System.Drawing

$workspace = Split-Path -Parent $PSScriptRoot

$jobs = @(
    @{
        Source = Join-Path $workspace 'assets\rawgenerated\Untitled design (3).png'
        OutputDir = Join-Path $workspace 'assets\source\tiles\sheet_untitled_design_3'
        Manifest = Join-Path $workspace 'assets\source\tiles\sheet_untitled_design_3\manifest.csv'
        Names = @(
            @('r0_c0_light_floor_tile_01','r0_c1_light_floor_tile_02','r0_c2_light_floor_pattern_01','r0_c3_light_floor_pattern_02','r0_c4_light_floor_speckled_01','r0_c5_light_wall_horizontal_01','r0_c6_light_wall_horizontal_02','r0_c7_light_wall_corner_01'),
            @('r1_c0_light_floor_tile_03','r1_c1_light_floor_tile_04','r1_c2_light_floor_pattern_03','r1_c3_light_floor_pattern_04','r1_c4_light_floor_speckled_02','r1_c5_light_wall_horizontal_03','r1_c6_light_wall_vertical_01','r1_c7_light_wall_corner_02'),
            @('r2_c0_light_floor_tile_05','r2_c1_light_floor_tile_06','r2_c2_light_floor_pattern_05','r2_c3_light_floor_pattern_06','r2_c4_light_floor_speckled_03','r2_c5_light_wall_horizontal_04','r2_c6_light_wall_vertical_02','r2_c7_light_wall_vertical_03'),
            @('r3_c0_light_floor_tile_07','r3_c1_light_floor_tile_08','r3_c2_light_floor_pattern_07','r3_c3_light_floor_pattern_08','r3_c4_light_floor_speckled_04','r3_c5_light_wall_horizontal_shutter_01','r3_c6_light_wall_vertical_04','r3_c7_light_wall_vertical_05'),
            @('r4_c0_dark_floor_tile_01','r4_c1_dark_floor_tile_02','r4_c2_dark_floor_pattern_01','r4_c3_dark_floor_pattern_02','r4_c4_dark_floor_speckled_01','r4_c5_dark_wall_corner_01','r4_c6_dark_wall_vertical_01','r4_c7_dark_wall_corner_02'),
            @('r5_c0_dark_floor_tile_03','r5_c1_dark_floor_tile_04','r5_c2_dark_floor_pattern_03','r5_c3_dark_floor_pattern_04','r5_c4_dark_floor_speckled_02','r5_c5_dark_wall_horizontal_01','r5_c6_dark_wall_vertical_02','r5_c7_dark_wall_vertical_03'),
            @('r6_c0_corridor_floor_tile_horizontal_01','r6_c1_dark_floor_tile_05','r6_c2_dark_floor_pattern_05','r6_c3_corridor_floor_tile_vertical_01','r6_c4_dark_floor_speckled_03','r6_c5_dark_wall_horizontal_02','r6_c6_dark_wall_vertical_04','r6_c7_dark_wall_corner_03'),
            @('r7_c0_corridor_floor_tile_horizontal_02','r7_c1_dark_floor_tile_06','r7_c2_dark_floor_pattern_06','r7_c3_corridor_floor_tile_vertical_02','r7_c4_dark_floor_speckled_04','r7_c5_dark_wall_corner_04','r7_c6_dark_wall_vertical_05','r7_c7_decorative_star_tile_01')
        )
    },
    @{
        Source = Join-Path $workspace 'assets\rawgenerated\Untitled design (2).png'
        OutputDir = Join-Path $workspace 'assets\source\furniture\sheet_untitled_design_2'
        Manifest = Join-Path $workspace 'assets\source\furniture\sheet_untitled_design_2\manifest.csv'
        Names = @(
            @('r0_c0_desk_wood_01','r0_c1_desk_wood_02','r0_c2_round_table_01','r0_c3_desk_wood_03','r0_c4_desk_wood_04','r0_c5_desk_wood_05','r0_c6_desk_with_computer_01','r0_c7_curved_counter_wood_01'),
            @('r1_c0_workstation_01','r1_c1_workstation_02','r1_c2_round_table_02','r1_c3_workstation_03','r1_c4_workstation_04','r1_c5_curved_counter_blue_left_01','r1_c6_curved_counter_blue_right_01','r1_c7_desk_with_computer_02'),
            @('r2_c0_office_chair_01','r2_c1_office_chair_02','r2_c2_round_stool_01','r2_c3_office_chair_03','r2_c4_office_chair_04','r2_c5_round_stool_02','r2_c6_narrow_cabinet_01','r2_c7_lounge_chair_01'),
            @('r3_c0_office_chair_05','r3_c1_office_chair_06','r3_c2_round_stool_03','r3_c3_office_chair_07','r3_c4_office_chair_08','r3_c5_narrow_cabinet_02','r3_c6_accent_chair_01','r3_c7_lounge_chair_02'),
            @('r4_c0_dark_cabinet_01','r4_c1_oval_table_01_left','r4_c2_oval_table_01_center','r4_c3_oval_table_01_right','r4_c4_beige_counter_or_divider_01','r4_c5_curved_counter_brown_left_01','r4_c6_curved_counter_brown_right_01','r4_c7_tall_cabinet_01'),
            @('r5_c0_dark_cabinet_02','r5_c1_oval_table_02_left','r5_c2_oval_table_02_center','r5_c3_oval_table_02_right','r5_c4_beige_counter_or_divider_02','r5_c5_curved_counter_brown_left_02','r5_c6_curved_counter_brown_right_02','r5_c7_elevator_door_01'),
            @('r6_c0_potted_tree_01','r6_c1_potted_palm_01','r6_c2_potted_plant_01','r6_c3_potted_plant_02','r6_c4_potted_bush_01','r6_c5_planter_box_rectangular_01','r6_c6_potted_palm_02','r6_c7_planter_box_square_01'),
            @('r7_c0_display_or_monitor_01','r7_c1_curved_counter_white_01','r7_c2_water_dispenser_01','r7_c3_vending_machine_or_appliance_01','r7_c4_server_rack_01','r7_c5_terminal_kiosk_01','r7_c6_waiting_bench_01','r7_c7_trash_bin_01')
        )
    }
)

foreach ($job in $jobs) {
    if (-not (Test-Path $job.Source)) {
        throw "Source image not found: $($job.Source)"
    }

    New-Item -ItemType Directory -Force -Path $job.OutputDir | Out-Null
    Get-ChildItem -LiteralPath $job.OutputDir -File -ErrorAction SilentlyContinue | ForEach-Object {
        Remove-Item -LiteralPath $_.FullName -Force
    }
    $bitmap = [System.Drawing.Bitmap]::FromFile($job.Source)

    if ($bitmap.Width -ne 256 -or $bitmap.Height -ne 256) {
        $bitmap.Dispose()
        throw "Expected 256x256 sheet, got $($bitmap.Width)x$($bitmap.Height) for $($job.Source)"
    }

    $manifestRows = New-Object System.Collections.Generic.List[object]

    for ($row = 0; $row -lt 8; $row++) {
        for ($col = 0; $col -lt 8; $col++) {
            $name = $job.Names[$row][$col]
            $crop = New-Object System.Drawing.Bitmap 32, 32
            $graphics = [System.Drawing.Graphics]::FromImage($crop)
            $graphics.DrawImage(
                $bitmap,
                (New-Object System.Drawing.Rectangle 0, 0, 32, 32),
                (New-Object System.Drawing.Rectangle ($col * 32), ($row * 32), 32, 32),
                [System.Drawing.GraphicsUnit]::Pixel
            )
            $graphics.Dispose()

            $nonTransparent = 0
            for ($y = 0; $y -lt 32; $y++) {
                for ($x = 0; $x -lt 32; $x++) {
                    $px = $crop.GetPixel($x, $y)
                    if ($px.A -gt 10) { $nonTransparent++ }
                }
            }

            $outputPath = Join-Path $job.OutputDir "$name.png"
            $crop.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
            $crop.Dispose()

            $manifestRows.Add([PSCustomObject]@{
                row = $row
                col = $col
                filename = "$name.png"
                nonTransparentPixels = $nonTransparent
            }) | Out-Null
        }
    }

    $bitmap.Dispose()
    $manifestRows | Export-Csv -Path $job.Manifest -NoTypeInformation
}

Write-Host "Finished slicing both rawgenerated sheets."
