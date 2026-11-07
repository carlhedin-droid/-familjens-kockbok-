/* Inköpslistan – familjens listor i samma Firestore som Souschefen.
   Data: families/{fid}/lists/{id} { name, order } och families/{fid}/items/{id}
   { listId, text, qty, recipe, done, doneAt, addedAt, addedBy }. Skafferiet läses från state/core (prefs.pantry). */
(() => {
  const SDK = 'https://cdn.jsdelivr.net/npm/firebase@12.19.0/';
  const settings = (() => { try { return JSON.parse(localStorage.getItem('fk.settings') || '{}'); } catch { return {}; } })();
  const EN = settings.lang === 'en';
  const L = (sv, en) => EN ? en : sv;
  if (settings.theme && settings.theme !== 'auto') document.documentElement.dataset.theme = settings.theme;
  document.documentElement.lang = L('sv', 'en');

  const $ = q => document.querySelector(q);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const fold = x => String(x || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
  const lsGet = k => { try { return localStorage.getItem(k); } catch { return null; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch { /* privat läge */ } };
  function toast(msg, ms = 2600) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), ms); }

  const S = { user: undefined, fid: null, lists: [], items: [], pantry: [], listId: lsGet('hl.list') || '', ready: false, err: '',
    panel: '', showDone: false, listsLoaded: false };
  let db, auth, unsubs = [];

  // Statiska texter
  $('#hl .hl-title h1').textContent = L('Inköpslistan', 'Shopping list');
  $('#addInput').placeholder = L('T.ex. mjölk, 2 avokado', 'E.g. milk, 2 avocados');
  $('#addInput').setAttribute('aria-label', L('Lägg till varor', 'Add items'));
  $('#addForm button').setAttribute('aria-label', L('Lägg till', 'Add'));
  $('#lists').setAttribute('aria-label', L('Listor', 'Lists'));
  document.title = L('Inköpslistan', 'Shopping list');

  /* ---------- Start ---------- */
  const loadScript = src => new Promise((ok, bad) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => bad(new Error(src)); document.head.appendChild(s); });
  async function init() {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
    updateOnline();
    try { for (const f of ['app', 'auth', 'firestore']) await loadScript(`${SDK}firebase-${f}-compat.js`); }
    catch { S.err = L('Kunde inte ladda appen. Kontrollera internetuppkopplingen.', 'Could not load the app. Check your internet connection.'); S.ready = true; render(); return; }
    firebase.initializeApp(window.FIREBASE_CONFIG);
    auth = firebase.auth(); db = firebase.firestore();
    try { await db.enablePersistence({ synchronizeTabs: true }); } catch { /* en annan flik har redan cachen */ }
    auth.getRedirectResult().catch(e => { S.err = e.message || String(e); render(); });
    auth.onAuthStateChanged(onUser);
  }
  async function signIn() {
    const p = new firebase.auth.GoogleAuthProvider();
    try { await auth.signInWithPopup(p); }
    catch (e) { if (/popup-blocked|operation-not-supported|popup-closed/.test(e.code || '')) { await auth.signInWithRedirect(p); return; } S.err = e.message || String(e); render(); }
  }
  async function onUser(u) {
    unsubs.forEach(f => { try { f(); } catch { } }); unsubs = [];
    S.user = u || null; S.fid = null; S.lists = []; S.items = []; S.listsLoaded = false;
    if (!u) { S.ready = true; render(); return; }
    try { const d = await db.collection('users').doc(u.uid).get(); S.fid = d.exists ? d.data().familyId || null : null; }
    catch (e) { S.err = L('Kunde inte läsa kontot: ', 'Could not read the account: ') + (e.message || e); }
    if (!S.fid) { S.ready = true; render(); return; }
    const f = db.collection('families').doc(S.fid);
    unsubs.push(f.collection('lists').onSnapshot(q => {
      S.lists = q.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || String(a.name).localeCompare(b.name));
      if (!S.lists.length && !q.metadata.fromCache) { createList(L('Mat', 'Groceries')); return; }
      if (!S.lists.some(l => l.id === S.listId)) S.listId = S.lists[0]?.id || '';
      S.listsLoaded = true; S.ready = true; render();
    }, onErr));
    unsubs.push(f.collection('items').onSnapshot(q => { S.items = q.docs.map(d => ({ id: d.id, ...d.data() })); render(); }, onErr));
    unsubs.push(f.collection('state').doc('core').onSnapshot(d => { S.pantry = (d.exists && Array.isArray(d.data().prefs?.pantry)) ? d.data().prefs.pantry : []; if (S.panel === 'pantry') render(); }, () => {}));
  }
  function onErr(e) { console.warn('Firestore', e); S.err = e.message || String(e); render(); }
  const fam = n => db.collection('families').doc(S.fid).collection(n);

  /* ---------- Ändringar ---------- */
  async function createList(name) {
    const order = S.lists.reduce((m, l) => Math.max(m, l.order ?? 0), -1) + 1;
    const ref = fam('lists').doc();
    S.listId = ref.id; lsSet('hl.list', ref.id);
    await ref.set({ name: name.trim(), order, createdAt: Date.now() });
  }
  const QTY_RE = /^\s*(\d+(?:[.,/]\d+)?\s*(?:st|g|kg|hg|dl|cl|ml|l|msk|tsk|krm|förp|forp|paket|pkt|burk|burkar|flaskor|flaska|x|pcs|pack|cans?|bottles?)?\.?)\s+(.+)$/i;
  const UNIT = '(?:st|g|kg|hg|dl|cl|ml|l|msk|tsk|krm|förp|forp|paket|pkt|burk|burkar|flaskor|flaska|pcs|pack|cans?|bottles?)';
  const TAIL_RE = new RegExp(`^(.+?)\\s+(\\d+(?:[.,/]\\d+)?\\s*${UNIT}\\.?)$`, 'i');
  // "2 avokado" eller "grädde 1 dl" – mängden först eller sist
  function parseLine(line) { const m = line.match(QTY_RE); if (m) return { qty: m[1].trim(), text: m[2].trim() }; const t = line.match(TAIL_RE); return t ? { qty: t[2].trim(), text: t[1].trim() } : { qty: '', text: line.trim() }; }
  function addItems(lines, extra = {}) {
    if (!S.listId) return 0;
    const open = {}; S.items.filter(i => i.listId === S.listId && !i.done).forEach(i => { open[fold(i.text)] = i; });
    const batch = db.batch(), who = S.user?.displayName || S.user?.email || '', t0 = Date.now();
    let n = 0;
    lines.map(parseLine).filter(x => x.text).forEach((x, k) => {
      const ex = open[fold(x.text)];
      if (ex) { if (x.qty) batch.update(fam('items').doc(ex.id), { qty: [ex.qty, x.qty].filter(Boolean).join(' + '), updatedAt: t0 }); }
      else { const ref = fam('items').doc(); batch.set(ref, { listId: S.listId, text: x.text, qty: x.qty, recipe: extra.recipe || '', done: false, addedAt: t0 + k, addedBy: who }); open[fold(x.text)] = { id: ref.id, ...x }; }
      n++;
    });
    batch.commit().catch(onErr);   // offline: köas och skickas när täckningen kommer
    return n;
  }
  function toggle(id) { const i = S.items.find(x => x.id === id); if (!i) return; fam('items').doc(id).update({ done: !i.done, doneAt: Date.now() }).catch(onErr); }
  function removeItem(id) { fam('items').doc(id).delete().catch(onErr); }
  function clearDone() { const b = db.batch(); S.items.filter(i => i.listId === S.listId && i.done).forEach(i => b.delete(fam('items').doc(i.id))); b.commit().catch(onErr); }
  function deleteList(id) {
    const l = S.lists.find(x => x.id === id); if (!l) return;
    if (!confirm(L(`Ta bort listan "${l.name}" och allt på den?`, `Delete the list "${l.name}" and everything on it?`))) return;
    const b = db.batch(); S.items.filter(i => i.listId === id).forEach(i => b.delete(fam('items').doc(i.id))); b.delete(fam('lists').doc(id));
    b.commit().catch(onErr); S.panel = '';
  }
  function renameList(id, name) { if (name.trim()) fam('lists').doc(id).update({ name: name.trim() }).catch(onErr); S.panel = ''; render(); }

  /* ---------- Visning ---------- */
  function updateOnline() { const el = $('#offline'); el.hidden = navigator.onLine; el.textContent = L('Ingen täckning – ändringarna sparas och skickas när du är online igen.', 'Offline – changes are saved and sent when you are back online.'); }
  window.addEventListener('online', updateOnline); window.addEventListener('offline', updateOnline);

  const PRESETS = () => [L('Mat', 'Groceries'), L('Bygghandel', 'Hardware store'), L('Apotek', 'Pharmacy'), L('Köpcentrum', 'Shopping centre'), L('Systembolaget', 'Systembolaget')];
  function render() {
    const main = $('#main'), form = $('#addForm'), lists = $('#lists'), tools = $('#listTools');
    $('#toChef').textContent = L('← Souschefen', '← Souschefen');
    if (!S.ready) return;
    if (S.user === null) {
      form.hidden = true; lists.innerHTML = ''; tools.innerHTML = '';
      main.innerHTML = `<div class="hl-empty"><h2>${L('Logga in', 'Sign in')}</h2><p>${L('Inköpslistan delas med familjen via samma Google-konto som Souschefen.', 'The shopping list is shared with your family through the same Google account as Souschefen.')}</p>
        <button class="btn" data-signin>${L('Logga in med Google', 'Sign in with Google')}</button>${S.err ? `<p class="hl-err">${esc(S.err)}</p>` : ''}</div>`;
      return;
    }
    if (!S.fid) {
      form.hidden = true; lists.innerHTML = ''; tools.innerHTML = '';
      main.innerHTML = `<div class="hl-empty"><h2>${L('Ingen familj än', 'No family yet')}</h2><p>${L('Skapa eller gå med i familjen i Souschefen först, så delas listorna automatiskt.', 'Create or join your family in Souschefen first, and the lists are shared automatically.')}</p>
        <a class="btn" href="../">${L('Öppna Souschefen', 'Open Souschefen')}</a>${S.err ? `<p class="hl-err">${esc(S.err)}</p>` : ''}</div>`;
      return;
    }
    const cur = S.lists.find(l => l.id === S.listId);
    const openCount = id => S.items.filter(i => i.listId === id && !i.done).length;
    lists.innerHTML = S.lists.map(l => `<button type="button" class="hl-list${l.id === S.listId ? ' on' : ''}" data-list="${esc(l.id)}" aria-pressed="${l.id === S.listId}">${esc(l.name)}${openCount(l.id) ? ` <span>${openCount(l.id)}</span>` : ''}</button>`).join('')
      + `<button type="button" class="hl-list hl-new" data-panel="new" aria-label="${L('Ny lista', 'New list')}">+</button>`;
    form.hidden = !cur;

    // Verktyg för listan
    let toolsHtml = cur ? `<div class="hl-tools">
      <button type="button" class="ghost small" data-panel="pantry" aria-pressed="${S.panel === 'pantry'}">🥫 ${L('Fyll på skafferiet', 'Restock pantry')}</button>
      <button type="button" class="ghost small" data-panel="edit" aria-pressed="${S.panel === 'edit'}" aria-label="${L('Ändra listan', 'Edit list')}">⋯</button></div>` : '';
    if (S.panel === 'new') toolsHtml += `<div class="hl-panel"><form data-newlist><label for="newList">${L('Ny lista', 'New list')}</label>
        <div class="hl-row"><input id="newList" placeholder="${L('T.ex. Bauhaus', 'E.g. Bauhaus')}"><button class="btn small" type="submit">${L('Skapa', 'Create')}</button></div>
        <div class="chips">${PRESETS().filter(p => !S.lists.some(l => fold(l.name) === fold(p))).map(p => `<button type="button" class="chip" data-preset="${esc(p)}">${esc(p)}</button>`).join('')}</div></form></div>`;
    if (S.panel === 'edit' && cur) toolsHtml += `<div class="hl-panel"><form data-rename><label for="renameList">${L('Namn', 'Name')}</label>
        <div class="hl-row"><input id="renameList" value="${esc(cur.name)}"><button class="btn small" type="submit">${L('Spara', 'Save')}</button></div></form>
        <div class="hl-row" style="margin-top:10px"><button type="button" class="ghost small danger" data-dellist>${L('Ta bort listan', 'Delete list')}</button></div></div>`;
    if (S.panel === 'pantry' && cur) {
      const onList = new Set(S.items.filter(i => i.listId === S.listId && !i.done).map(i => fold(i.text)));
      toolsHtml += `<div class="hl-panel"><p class="hint">${L('Tryck på det som är slut. Skafferiet ändrar du i Souschefen under Inställningar.', 'Tap what has run out. Edit the pantry in Souschefen under Settings.')}</p>
        ${S.pantry.length ? `<div class="chips">${S.pantry.map(p => `<button type="button" class="chip opt" data-pantry="${esc(p)}" aria-pressed="${onList.has(fold(p))}">${esc(p)}</button>`).join('')}</div>` : `<p class="muted">${L('Skafferiet är tomt.', 'The pantry is empty.')}</p>`}</div>`;
    }
    tools.innerHTML = toolsHtml;

    if (!cur) { main.innerHTML = S.listsLoaded ? `<p class="muted">${L('Skapa en lista med +.', 'Create a list with +.')}</p>` : `<p class="muted">${L('Laddar…', 'Loading…')}</p>`; return; }
    const mine = S.items.filter(i => i.listId === S.listId);
    const open = mine.filter(i => !i.done).sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0));
    const done = mine.filter(i => i.done).sort((a, b) => (b.doneAt || 0) - (a.doneAt || 0));
    const groups = []; const by = {};
    open.forEach(i => { const k = i.recipe || ''; if (!by[k]) groups.push(by[k] = { name: k, items: [] }); by[k].items.push(i); });
    groups.sort((a, b) => (a.name ? 1 : 0) - (b.name ? 1 : 0));
    const row = i => `<li class="hl-item${i.done ? ' done' : ''}">
        <button type="button" class="hl-check" data-toggle="${esc(i.id)}" aria-pressed="${!!i.done}"><span class="box" aria-hidden="true"></span><span class="txt">${esc(i.text)}</span>${i.qty ? `<span class="qty">${esc(i.qty)}</span>` : ''}</button>
        <button type="button" class="hl-del" data-del="${esc(i.id)}" aria-label="${L(`Ta bort ${esc(i.text)}`, `Remove ${esc(i.text)}`)}">×</button></li>`;
    main.innerHTML = (open.length ? groups.map(g => `${g.name ? `<h2 class="hl-group">${L('Från', 'From')} ${esc(g.name)}</h2>` : ''}<ul class="hl-items">${g.items.map(row).join('')}</ul>`).join('')
        : `<div class="hl-empty small"><p>${done.length ? L('Allt är handlat 🎉', 'All done 🎉') : L('Listan är tom. Skriv ovan, eller tryck på "Till inköpslistan" i ett recept i Souschefen.', 'The list is empty. Type above, or tap "To shopping list" on a recipe in Souschefen.')}</p></div>`)
      + (done.length ? `<div class="hl-done"><div class="hl-done-head"><button type="button" class="hl-done-toggle" data-showdone aria-expanded="${S.showDone}">${L('I korgen', 'In the basket')} (${done.length})</button>
          <button type="button" class="ghost small" data-cleardone>${L('Rensa', 'Clear')}</button></div>${S.showDone ? `<ul class="hl-items">${done.map(row).join('')}</ul>` : ''}</div>` : '')
      + (S.err ? `<p class="hl-err">${esc(S.err)}</p>` : '');
  }

  /* ---------- Händelser ---------- */
  $('#addForm').addEventListener('submit', e => {
    e.preventDefault();
    const inp = $('#addInput'), lines = inp.value.split(/[,\n;]/).map(x => x.trim()).filter(Boolean);
    if (!lines.length) return;
    const n = addItems(lines); inp.value = ''; inp.focus();
    if (n > 1) toast(L(`${n} varor tillagda`, `${n} items added`));
  });
  document.addEventListener('submit', e => {
    if (e.target.matches('[data-newlist]')) { e.preventDefault(); const v = $('#newList').value.trim(); if (v) { S.panel = ''; createList(v); render(); } }
    if (e.target.matches('[data-rename]')) { e.preventDefault(); renameList(S.listId, $('#renameList').value); }
  });
  document.addEventListener('click', e => {
    const t = e.target;
    if (t.closest('[data-signin]')) { signIn(); return; }
    const li = t.closest('[data-list]'); if (li) { S.listId = li.dataset.list; lsSet('hl.list', S.listId); S.panel = S.panel === 'new' ? '' : (S.panel === 'edit' ? '' : S.panel); render(); return; }
    const pn = t.closest('[data-panel]'); if (pn) { S.panel = S.panel === pn.dataset.panel ? '' : pn.dataset.panel; render(); if (S.panel === 'new') $('#newList')?.focus(); return; }
    const pr = t.closest('[data-preset]'); if (pr) { S.panel = ''; createList(pr.dataset.preset); render(); return; }
    if (t.closest('[data-dellist]')) { deleteList(S.listId); return; }
    const pa = t.closest('[data-pantry]'); if (pa) { if (pa.getAttribute('aria-pressed') !== 'true') { addItems([pa.dataset.pantry], { recipe: L('Skafferiet', 'Pantry') }); } return; }
    const tg = t.closest('[data-toggle]'); if (tg) { toggle(tg.dataset.toggle); return; }
    const dl = t.closest('[data-del]'); if (dl) { removeItem(dl.dataset.del); return; }
    if (t.closest('[data-showdone]')) { S.showDone = !S.showDone; render(); return; }
    if (t.closest('[data-cleardone]')) { clearDone(); return; }
  });

  init();
})();
