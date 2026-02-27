(function (global) {
  const DEFAULT_WORLD_STATE_PATH = 'data/world_state.json';
  const SEVERITY_LEVELS = new Set(['high', 'medium', 'low']);

  let cachedState = null;
  let pendingLoad = null;

  const normalizeSeverity = (value) => {
    const severity = String(value || 'low').toLowerCase();
    return SEVERITY_LEVELS.has(severity) ? severity : 'low';
  };

  const toSafeText = (value, fallback = '') => {
    if (value === null || value === undefined) return fallback;
    return String(value);
  };

  const fetchWorldState = async (path = DEFAULT_WORLD_STATE_PATH, options = {}) => {
    if (!options.force && cachedState) return cachedState;
    if (!options.force && pendingLoad) return pendingLoad;

    pendingLoad = (async () => {
      try {
        const response = await fetch(path);
        if (!response.ok) return null;

        const payload = await response.json();
        cachedState = payload;
        return payload;
      } catch (err) {
        return null;
      } finally {
        pendingLoad = null;
      }
    })();

    return pendingLoad;
  };

  const getActiveAlerts = (state) => {
    const alerts = state && Array.isArray(state.active_alerts) ? state.active_alerts : [];
    return alerts.filter((alert) => alert && typeof alert === 'object');
  };

  const renderActiveAlerts = (container, state, options = {}) => {
    if (!container) return;

    const alerts = getActiveAlerts(state);
    const panel = container.closest('.panel');
    const hideWhenEmpty = Boolean(options.hideWhenEmpty);
    const emptyMessage = toSafeText(options.emptyMessage, 'No active alerts.');

    container.textContent = '';

    if (alerts.length === 0) {
      if (hideWhenEmpty && panel) {
        panel.hidden = true;
        return;
      }
      if (panel) panel.hidden = false;

      const emptyEl = document.createElement('p');
      emptyEl.className = 'alerts-empty';
      emptyEl.textContent = emptyMessage;
      container.appendChild(emptyEl);
      return;
    }

    if (panel) panel.hidden = false;

    const list = document.createElement('div');
    list.className = 'alerts-list';

    alerts.forEach((alert) => {
      const severity = normalizeSeverity(alert.severity);
      const item = document.createElement('article');
      item.className = `alert-item severity-${severity}`;

      const header = document.createElement('div');
      header.className = 'alert-header';

      const badge = document.createElement('span');
      badge.className = `alert-severity severity-${severity}`;
      badge.textContent = severity;

      const title = document.createElement('h3');
      title.className = 'alert-title';
      title.textContent = toSafeText(alert.title, 'Unnamed alert');

      header.appendChild(badge);
      header.appendChild(title);

      const detail = document.createElement('p');
      detail.className = 'alert-detail';
      detail.textContent = toSafeText(alert.detail, 'No detail available.');

      item.appendChild(header);
      item.appendChild(detail);
      list.appendChild(item);
    });

    container.appendChild(list);
  };

  global.LeviathanWorldState = {
    fetchWorldState,
    getActiveAlerts,
    renderActiveAlerts
  };
}(window));
