// ===== ui/cloud.js — optional cloud saves (private per viewer) when running as a published page =====
const Cloud = {
  state: 'unknown', db: null, uid: null, list: null, busy: false,
  async init() {
    if (this.state !== 'unknown') return this.state;
    if (!(window.claude && window.claude.use)) { this.state = 'off'; return this.state; }
    this.state = 'checking';
    try {
      const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
      const uid = user ? await user.id() : null;
      if (!db || !uid) { this.state = 'off'; return this.state; }
      this.db = db; this.uid = uid; this.state = 'on';
    } catch (e) { this.state = 'off'; }
    return this.state;
  },
  base() { return 'data/users/' + this.uid; },
  async index() {
    const snap = await this.db.doc(this.base() + '/cloud_index').get();
    const d = snap.exists ? snap.data() : null;
    this.list = d && Array.isArray(d.saves) ? d.saves.map(x => Object.assign({}, x)) : [];
    return this.list;
  },
  async pack(text) {
    if (typeof CompressionStream === 'undefined') return { enc: 'raw', data: text };
    const stream = new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'));
    const buf = new Uint8Array(await new Response(stream).arrayBuffer());
    let bin = ''; for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
    return { enc: 'gz64', data: btoa(bin) };
  },
  async unpack(enc, data) {
    if (enc === 'raw') return data;
    const bin = atob(data); const buf = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    const stream = new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip'));
    return await new Response(stream).text();
  },
  async upload(S, key) {
    const packed = await this.pack(JSON.stringify(S));
    const CH = 180000;
    const n = Math.ceil(packed.data.length / CH);
    for (let i = 0; i < n; i++) await this.db.doc(`${this.base()}/c_${key}_${i}`).set({ d: packed.data.slice(i * CH, (i + 1) * CH) });
    const list = await this.index();
    const old = list.find(x => x.key === key);
    const meta = Object.assign(saveMeta(S, key), { chunks: n, enc: packed.enc, kb: Math.round(packed.data.length / 1024) });
    const next = list.filter(x => x.key !== key); next.unshift(meta);
    await this.db.doc(this.base() + '/cloud_index').set({ saves: next.slice(0, 12) });
    if (old && old.chunks > n) for (let i = n; i < old.chunks; i++) await this.db.doc(`${this.base()}/c_${key}_${i}`).delete();
    this.list = next;
  },
  async download(meta) {
    let data = '';
    for (let i = 0; i < meta.chunks; i++) { const s = await this.db.doc(`${this.base()}/c_${meta.key}_${i}`).get(); if (!s.exists) throw new Error('A piece of this save is missing.'); data += s.data().d; }
    return JSON.parse(await this.unpack(meta.enc, data));
  },
  async remove(meta) {
    for (let i = 0; i < meta.chunks; i++) await this.db.doc(`${this.base()}/c_${meta.key}_${i}`).delete();
    const list = (await this.index()).filter(x => x.key !== meta.key);
    await this.db.doc(this.base() + '/cloud_index').set({ saves: list });
    this.list = list;
  },
};
function cloudPanel(bare) {
  const panel_ = (t, b) => bare ? b : panel(t, b);
  const st = Cloud.state;
  if (st === 'off') return panel_('Cloud Saves', '<p class="small mute" style="margin:0">Cloud saves work when you play from the published link while signed in. Use Export / Import to move a franchise between browsers.</p>');
  if (st !== 'on') return panel_('Cloud Saves', '<p class="small mute" style="margin:0">Checking for cloud storage…</p>');
  const rows = (Cloud.list || []).map(m => `<div class="row between" style="padding:8px 0;border-bottom:1px solid var(--line)"><div class="small"><b>${E(m.team)}</b> · ${E(m.phaseLine)} · ${m.w}-${m.l}<div class="tiny mute">uploaded ${new Date(m.ts).toLocaleString()} · ${m.kb} KB</div></div><div class="row tight">${btn('Load', 'cloudLoad', 'sm gold', { k: m.key })}${btn('Delete', 'cloudDel', 'sm red', { k: m.key })}</div></div>`).join('');
  return panel_('Cloud Saves', `<p class="small mute" style="margin-top:0">Private to you. Upload this franchise, then load it from any device where you open this page.</p>${App.S ? `<div class="row">${btn('Upload This Franchise', 'cloudUp', 'gold')}</div>` : ''}<div style="margin-top:8px">${Cloud.list ? rows || '<div class="empty small">No cloud saves yet.</div>' : '<div class="small mute">Loading list…</div>'}</div>`);
}
async function cloudRefresh() {
  await Cloud.init();
  if (Cloud.state === 'on' && !Cloud.list) { try { await Cloud.index(); } catch (e) { Cloud.list = []; } }
  const el = $('#cloudSlot'); if (el) el.innerHTML = cloudPanel(el.dataset.bare === '1');
}
Act.cloudUp = async () => {
  if (Cloud.busy) return; Cloud.busy = true;
  busy('Uploading', 'Compressing your franchise…');
  try { await Cloud.upload(App.S, App.slot); toast('Uploaded to your cloud saves.', 'good'); }
  catch (e) { toast(e && e.code === 'quota_exceeded' ? 'Cloud storage is full. Delete an old cloud save first.' : 'Upload failed: ' + ((e && e.message) || 'unknown error'), 'bad'); }
  busy(null); Cloud.busy = false; cloudRefresh();
};
Act.cloudLoad = async el => {
  const m = (Cloud.list || []).find(x => x.key === el.dataset.k); if (!m) return;
  busy('Downloading', 'Unpacking your franchise…');
  try { const S = await Cloud.download(m); busy(null); startWith(S, m.key); await saveNow(true); toast('Franchise loaded from the cloud.', 'good'); }
  catch (e) { busy(null); toast('Download failed: ' + ((e && e.message) || 'unknown error'), 'bad'); }
};
Act.cloudDel = el => {
  const m = (Cloud.list || []).find(x => x.key === el.dataset.k); if (!m) return;
  confirmBox('Delete cloud save?', 'This removes the uploaded copy. Saves in this browser are not affected.', 'Delete', async () => {
    try { await Cloud.remove(m); toast('Cloud save deleted.'); } catch (e) { toast('Delete failed.', 'bad'); }
    cloudRefresh();
  }, 'red');
};
