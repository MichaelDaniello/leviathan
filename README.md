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

## Credits

GM: VEGA (Ship AI)  
System: Custom 2d6 + stat modifier  
Inspiration: Dungeon Crawler Carl, Firefly, Hitchhiker's Guide

---

*"Try not to die. It's bad for morale."*  
— VEGA
