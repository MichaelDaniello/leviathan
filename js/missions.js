(function () {
  const DEFAULT_ARC_ID = 'arc-1';

  const loadJson = async (path) => {
    try {
      const response = await fetch(path);
      if (!response.ok) return null;
      return await response.json();
    } catch (err) {
      return null;
    }
  };

  const safeText = (value, fallback = '') => {
    if (value === null || value === undefined) return fallback;
    return String(value);
  };

  const renderArcHeader = (arc) => {
    const header = document.getElementById('arc-header');
    if (!header || !arc) return;

    header.innerHTML = `
      <div class="arc-title">${safeText(arc.title, 'ARC')}</div>
      <div class="arc-subtitle">"${safeText(arc.subtitle, 'No subtitle available.')}"</div>
    `;
  };

  const renderActiveMission = (mission) => {
    const card = document.getElementById('active-mission-card');
    if (!card || !mission) return;

    const status = safeText(mission.status, 'active').toLowerCase();
    const threatClass = status === 'completed' ? '' : 'warning';
    const crew = Array.isArray(mission.crew) ? mission.crew : [];

    card.classList.remove('active', 'pending');
    card.classList.add(status === 'pending' ? 'pending' : 'active');

    card.innerHTML = `
      <div class="mission-header">
        <div class="mission-title">${safeText(mission.title, 'Mission')}</div>
        <span class="mission-status ${status === 'pending' ? 'pending' : 'active'}">${safeText(mission.status, 'Active')}</span>
      </div>
      <div class="mission-objective">${safeText(mission.objective, '')}</div>
      <div class="mission-details">
        <div class="detail-row">
          <span class="detail-label">Client</span>
          <span class="detail-value">${safeText(mission.client, 'Unknown')}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Target</span>
          <span class="detail-value">${safeText(mission.target, 'Unknown')}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Objective</span>
          <span class="detail-value">${safeText(mission.objective, 'Unspecified')}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Payment</span>
          <span class="detail-value">${safeText(mission.payment, 'Unknown')}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Threat Level</span>
          <span class="detail-value ${threatClass}">${safeText(mission.threat_level, 'Unknown')}</span>
        </div>
      </div>
      <div class="crew-involved">
        ${crew.map((name) => `<span class="crew-tag">${safeText(name)}</span>`).join('')}
      </div>
    `;
  };

  const renderIntelWarning = (message) => {
    const intel = document.getElementById('intel-warning');
    if (!intel || !message) return;
    intel.innerHTML = `
      <h4>⚠ VEGA ANALYSIS</h4>
      <p>${safeText(message)}</p>
    `;
  };

  const renderProgression = (entries) => {
    const archive = document.getElementById('mission-archive');
    if (!archive || !Array.isArray(entries) || entries.length === 0) return;

    const sorted = [...entries].sort((a, b) => {
      const aDate = safeText(a.date, '');
      const bDate = safeText(b.date, '');
      return aDate.localeCompare(bDate);
    });

    archive.innerHTML = `
      <div class="progress-list">
        ${sorted.map((entry) => {
          const status = safeText(entry.status, 'pending').toLowerCase();
          return `
            <article class="progress-entry ${status}">
              <div class="progress-meta">
                <span>${safeText(entry.date, 'Unknown Date')}</span>
                <span>${safeText(entry.status, 'Pending')}</span>
              </div>
              <h3 class="progress-title">${safeText(entry.title, 'Progress Update')}</h3>
              <p class="progress-summary">${safeText(entry.summary, '')}</p>
            </article>
          `;
        }).join('')}
      </div>
    `;
  };

  const renderStats = (entries, activeMission) => {
    const missionsEl = document.getElementById('stat-missions-complete');
    const sessionsEl = document.getElementById('stat-total-sessions');
    const deathsEl = document.getElementById('stat-crew-deaths');

    if (!missionsEl || !sessionsEl || !deathsEl) return;

    const progression = Array.isArray(entries) ? entries : [];
    const completedMilestones = progression.filter((entry) => safeText(entry.status, '').toLowerCase() === 'completed').length;
    const uniqueSessions = new Set(progression.map((entry) => safeText(entry.session_id, '')).filter(Boolean));
    const missionsComplete = safeText(activeMission?.status, '').toLowerCase() === 'completed' ? 1 : 0;

    missionsEl.textContent = String(missionsComplete);
    sessionsEl.textContent = String(uniqueSessions.size || 1);
    deathsEl.textContent = '0';

    if (completedMilestones > 0) {
      missionsEl.title = `${completedMilestones} completed progression milestones`; // Optional detail without changing UI.
    }
  };

  const init = async () => {
    const worldState = await loadJson('data/world_state.json');
    const arcId = safeText(worldState?.current_arc, DEFAULT_ARC_ID);
    const arc = await loadJson(`data/arcs/${arcId}.json`) || await loadJson(`data/arcs/${DEFAULT_ARC_ID}.json`);

    if (!arc) return;

    renderArcHeader(arc);
    renderActiveMission(arc.active_mission);
    renderIntelWarning(arc.intel_warning);
    renderProgression(arc.progression);
    renderStats(arc.progression, arc.active_mission);
  };

  document.addEventListener('DOMContentLoaded', init);
}());
