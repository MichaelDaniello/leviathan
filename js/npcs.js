(function () {
  const INDEX_PATH = 'data/npcs/index.json';
  const BASE_PATH = 'data/npcs/';
  const FALLBACK_FILES = [
    'brother-cassius.json',
    'captain-renner.json',
    'dax.json',
    'inspector-nakamura.json',
    'jace-cole.json',
    'mira-vex.json'
  ];

  const factionLabels = {
    architects: 'Church of the Architects',
    syndicates: 'Syndicates',
    sovereignty: 'Sovereignty',
    independent: 'Independent',
    hollow: 'Hollow'
  };

  const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const capitalize = (value) => {
    const text = String(value || 'Unknown');
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  const loadJson = async (path) => {
    try {
      const response = await fetch(path);
      if (!response.ok) return null;
      return await response.json();
    } catch (err) {
      return null;
    }
  };

  const loadDirectoryFileList = async () => {
    try {
      const response = await fetch(BASE_PATH);
      if (!response.ok) return null;
      const text = await response.text();
      const matches = [...text.matchAll(/href="([^"]+\.json)"/g)].map((m) => m[1]);
      if (matches.length === 0) return null;
      return [...new Set(matches.map((name) => name.replace(/^\.\//, '')))].sort();
    } catch (err) {
      return null;
    }
  };

  const loadNpcFileList = async () => {
    const indexed = await loadJson(INDEX_PATH);
    if (indexed && Array.isArray(indexed.files) && indexed.files.length > 0) {
      return indexed.files;
    }

    const fromDirectory = await loadDirectoryFileList();
    if (fromDirectory && fromDirectory.length > 0) {
      return fromDirectory;
    }

    return FALLBACK_FILES;
  };

  const npcClassForType = (npcType) => {
    if (npcType === 'threat') return 'threat';
    if (npcType === 'contact' || npcType === 'npc') return 'contact';
    if (npcType === 'complication' || npcType === 'antagonist') return 'unknown';
    return 'neutral';
  };

  const dispositionForNpc = (npc) => {
    const relation = npc?.relationships?.leviathan_crew?.disposition;
    if (relation) return relation;

    const status = String(npc?.status || '').toLowerCase();
    if (status === 'extracted') return 'Extracted / Cooperative';
    if (status === 'active') return 'Active';
    if (status === 'unknown') return 'Unknown';
    return 'Unclear';
  };

  const dispositionClass = (disposition) => {
    const value = String(disposition || '').toLowerCase();
    if (value.includes('hostile')) return 'hostile';
    if (value.includes('friendly') || value.includes('cooperative')) return 'friendly';
    if (value.includes('unknown')) return 'unknown';
    return 'neutral';
  };

  const sectionForNpc = (npc) => {
    const type = String(npc?.type || '').toLowerCase();
    if (type === 'threat') return 'threats';
    if (type === 'contact') return 'contacts';
    if (type === 'npc' && String(npc?.status || '').toLowerCase() === 'extracted') return 'contacts';
    if (type === 'npc') return 'contacts';
    return 'complications';
  };

  const renderNpcCard = (npc) => {
    const npcType = String(npc?.type || 'npc').toLowerCase();
    const cardClass = npcClassForType(npcType);
    const faction = String(npc?.faction || 'independent').toLowerCase();
    const factionLabel = factionLabels[faction] || capitalize(faction);
    const quote = Array.isArray(npc?.quotes) && npc.quotes.length > 0 ? npc.quotes[0] : null;
    const traits = Array.isArray(npc?.personality?.traits) ? npc.personality.traits.slice(0, 4) : [];
    const disposition = dispositionForNpc(npc);
    const dispClass = dispositionClass(disposition);

    return `
      <article class="npc-card ${escapeHtml(cardClass)}">
        <div class="npc-header">
          <div class="npc-name">${escapeHtml(npc?.name || 'Unknown')}</div>
          <div class="npc-role">${escapeHtml(npc?.role || 'Unknown Role')}</div>
          <span class="npc-faction ${escapeHtml(faction)}">${escapeHtml(factionLabel)}</span>
        </div>
        <div class="npc-body">
          <div class="npc-desc">${escapeHtml(npc?.description || 'No profile available.')}</div>
          <div class="npc-traits">
            ${traits.map((trait) => `<span class="trait-tag">${escapeHtml(trait)}</span>`).join('')}
          </div>
          ${quote ? `<div class="npc-quote ${cardClass === 'threat' ? 'threat' : ''}">"${escapeHtml(quote)}"</div>` : ''}
          <div class="disposition">
            <span class="disposition-label">Disposition:</span>
            <span class="disposition-value ${escapeHtml(dispClass)}">${escapeHtml(capitalize(disposition))}</span>
          </div>
        </div>
      </article>
    `;
  };

  const renderSection = (containerId, npcs) => {
    const container = document.getElementById(containerId);
    if (!container || !Array.isArray(npcs) || npcs.length === 0) return;

    const sorted = [...npcs].sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
    container.innerHTML = sorted.map(renderNpcCard).join('');
  };

  const init = async () => {
    const files = await loadNpcFileList();
    const loaded = [];

    for (const file of files) {
      const npc = await loadJson(`${BASE_PATH}${file}`);
      if (npc) loaded.push(npc);
    }

    if (loaded.length === 0) return;

    const contacts = loaded.filter((npc) => sectionForNpc(npc) === 'contacts');
    const complications = loaded.filter((npc) => sectionForNpc(npc) === 'complications');
    const threats = loaded.filter((npc) => sectionForNpc(npc) === 'threats');

    renderSection('contacts-grid', contacts);
    renderSection('complications-grid', complications);
    renderSection('threats-grid', threats);
  };

  document.addEventListener('DOMContentLoaded', init);
}());
