# Assets Folder Contract

This folder now separates:

- raw AI generations
- reviewed/selected source assets
- final runtime sprite sheets
- scene reference art
- future layout blueprints

## Structure

```text
assets/
  prompts/
    AI_IMAGE_GENERATION_GUIDE.md

  source/
    tiles/
    furniture/
    characters/
      boss/
      premium/
      general/
    elevator/
    particles/
    scenes/

  selected/
    tiles/
    furniture/
    characters/
    elevator/
    particles/
    scenes/

  sprites/
    tileset.png
    characters.png
    furniture.png
    elevator.png
    particles.png

  scenes/
    garage_home_office.png
    small_startup.png
    medium_office.png
    large_corporate_floor.png

  layouts/
```

## What Goes Where

## `assets/source/`

Use this for raw exports from ChatGPT, Gemini, or any other image generator.

Examples:

- `assets/source/tiles/floor_basic_a_v01.png`
- `assets/source/furniture/desk_standard_v03.png`
- `assets/source/characters/boss/boss_walk_down_strip_v02.png`
- `assets/source/elevator/elevator_closed_opening_v01.png`
- `assets/source/scenes/medium_office_concept_v01.png`

## `assets/selected/`

Use this for approved source assets after review, cleanup, background removal, or resizing.

Examples:

- `assets/selected/tiles/floor_basic_a.png`
- `assets/selected/furniture/desk_standard.png`
- `assets/selected/characters/boss_idle_f00.png`
- `assets/selected/elevator/car_closed_left.png`
- `assets/selected/particles/work_glow_dot.png`

## `assets/sprites/`

This is the runtime-ready folder used by the game.

Only final packed sprite sheets belong here:

- `tileset.png`
- `characters.png`
- `furniture.png`
- `elevator.png`
- `particles.png`

Nothing raw or experimental should be saved here.

## `assets/scenes/`

These are approved scene reference images only.

Important:

- keep using these as composition/style references
- do not use these as runtime gameplay backgrounds
- the actual game should render from `sprites/` + layout data

## `assets/layouts/`

This is where future scene blueprints should go.

Recommended future files:

- `garage_home_office.layout.json`
- `small_startup.layout.json`
- `medium_office.layout.json`
- `large_corporate_floor.layout.json`

These files should eventually define:

- room bounds
- tile IDs
- prop placements
- elevator position
- sign anchors
- spawn points

## Naming Rules

## Raw generations

Use versioned names:

- `<asset_name>_v01.png`
- `<asset_name>_v02.png`
- `<asset_name>_v03.png`

Examples:

- `server_rack_v01.png`
- `boss_idle_strip_v02.png`
- `garage_home_office_concept_v03.png`

## Selected assets

Remove version suffixes after approval:

- `server_rack.png`
- `boss_idle_f00.png`
- `boss_idle_f01.png`

## Character frame naming

Recommended naming format:

- `<role>_<variant>_<state>_f00.png`

Examples:

- `boss_v01_idle_f00.png`
- `premium_v02_walk_down_f03.png`
- `general_v04_walk_left_f01.png`

If you keep only one boss variant, omit the variant number:

- `boss_idle_f00.png`

## Recommended Workflow

1. Generate raw assets into `assets/source/`.
2. Review and clean them.
3. Move approved pieces into `assets/selected/`.
4. Sync reviewed source files into `public/raw_assets/` with `npm run sync:assets`.
5. Pack final runtime sheets into `assets/sprites/` if the runtime needs atlases.
6. Keep full-scene concept images in `assets/scenes/`.
7. Build actual game maps later in `assets/layouts/`.

## Rule To Follow

If an image is a whole office view, it belongs in `assets/source/scenes/` or `assets/scenes/`.

If an image is a reusable tile, prop, frame, or animation piece, it belongs in `assets/source/` first and ends up in `assets/sprites/` only after approval and packing.

Current runtime note:

The app currently loads individual PNGs from `public/raw_assets/`, so changes inside `assets/source/` do not affect the running app until you sync them with `npm run sync:assets`.
