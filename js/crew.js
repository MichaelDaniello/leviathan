/**
 * LEVIATHAN Crew Manifest Loader
 * Dynamically loads character JSON files and renders crew cards
 */

const CrewManifest = {
  characters: [],
  
  /**
   * Load all crew character files
   */
  async loadCrew() {
    const crewFiles = [
      'data/characters/vega.json',
      'data/characters/draven-frost.json',
      'data/characters/d-volt.json',
      'data/characters/echo.json'
    ];
    
    this.characters = [];
    
    for (const file of crewFiles) {
      try {
        const response = await fetch(file);
        if (response.ok) {
          const data = await response.json();
          this.characters.push(data);
        }
      } catch (err) {
        console.warn(`[VEGA] Could not load ${file}:`, err.message);
      }
    }
    
    return this.characters;
  },
  
  /**
   * Get stat modifier display
   */
  getModifierDisplay(value) {
    if (value === null || value === undefined || value === '∞') return '∞';
    if (value === 'undefined' || value === '?') return '?';
    const mod = Dice.getModifier(value);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  },
  
  /**
   * Render a single crew card
   */
  renderCard(char) {
    const isAI = char.meta?.type === 'npc_crew' || char.identity?.species?.includes('Synthetic Intelligence');
    const isNPC = char.meta?.type === 'npc_crew';
    
    // Build stats display
    let statsHtml = '';
    if (char.stats) {
      const displayStats = isAI 
        ? ['tech', 'wits', 'charm']
        : ['grit', 'reflex', 'tech', 'wits', 'nerve', 'charm'];
      
      statsHtml = displayStats.map(stat => {
        const value = char.stats[stat];
        const display = (value === null || value === undefined) ? '—' : 
                       (value === '∞' || value === 'undefined' || value === '?') ? value :
                       value;
        return `
          <div class="stat">
            <div class="stat-label">${stat.toUpperCase()}</div>
            <div class="stat-value">${display}</div>
          </div>
        `;
      }).join('');
    }
    
    // Build description
    let description = '';
    if (char.personality?.traits) {
      description = char.personality.traits.slice(0, 3).join('. ') + '.';
    } else if (char.identity?.background) {
      description = char.identity.background.length > 150 
        ? char.identity.background.substring(0, 150) + '...'
        : char.identity.background;
    }
    
    // Build edge display
    let edgeHtml = '';
    if (char.edge?.name && !isNPC) {
      edgeHtml = `
        <div class="edge-display">
          <span class="edge-label">EDGE:</span> 
          <span class="edge-name">${char.edge.name}</span>
        </div>
      `;
    }
    
    // HP display for player characters
    let hpHtml = '';
    if (char.derived?.hp_max && !isNPC) {
      hpHtml = `
        <div class="hp-display">
          <span class="hp-label">HP:</span> 
          <span class="hp-value">${char.derived.hp_current}/${char.derived.hp_max}</span>
        </div>
      `;
    }
    
    // Player tag
    const playerTag = char.meta?.player && char.meta.player !== 'GM/AI' 
      ? `<span class="player-tag">Player: ${char.meta.player}</span>`
      : '';
    
    return `
      <div class="card ${isAI ? 'ai-card' : ''}">
        <div class="card-title">${char.identity?.callsign || char.identity?.name || 'Unknown'}</div>
        <div class="card-subtitle">${char.identity?.role || 'Crew'} · ${char.identity?.species || 'Unknown'}</div>
        ${playerTag ? `<div class="player-info">${playerTag}</div>` : ''}
        <p class="text-dim mb-2" style="font-size: 0.85rem;">${description}</p>
        ${hpHtml}
        ${edgeHtml}
        <div class="card-stats">${statsHtml}</div>
      </div>
    `;
  },
  
  /**
   * Render all crew to the manifest grid
   */
  async renderManifest(containerId = 'crew-grid') {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error('[VEGA] Crew grid container not found');
      return;
    }
    
    await this.loadCrew();
    
    if (this.characters.length === 0) {
      container.innerHTML = `
        <div class="card">
          <div class="empty-state">
            <h3>Awaiting Crew</h3>
            <p>No crew members registered.</p>
          </div>
        </div>
      `;
      return;
    }
    
    container.innerHTML = this.characters.map(char => this.renderCard(char)).join('');
    console.log(`[VEGA] Crew manifest loaded: ${this.characters.length} entries`);
  }
};

// Auto-initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('crew-grid')) {
    CrewManifest.renderManifest();
  }
});
