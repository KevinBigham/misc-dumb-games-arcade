// ===== ui/main.js — boot =====
(async function boot() {
  await Store.open();
  const hot = window.claude && window.claude.hot;
  if (hot && hot.snapshot) { try { hot.snapshot(() => ({ slot: App.slot, route: App.route })); } catch (e) { } }
  const start = async (data) => {
    if (data && data.slot) { const ok = await loadSlot(data.slot); if (ok && data.route && Screens[data.route] && !['game', 'new'].includes(data.route)) go(data.route); return; }
    render();
  };
  if (hot && hot.ready) hot.ready(start); else start((hot && hot.data) || {});
})();
