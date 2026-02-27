# LEVIATHAN

A brutal, absurd sci-fi LitRPG campaign tracker.

> *The universe is trying to kill you. It's also deeply stupid in ways that make survival almost funny.*

## What Is This?

A living campaign site for **Leviathan** — a Firefly-meets-Dungeon-Crawler-Carl sci-fi RPG. Track characters, missions, factions, inventory, and narrative history as the story unfolds.

## The Ship

**LVN-0017 Leviathan** — Ouroboros-class Deep Salvage Vessel. Held together by duct tape, spite, and an AI that knows too much.

## Tech Stack

- Static HTML/CSS/JS
- JSON data layer (characters, NPCs, factions, locations, inventory, sessions)
- GitHub Pages hosting
- Campaign updates via commits

## Structure

```
├── index.html          # Crew manifest / dashboard
├── css/terminal.css    # Grimy sci-fi terminal aesthetic
├── js/dice.js          # Roll engine (2d6 + stat mod)
├── data/
│   ├── ship.json       # Leviathan specs
│   ├── inventory.json  # Ship stores, armory, cargo
│   ├── characters/     # Player and NPC crew
│   ├── factions/       # Power players
│   ├── locations/      # Star systems, stations
│   └── sessions/       # Mission logs
├── terminals/          # Interactive fake consoles
└── lore/
    ├── character-creation.md
    └── world-bible.md
```

## Playing

Sessions run via Discord. The site serves as the campaign's "source of truth" — updated after each session with new characters, mission logs, inventory changes, and narrative developments.

## Breakpoint Update Process

For each session breakpoint, update these files:

1. `data/world_state.json`
   - Set `current_arc`, `current_session_id`, `current_mission_target`
   - Update `leviathan.current_location_id`
   - Update `map.markers` positions and `map.travel_route` endpoints
   - Update `active_alerts`
   - Update `inventory_summary` (credits, fuel, med status)
2. `data/arcs/arc-1.json` (or the current arc file)
   - Add mission progression entries in `progression`
   - Update `active_mission` and `intel_warning`
3. `data/npcs/*.json`
   - Update NPC status/notes and add newly relevant contacts (for example extracted survivors)
4. `data/npcs/index.json`
   - Add new NPC file names so the Contacts page auto-loads them

What updates automatically after that:

- `galaxy.html` reads map marker positions and travel route from `world_state.json`
- `missions.html` reads arc mission progression from `data/arcs/<arc-id>.json`
- `npcs.html` loads NPC cards from `data/npcs/index.json` and the referenced `data/npcs/*.json` files

## Credits

GM: VEGA (Ship AI)  
System: Custom 2d6 + stat modifier  
Inspiration: Dungeon Crawler Carl, Firefly, Hitchhiker's Guide

---

*"Try not to die. It's bad for morale."*  
— VEGA
