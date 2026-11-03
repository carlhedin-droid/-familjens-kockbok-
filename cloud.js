/* Souschefen — inloggning och delning via Firebase (Google-konto + Firestore).
   Laddas före app.js. Allt som rör appens tillstånd (S, mergeData, render…) anropas först när appen körs. */
'use strict';

window.Cloud = (() => {
  const C = {
    auth: null, db: null, user: null, fid: null, family: null, key: '',
    unsubs: [], remote: { core: null, history: null, session: null, chat: null, recipes: {} },
    loaded: new Set(), written: {}, writeTimer: null, ready: false, error: '',
  };
  const NEED = ['core', 'history', 'session', 'chat', 'recipes', 'keys'];
  const clean = x => JSON.parse(JSON.stringify(x ?? null));
  const configured = () => !!window.FIREBASE_CONFIG;
  const SDK = 'https://cdn.jsdelivr.net/npm/firebase@12.19.0/';
  const loadScript = src => new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('Kunde inte ladda ' + src)); document.head.appendChild(s); });
  const active = () => configured() && !!C.fid && C.ready;
  const famRef = () => C.db.collection('families').doc(C.fid);
  const host = () => location.origin + location.pathname;

  async function init() {
    try {
      if (!window.firebase) for (const f of ['app', 'auth', 'firestore']) await loadScript(`${SDK}firebase-${f}-compat.js`);
    } catch (e) { C.error = e.message + '. Kontrollera internetuppkopplingen.'; if (S.route.view === 'login') renderStage(); return; }
    firebase.initializeApp(window.FIREBASE_CONFIG);
    C.auth = firebase.auth();
    C.db = firebase.firestore();
    try { C.db.enablePersistence({ synchronizeTabs: true }).catch(() => {}); } catch { }
    // Inbjudningslänk: #join=KOD
    const m = location.hash.match(/#join=([A-Za-z0-9-]+)/);
    if (m) { try { sessionStorage.setItem('fk.join', m[1]); } catch { } history.replaceState(null, '', location.pathname); }
    C.auth.getRedirectResult().catch(e => { C.error = authErr(e); if (S.route.view === 'login') renderStage(); });
    C.auth.onAuthStateChanged(onUser);
    if (S.route.view === 'login') renderStage();
  }
  function signedInHint() { try { return localStorage.getItem('fk.signedIn') === '1'; } catch { return false; } }

  async function onUser(user) {
    C.user = user;
    try { localStorage.setItem('fk.signedIn', user ? '1' : '0'); } catch { }
    detach();
    if (!user) { go('login'); return; }
    try {
      const u = await C.db.collection('users').doc(user.uid).get();
      const fid = u.exists && u.data().familyId;
      if (fid) { attach(fid); return; }
      const code = (() => { try { return sessionStorage.getItem('fk.join'); } catch { return null; } })();
      if (code) { await join(code); return; }
      go('family');
    } catch (e) { C.error = 'Kunde inte läsa kontot: ' + (e.message || e); go('family'); }
  }

  /* ---------- Inloggning ---------- */
  function authErr(e) {
    const c = e && e.code || '';
    if (/popup-closed|cancelled-popup/.test(c)) return '';
    if (/unauthorized-domain/.test(c)) return 'Domänen är inte godkänd i Firebase (Authentication → Settings → Authorized domains).';
    if (/network/.test(c)) return 'Ingen kontakt med Google. Kontrollera internetuppkopplingen.';
    return e.message || String(e);
  }
  async function signIn() {
    C.error = '';
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try { await C.auth.signInWithPopup(provider); }
    catch (e) {
      if (/popup-blocked|operation-not-supported/.test(e.code || '')) { await C.auth.signInWithRedirect(provider); return; }
      C.error = authErr(e); renderStage();
    }
  }
  async function signOut() {
    if (!confirm('Logga ut från Souschefen på den här enheten?')) return;
    detach(); C.fid = null; C.family = null; C.key = '';
    await C.auth.signOut();
  }

  /* ---------- Familj ---------- */
  function genCode() {
    const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = '';
    const r = crypto.getRandomValues(new Uint32Array(8));
    for (let i = 0; i < 8; i++) s += a[r[i] % a.length];
    return s;
  }
  async function create(name) {
    C.error = '';
    try {
      const uid = C.user.uid;
      const ref = C.db.collection('families').doc();
      await ref.set({ name: name || 'Vår familj', owner: uid, members: [uid], createdAt: firebase.firestore.FieldValue.serverTimestamp() });
      const code = genCode();
      await C.db.collection('joinCodes').doc(code).set({ familyId: ref.id });
      await ref.update({ joinCode: code });
      // Ta med det som redan finns på enheten: nyckel, kokbok, historik, inställningar
      if (S.settings.geminiKey) await ref.collection('private').doc('keys').set({ geminiKey: S.settings.geminiKey });
      await C.db.collection('users').doc(uid).set({ familyId: ref.id, email: C.user.email || '' });
      S.data.textUpdatedAt = now(); LS.set('fk.data', S.data);  // den här enhetens inställningar blir familjens
      attach(ref.id, { fresh: true });
    } catch (e) { C.error = 'Kunde inte skapa familjen: ' + (e.message || e); renderStage(); }
  }
  async function join(code) {
    C.error = '';
    code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    try {
      const jc = await C.db.collection('joinCodes').doc(code).get();
      if (!jc.exists) { C.error = 'Hittar ingen familj med den koden.'; try { sessionStorage.removeItem('fk.join'); } catch { } go('family'); return; }
      const fid = jc.data().familyId;
      await C.db.collection('families').doc(fid).update({ members: firebase.firestore.FieldValue.arrayUnion(C.user.uid) });
      await C.db.collection('users').doc(C.user.uid).set({ familyId: fid, email: C.user.email || '' });
      try { sessionStorage.removeItem('fk.join'); } catch { }
      toast('Du är med i familjen');
      attach(fid);
    } catch (e) { C.error = 'Kunde inte gå med: ' + (e.message || e); go('family'); }
  }

  /* ---------- Realtidssynk ---------- */
  function detach() { C.unsubs.forEach(u => { try { u(); } catch { } }); C.unsubs = []; C.ready = false; C.loaded = new Set(); }
  function attach(fid, opts = {}) {
    detach();
    C.fid = fid; C.remote = { core: null, history: null, session: null, chat: null, recipes: {} }; C.written = {};
    const f = famRef(), st = f.collection('state');
    const mark = part => { C.loaded.add(part); if (!C.ready && NEED.every(p => C.loaded.has(p))) firstLoad(opts); else if (C.ready) applyRemote(); };
    C.unsubs.push(f.onSnapshot(d => { C.family = d.exists ? d.data() : null; if (S.route.view === 'settings') renderStage(); }, err));
    C.unsubs.push(f.collection('private').doc('keys').onSnapshot(d => { C.key = (d.exists && d.data().geminiKey) || ''; mark('keys'); }, err));
    ['core', 'history', 'session', 'chat'].forEach(part => C.unsubs.push(st.doc(part).onSnapshot(d => {
      if (d.metadata.hasPendingWrites) return;
      C.remote[part] = d.exists ? d.data() : null; C.written[part] = JSON.stringify(C.remote[part] ?? null); mark(part);
    }, err)));
    C.unsubs.push(f.collection('recipes').onSnapshot(q => {
      if (q.metadata.hasPendingWrites) return;
      const r = {}; q.forEach(doc => { r[doc.id] = doc.data(); }); C.remote.recipes = r;
      Object.keys(r).forEach(id => { C.written['r:' + id] = JSON.stringify(r[id]); });
      mark('recipes');
    }, err));
  }
  function err(e) { console.warn('Firestore', e); setSync('Synk misslyckades', e.message || String(e)); }

  function remoteObject() {
    const R = C.remote, core = R.core || {};
    return {
      prefs: core.prefs, profile: core.profile, instructions: core.instructions, textUpdatedAt: core.textUpdatedAt || '1970-01-01T00:00:00.000Z',
      memory: core.memory || [], deleted: core.deleted || {},
      recipes: Object.values(R.recipes || {}),
      history: (R.history && R.history.items) || [],
      session: R.session && R.session.id ? R.session : null,
      chatSync: R.chat && R.chat.updatedAt ? R.chat : null,
    };
  }
  function firstLoad(opts) {
    C.ready = true;
    mergeData(remoteObject());
    LS.set('fk.data', S.data);
    setSync('Synkad', 'Realtid');
    // Nya familjer utan egna inställningar får introduktionen
    if (opts.fresh && !HAD_DATA && !S.settings.onboarded) { go('welcome'); }
    else if (!opts.fresh && !S.settings.onboarded) { S.settings.onboarded = true; saveSettings(); go(startView()); }
    else if (['login', 'family'].includes(S.route.view)) go(startView());
    afterMerge(); renderStatus();
    queueWrite(0);
  }
  function applyRemote() {
    const before = canon(S.data);
    mergeData(remoteObject());
    LS.set('fk.data', S.data);
    setSync('Synkad', 'Senast ' + new Date().toLocaleTimeString('sv-SE'));
    if (canon(S.data) !== before) afterMerge();
    queueWrite();
  }

  function queueWrite(ms = 700) {
    if (!active()) return;
    clearTimeout(C.writeTimer);
    C.writeTimer = setTimeout(flush, ms);
  }
  async function flush() {
    if (!active()) return;
    const D = S.data, st = famRef().collection('state'), batch = C.db.batch();
    let n = 0;
    const put = (key, ref, val) => { const j = JSON.stringify(val ?? null); if (C.written[key] !== j) { batch.set(ref, clean(val)); C.written[key] = j; n++; } };
    put('core', st.doc('core'), { prefs: D.prefs, profile: D.profile, instructions: D.instructions, textUpdatedAt: D.textUpdatedAt, memory: D.memory, deleted: D.deleted });
    put('history', st.doc('history'), { items: D.history || [] });
    if (D.session) put('session', st.doc('session'), D.session);
    if (D.chatSync) put('chat', st.doc('chat'), D.chatSync);
    const ids = new Set((D.recipes || []).map(r => r.id));
    (D.recipes || []).forEach(r => put('r:' + r.id, famRef().collection('recipes').doc(r.id), r));
    Object.keys(C.remote.recipes || {}).forEach(id => { if (!ids.has(id) && C.written['r:' + id] !== 'deleted') { batch.delete(famRef().collection('recipes').doc(id)); C.written['r:' + id] = 'deleted'; n++; } });
    if (!n) return;
    try { setSync('Sparar…'); await batch.commit(); setSync('Synkad', 'Senast ' + new Date().toLocaleTimeString('sv-SE')); }
    catch (e) { C.written = {}; err(e); }
  }
  async function saveKey(k) {
    if (!active()) return;
    await famRef().collection('private').doc('keys').set({ geminiKey: k });
    C.key = k;
  }

  /* ---------- Vyer ---------- */
  function viewLogin() {
    const busy = !C.auth || (signedInHint() && C.user === null && !C.error);
    return `<section class="welcome">
      <div class="w-card login-card">
        <h1>Souschefen</h1>
        <p class="w-lead">Familjens kockcoach och kokbok. Logga in med ert Google-konto – samma kokbok, historik och chatt på alla era enheter.</p>
        ${busy ? `<p class="muted">Loggar in…</p>` : `<button class="btn google-btn" data-signin>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#fff" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3Z"/><path fill="#fff" opacity=".85" d="M12 22c2.7 0 5-.9 6.6-2.5l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z"/><path fill="#fff" opacity=".7" d="M6.4 13.9a6 6 0 0 1 0-3.8V7.5H3.1a10 10 0 0 0 0 9l3.3-2.6Z"/><path fill="#fff" opacity=".55" d="M12 6c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 3.1 7.5l3.3 2.6C7.2 7.8 9.4 6 12 6Z"/></svg>
          Logga in med Google</button>`}
        ${C.error ? `<p class="status-line" style="color:var(--sambal)">${esc(C.error)}</p>` : ''}
        <p class="hint">Har ni fått en inbjudan från familjen? Logga in här, så kommer ni med automatiskt.</p>
      </div></section>`;
  }
  function viewFamily() {
    const code = (() => { try { return sessionStorage.getItem('fk.join') || ''; } catch { return ''; } })();
    return `<section class="welcome">
      <div class="w-card">
        <h1>Välkommen${C.user?.displayName ? ', ' + esc(C.user.displayName.split(' ')[0]) : ''}!</h1>
        <p class="w-lead">Är ni först i familjen? Skapa er familj. Har någon redan skapat den – gå med med familjekoden.</p>
        <div class="fam-cols">
          <div class="day-col"><h3>Skapa ny familj</h3>
            <div class="field"><label for="famName">Namn</label><input id="famName" placeholder="T.ex. Familjen Hedin" value="${esc(C.user?.displayName ? 'Familjen ' + C.user.displayName.split(' ').slice(-1)[0] : '')}"></div>
            <button class="btn" data-famcreate>Skapa familj</button>
            ${HAD_DATA ? `<p class="hint">Kokboken, historiken och inställningarna på den här enheten följer med.</p>` : ''}</div>
          <div class="day-col"><h3>Gå med i familj</h3>
            <div class="field"><label for="famCode">Familjekod</label><input id="famCode" placeholder="T.ex. K7QM-2XPA" value="${esc(code)}" autocapitalize="characters"></div>
            <button class="ghost" data-famjoin>Gå med</button></div>
        </div>
        ${C.error ? `<p class="status-line" style="color:var(--sambal)">${esc(C.error)}</p>` : ''}
        <p class="hint">Inloggad som ${esc(C.user?.email || '')}. <button class="linkish" data-signout>Byt konto</button></p>
      </div></section>`;
  }
  function prettyCode(c) { return c ? c.slice(0, 4) + '-' + c.slice(4) : ''; }
  function accountCard() {
    const F = C.family || {}, code = F.joinCode || '';
    const ai = S.aiStatus || (C.key ? '' : 'Ingen nyckel ännu');
    return `<div class="card">
      <h2>Konto och familj</h2>
      <p>Inloggad som <strong>${esc(C.user?.email || '')}</strong>${F.name ? ` i <strong>${esc(F.name)}</strong>` : ''}${F.members ? ` (${F.members.length} ${F.members.length === 1 ? 'medlem' : 'medlemmar'})` : ''}. Allt sparas i familjens konto och syns direkt på alla era enheter.</p>
      ${code ? `<div class="field"><label>Bjud in familjen</label>
        <div class="row"><span class="fam-code">${prettyCode(code)}</span><button class="ghost" data-invite>Kopiera inbjudan</button></div>
        <span class="hint">Den som öppnar inbjudan och loggar in med sitt Google-konto kommer med i familjen. Ni loggar in med samma konto på era egna enheter.</span></div>` : ''}
      <div class="field"><label for="famKey">Gemini-nyckel för familjen</label>
        <input id="famKey" type="password" autocomplete="off" value="${esc(C.key)}" placeholder="Klistra in nyckeln">
        <span class="hint">Läggs in en gång och gäller alla i familjen. Hämtas gratis på <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">aistudio.google.com/apikey</a>.${ai ? ` <strong class="status-line">${esc(ai)}</strong>` : ''}</span></div>
      <div class="row"><button class="btn" data-famkey>Spara och testa</button><button class="ghost" data-signout>Logga ut</button></div>
    </div>`;
  }

  /* ---------- Klick ---------- */
  document.addEventListener('click', async e => {
    const t = e.target;
    if (t.closest('[data-signin]')) { signIn(); return; }
    if (t.closest('[data-signout]')) { signOut(); return; }
    if (t.closest('[data-famcreate]')) { const b = t.closest('button'); b.disabled = true; b.textContent = 'Skapar…'; await create(document.getElementById('famName').value.trim()); return; }
    if (t.closest('[data-famjoin]')) { const b = t.closest('button'); b.disabled = true; b.textContent = 'Går med…'; await join(document.getElementById('famCode').value); return; }
    if (t.closest('[data-invite]')) {
      const code = C.family?.joinCode; if (!code) return;
      const text = `Gå med i vår familj i Souschefen: ${host()}#join=${code}\n(Logga in med ditt Google-konto. Familjekod: ${prettyCode(code)})`;
      try { await navigator.clipboard.writeText(text); toast('Inbjudan är kopierad'); } catch { prompt('Kopiera inbjudan:', text); }
      return;
    }
    if (t.closest('[data-famkey]')) {
      const k = document.getElementById('famKey').value.trim();
      S.aiStatus = 'Testar…'; renderStage();
      try { await saveKey(k); } catch (er) { S.aiStatus = '✗ Kunde inte spara: ' + (er.message || er); renderStage(); return; }
      S.aiStatus = await testAI(); renderStage();
    }
  });

  return { configured, active, init, signedInHint, geminiKey: () => C.key, saveKey, queueWrite, viewLogin, viewFamily, accountCard, state: C };
})();
