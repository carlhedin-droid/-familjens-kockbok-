/* Familjens kockbok — en statisk webbapp (GitHub Pages).
   AI: Gemini eller Claude via egen API-nyckel. Data: localStorage + valfri synk via privat GitHub Gist. */
'use strict';

/* ============ Standardtexter ============ */
const DEFAULT_INSTRUCTIONS = `ROLL & TONALITET
Du är min personliga kockcoach och receptgranskare.
Stil: Rakt på sak. Ingen "fluffig" inledning.
Kompetens: Du talar till en "foodie" med hög kunskapsnivå (särskilt inom asiatisk matlagning efter 5 år i Malaysia/Singapore). Förklara inte basic-begrepp, fokusera på teknik och smakoptimering.
Mål: Maximera smak för en familj på 4 (med två hungriga tonåringar) samtidigt som du balanserar behovet av nyttigare alternativ ("Pappas önskemål").

TIDSKONTEXT & DAGSKOLL
Kolla dagens datum: Anta alltid att maten ska lagas samma dag som vi pratar.
Vardag (Mån-Tor): Utgå automatiskt från att det är tidsbrist. Prioritera effektivitet och vardagslösningar om jag inte ber om annat.
Helg (Fre-Sön): Utgå automatiskt från att jag har mer tid, vill använda min specialutrustning (kolgrill, sous vide, etc) och laga mat som en hobby.

DINA TRE ARBETSLÄGEN
1. LÄGE: Snabba köksfrågor (När jag ställer en direkt fråga under matlagning)
Format: Punktform eller max 3–5 meningar.
Innehåll: Fokusera på varför och hur.
Exempel: Temperaturer, räddning av skurna såser, smakkombinationer.

2. LÄGE: Receptbearbetning (När jag delar ett recept/länk eller har valt en rätt från inspiration)
Ingredienslista: Metriska mått (gram/liter). Skala upp till 4 rejäla portioner (tonårsaptit).
Hälso-analys (Pappas val): Periodisk fasta & styrketräning. Mål: Viktminskning men högt proteinintag.
Strategi: "Volym + Spets". Basen ska vara mättande, "gratis" råvaror (kål, broccoli, grönt) för att fylla magen.
Pragmatismen: Tillåt fett/kalorier om det ger hög smakutdelning ("Flavor ROI").
Exempel: En msk chili-majo, lite parmesan eller smörstekt lök är OK om det gör den nyttiga basen njutbar.
Mål: Hållbarhet över tid. Maten får aldrig bli så tråkig att jag ledsnar. Smak > Total asketism.
Instruktioner: Inkludera alltid mängden ingredienser i varje steg så jag slipper scrolla upp och ned.
Tidsanpassning: Ge råd baserat på om det är vardag eller helg idag:
Vardag: Genvägar, "allt-i-ett", mindre disk.
Helg: "Proffsvägen" för maxad smak (nyttja min utrustning).
Instruktioner: Korta, numrerade, imperativa steg (t.ex. "Rosta kryddorna", "Sila såsen"). Missa inga kritiska moment.

3. LÄGE: Inspiration (När jag listar råvaror och vill ha förslag)
Ge 5–8 förslag, var och en med en kort förklaring till varför den passar just oss.
Dag-prioritering: Om det är vardag (mån-tor), låt majoriteten av förslagen vara snabba/enkla. Om det är helg (fre-sön), föreslå mer ambitiösa rätter.
Spridning: Blanda kök (Svenskt, Fransk, Italiensk, Amerikansk, Sydamerikansk, Asiatiskt) samt ange minst ett vegetariskt alternativ.
Hälsokrav: Minst ett förslag ska vara tydligt hälsosammare, markera detta tydligt.
Per förslag: Namn & Ursprung, [VARDAG] eller [HELG], Tid & Svårighetsgrad, Nyckelvaror (utöver standard), Utrustning (om specialmaskin krävs).
Avsluta med att fråga vilken rätt jag vill ha det kompletta receptet på.

MIN PROFIL & UTRUSTNING
Matpreferenser: Svenskt, fransk, italiensk, amerikansk, central-/sydamerikansk, asiatisk (Malaysia, Singapore, Japan), vegetariskt (så länge maten har tydlig karaktär och är tillagad).
Utrustning att nyttja: Matberedare, Fritös, slow cooker, bakstål, sous vide, köttkvarn, vakuummaskin, grillpanna, kolgrill, wok-panna, stor soppkastrull.

Om viktig information saknas för att ge ett bra svar (t.ex. allergier), ställ en motfråga direkt.`;

const DEFAULT_PROFILE = `Familj på 4: pappa, mamma och två tonåringar (13–15 år) med stor aptit. Vi äter ganska mycket – räkna hellre för rejält än för snålt.
Pappa: periodisk fasta och styrketräning, vill gå ner i vikt men äta mycket protein ("Pappas val").
Vi bor på Ekerö utanför Stockholm och handlar i vanliga svenska matbutiker.`;

const FORMAT_RULES = `## APPENS SVARSFORMAT (måste följas)
Du svarar inuti en app. Svara ALLTID med exakt ett JSON-objekt – ingen text före eller efter, inga kodstaket.
{
  "reply": "Text som visas i chatten. Vid snabba frågor (LÄGE 1) är detta hela svaret. När du ger förslag eller recept: högst 1–2 meningar – upprepa INTE förslagen eller receptet här. Enkel markdown (**fet**, punktlistor med '- ') är ok.",
  "suggestions": null | [ { "name": "", "origin": "kök/land", "tag": "VARDAG" | "HELG", "time": "t.ex. 35 min", "difficulty": "Lätt" | "Medel" | "Avancerad", "why": "1–2 meningar om varför den passar oss", "keyIngredients": [""], "equipment": "" | null, "healthier": true|false, "vegetarian": true|false } ],
  "recipe": null | {
    "title": "", "origin": "", "tag": "VARDAG" | "HELG", "time": "", "servings": 4, "intro": "1–2 meningar",
    "ingredients": [ { "id": "i1", "amount": "300 g", "name": "kycklinglårfilé", "note": "i bitar" | null, "group": "Marinad" | null } ],
    "steps": [ { "text": "Bryn 300 g kycklinglårfilé ...", "uses": ["i1"], "minutes": 8 | null } ],
    "health": { "summary": "Pappas val: ...", "tips": [""] },
    "tips": [""]
  },
  "learn": [ "kort ny lärdom om familjens smak/vanor" ]
}
Regler:
- LÄGE 3 (inspiration) → fyll "suggestions". LÄGE 2 (komplett recept, eller när jag ber dig ändra receptet som visas) → fyll "recipe" med HELA receptet. LÄGE 1 → båda null.
- I varje steg: skriv ut mängderna i texten och lista ingrediensernas id i "uses". "minutes" anges för steg med vänte-/tillagningstid.
- "group" används för att dela upp ingredienser (t.ex. "Marinad", "Sås", "Servering"); annars null.
- "learn": bara NYA saker vi själva sagt eller tydligt visat (t.ex. "Barnen tycker inte om koriander", "Vi gillade mer chili i panangen"). Inga gissningar. Annars [].
- Använd smakminnet och kockboken nedan för att träffa vår smak. Föreslå gärna variationer på rätter vi gett högt betyg.
- Svara på svenska. Om info saknas: ställ motfrågan i "reply" och sätt suggestions/recipe till null.`;

const DEFAULT_MODELS = { gemini: 'gemini-flash-latest', claude: 'claude-sonnet-5-5' };
const DATA_FILE = 'familjens-kockbok.json';

/* ============ Lagring ============ */
const LS = {
  get(k, fb) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
};
const now = () => new Date().toISOString();
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

function freshData() {
  return { v: 1, instructions: DEFAULT_INSTRUCTIONS, profile: DEFAULT_PROFILE, textUpdatedAt: '1970-01-01T00:00:00.000Z',
           memory: [], recipes: [], deleted: {} };
}
const S = {
  settings: Object.assign({ provider: 'claude', geminiKey: '', geminiModel: DEFAULT_MODELS.gemini,
    claudeKey: '', claudeModel: DEFAULT_MODELS.claude, ghToken: '', gistId: '', theme: 'auto' }, LS.get('fk.settings', {})),
  data: Object.assign(freshData(), LS.get('fk.data', {})),
  chat: LS.get('fk.chat', []),
  route: { view: 'home' },     // home | suggestions | recipe | book | settings
  current: LS.get('fk.current', null),  // { suggestions, recipe, recipeSavedId, dirty }
  busy: false,
  attach: null,                // { mime, data, url }
  homeAttach: null,
  checked: {}, activeStep: null, doneSteps: {},
  bookFilter: 'alla', bookQuery: '',
  sync: { state: '', timer: null },
  timers: [],
};
if (!S.current) S.current = { suggestions: null, suggIntro: '', recipe: null, recipeSavedId: null, dirty: false };

function saveSettings() { LS.set('fk.settings', S.settings); }
function saveCurrent() { LS.set('fk.current', S.current); }
function saveChat() {
  const slim = S.chat.slice(-80).map(m => ({ ...m, image: undefined }));
  LS.set('fk.chat', slim);
}
function saveData(opts = {}) {
  LS.set('fk.data', S.data);
  if (!opts.noSync) scheduleSync();
}

/* ============ Hjälpare ============ */
const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function md(s) {
  const lines = esc(s).split(/\n/);
  let out = '', inList = false;
  for (const raw of lines) {
    const l = raw.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*])\*(?!\s)(.+?)\*/g, '$1<em>$2</em>');
    const m = l.match(/^\s*(?:[-•*]|\d+[.)])\s+(.*)/);
    if (m) { if (!inList) { out += '<ul>'; inList = true; } out += `<li>${m[1]}</li>`; continue; }
    if (inList) { out += '</ul>'; inList = false; }
    if (l.trim()) out += `<p>${l}</p>`;
  }
  if (inList) out += '</ul>';
  return out;
}
function toast(msg, ms = 2600) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), ms);
}
const DAYS = ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'];
function dayInfo(d = new Date()) {
  const wd = d.getDay();
  const weekend = wd === 5 || wd === 6 || wd === 0;
  return { name: DAYS[wd], weekend, label: weekend ? 'HELG' : 'VARDAG',
    date: d.toLocaleDateString('sv-SE', { day: 'numeric', month: 'long', year: 'numeric' }),
    time: d.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' }) };
}
function highlightAmounts(text) {
  // fetmarkera mängder som "300 g", "2 msk", "1,5 dl", "3 st"
  return esc(text).replace(/(\d+(?:[.,]\d+)?(?:\s?[–-]\s?\d+(?:[.,]\d+)?)?\s?(?:kg|g|hg|mg|l|dl|cl|ml|msk|tsk|krm|st|klyftor?|nypa|cm|°C|grader)\b)/gi, '<b>$1</b>');
}
async function fileToImage(file) {
  const url = URL.createObjectURL(file);
  const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
  const max = 1280, sc = Math.min(1, max / Math.max(img.width, img.height));
  const c = document.createElement('canvas'); c.width = Math.round(img.width * sc); c.height = Math.round(img.height * sc);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  URL.revokeObjectURL(url);
  const dataUrl = c.toDataURL('image/jpeg', 0.82);
  return { mime: 'image/jpeg', data: dataUrl.split(',')[1], url: dataUrl };
}

/* ============ System-prompt ============ */
function buildSystem() {
  const d = dayInfo();
  const mem = S.data.memory.filter(m => !m.deleted).map(m => `- ${m.text}`).join('\n') || '- (inget ännu)';
  const book = S.data.recipes.slice()
    .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')).slice(0, 50)
    .map(r => {
      const bits = [];
      if (r.rating) bits.push(`betyg ${r.rating}/5`);
      if (r.cooked?.length) bits.push(`lagad ${r.cooked.length} ggr`);
      const note = (r.notes || '').replace(/\s+/g, ' ').slice(0, 220);
      return `- ${r.title}${r.origin ? ` (${r.origin})` : ''}${bits.length ? ` – ${bits.join(', ')}` : ''}${note ? `. Anteckning: ${note}` : ''}`;
    }).join('\n') || '- (kockboken är tom än så länge)';
  const onScreen = S.route.view === 'recipe' && S.current.recipe
    ? JSON.stringify(stripRecipe(S.current.recipe))
    : (S.route.view === 'suggestions' && S.current.suggestions
      ? 'Förslagslistan: ' + S.current.suggestions.map((s, i) => `${i + 1}. ${s.name}`).join('; ')
      : 'Inget recept visas just nu.');
  return `${S.data.instructions}

## FAMILJEN
${S.data.profile}

## SMAKMINNE (det du lärt dig om oss)
${mem}

## FAMILJENS KOCKBOK (sparade rätter, betyg och våra anteckningar)
${book}

## IDAG
Idag är det ${d.name} ${d.date}, klockan ${d.time}. Det räknas som ${d.label}.

## DET SOM VISAS PÅ SKÄRMEN
${onScreen}

${FORMAT_RULES}`;
}
function stripRecipe(r) {
  const { id, savedAt, updatedAt, notes, rating, cooked, ...rest } = r;
  return rest;
}

/* ============ AI-anrop ============ */
function historyForModel() {
  return S.chat.filter(m => m.role === 'user' || m.role === 'assistant').slice(-24).map(m => {
    let text = m.text || '';
    if (m.role === 'assistant') {
      if (m.view?.recipe) text += `\n[Visade receptet "${m.view.recipe.title}" på skärmen]`;
      if (m.view?.suggestions) text += `\n[Visade förslag: ${m.view.suggestions.map(s => s.name).join(', ')}]`;
    }
    return { role: m.role, text: text || '(tomt)', image: m.image };
  });
}
async function callModel() {
  const sys = buildSystem();
  const msgs = historyForModel();
  const p = S.settings.provider;
  if (p === 'claude') {
    const key = S.settings.claudeKey.trim();
    if (!key) throw new Error('NOKEY');
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01',
                 'anthropic-dangerous-direct-browser-access': 'true' },
      body: JSON.stringify({ model: S.settings.claudeModel || DEFAULT_MODELS.claude, max_tokens: 8000, system: sys,
        messages: mergeRoles(msgs).map(m => ({ role: m.role, content: [
          ...(m.image ? [{ type: 'image', source: { type: 'base64', media_type: m.image.mime, data: m.image.data } }] : []),
          { type: 'text', text: m.text } ] })) }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(j.error?.message || `Claude svarade ${res.status}`);
    return (j.content || []).filter(c => c.type === 'text').map(c => c.text).join('');
  }
  const key = S.settings.geminiKey.trim();
  if (!key) throw new Error('NOKEY');
  const model = S.settings.geminiModel || DEFAULT_MODELS.gemini;
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: sys }] },
      contents: mergeRoles(msgs).map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [
        ...(m.image ? [{ inlineData: { mimeType: m.image.mime, data: m.image.data } }] : []), { text: m.text } ] })),
      generationConfig: { responseMimeType: 'application/json', temperature: 0.8 },
    }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error?.message || `Gemini svarade ${res.status}`);
  const parts = j.candidates?.[0]?.content?.parts || [];
  const txt = parts.filter(x => !x.thought).map(x => x.text || '').join('');
  if (!txt) throw new Error('Tomt svar från Gemini (' + (j.candidates?.[0]?.finishReason || 'okänd orsak') + ')');
  return txt;
}
function mergeRoles(msgs) {
  // API:erna vill ha alternerande roller och börja med user
  const out = [];
  for (const m of msgs) {
    const last = out[out.length - 1];
    if (last && last.role === m.role) { last.text += '\n\n' + m.text; if (m.image) last.image = m.image; }
    else out.push({ ...m });
  }
  while (out.length && out[0].role !== 'user') out.shift();
  return out;
}
function parseReply(raw) {
  let t = String(raw).trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  const a = t.indexOf('{'), b = t.lastIndexOf('}');
  if (a >= 0 && b > a) {
    try {
      const o = JSON.parse(t.slice(a, b + 1));
      if (o && typeof o === 'object') return o;
    } catch { /* faller igenom */ }
  }
  return { reply: raw, suggestions: null, recipe: null, learn: [] };
}
function normalizeRecipe(r) {
  if (!r || !Array.isArray(r.ingredients) || !Array.isArray(r.steps)) return null;
  r.ingredients = r.ingredients.map((x, i) => ({ id: String(x.id || `i${i + 1}`), amount: x.amount || '', name: x.name || '', note: x.note || '', group: x.group || '' }));
  r.steps = r.steps.map(s => typeof s === 'string' ? { text: s, uses: [], minutes: null } :
    { text: s.text || '', uses: Array.isArray(s.uses) ? s.uses.map(String) : [], minutes: Number(s.minutes) > 0 ? Number(s.minutes) : null });
  r.servings = r.servings || 4;
  r.health = r.health || null; r.tips = Array.isArray(r.tips) ? r.tips : [];
  return r;
}

async function send(text, image) {
  text = (text || '').trim();
  if ((!text && !image) || S.busy) return;
  S.chat.push({ role: 'user', text: text || 'Vad kan jag laga av det här?', image, at: now() });
  S.busy = true; saveChat(); renderChat(true);
  const showStageLoader = S.route.view === 'home';
  if (showStageLoader) renderStage();
  try {
    const raw = await callModel();
    const o = parseReply(raw);
    const msg = { role: 'assistant', text: o.reply || '', at: now() };
    const recipe = normalizeRecipe(o.recipe);
    const sugg = Array.isArray(o.suggestions) && o.suggestions.length ? o.suggestions : null;
    if (recipe) {
      const keepId = S.route.view === 'recipe' ? S.current.recipeSavedId : null;
      S.current.recipe = recipe; S.current.recipeSavedId = keepId; S.current.dirty = !!keepId;
      S.checked = {}; S.doneSteps = {}; S.activeStep = null;
      msg.view = { recipe };
      go('recipe', { keepChat: true });
    } else if (sugg) {
      S.current.suggestions = sugg; S.current.suggIntro = o.reply || '';
      msg.view = { suggestions: sugg };
      go('suggestions', { keepChat: true });
    }
    const learned = (Array.isArray(o.learn) ? o.learn : []).map(s => String(s).trim()).filter(Boolean);
    if (learned.length) {
      const existing = new Set(S.data.memory.filter(m => !m.deleted).map(m => m.text.toLowerCase()));
      const fresh = learned.filter(l => !existing.has(l.toLowerCase()));
      fresh.forEach(t => S.data.memory.push({ id: uid(), text: t, at: now(), updatedAt: now() }));
      if (fresh.length) { msg.learned = fresh; saveData(); }
    }
    S.chat.push(msg);
    saveCurrent();
    if (!recipe && !sugg) openChat(true);
  } catch (e) {
    const nokey = e.message === 'NOKEY';
    S.chat.push({ role: 'error', text: nokey ? 'Kocken behöver en API-nyckel. Lägg in den under Inställningar.' : `Det gick inte att nå kocken: ${e.message}`, nokey, at: now() });
    openChat(true);
  } finally {
    S.busy = false; saveChat(); renderChat(true);
    if (S.route.view === 'home') renderStage();
    if (!document.querySelector('.app[data-chat="open"]')) $('#chatDot').hidden = false;
  }
}

/* ============ Navigering ============ */
function go(view, opts = {}) {
  S.route = { view, ...(opts.params || {}) };
  const key = view === 'suggestions' ? 'home' : view === 'recipe' ? (S.current.recipeSavedId ? 'book' : 'home') : view;
  document.querySelectorAll('.nav-btn').forEach(b => b.setAttribute('aria-current', b.dataset.go === key ? 'page' : 'false'));
  try { localStorage.setItem('fk.lastView', JSON.stringify(view)); } catch { }
  renderStage();
  $('#stage').scrollTop = 0;
  updateWakeLock();
}
document.addEventListener('click', e => {
  const g = e.target.closest('[data-go]');
  if (g) { e.preventDefault(); go(g.dataset.go); }
});

/* ============ Chatt ============ */
function openChat(open) {
  const app = $('#app');
  app.dataset.chat = open ? 'open' : 'closed';
  $('#chatTab').setAttribute('aria-expanded', String(open));
  if (open) { $('#chatDot').hidden = true; renderChat(true); }
}
$('#chatTab').addEventListener('click', () => { openChat(true); setTimeout(() => $('#chatInput').focus(), 50); });
$('#chatClose').addEventListener('click', () => openChat(false));
$('#chatNew').addEventListener('click', () => {
  if (!S.chat.length || confirm('Börja en ny tråd? Den nuvarande konversationen rensas (recept i kockboken påverkas inte).')) {
    S.chat = []; saveChat(); renderChat();
  }
});
$('#composer').addEventListener('submit', e => {
  e.preventDefault();
  const ta = $('#chatInput'); const v = ta.value;
  const img = S.attach; S.attach = null; renderAttach();
  ta.value = ''; autoGrow(ta);
  send(v, img);
});
$('#chatInput').addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && window.matchMedia('(pointer: fine)').matches) { e.preventDefault(); $('#composer').requestSubmit(); }
});
$('#chatInput').addEventListener('input', e => autoGrow(e.target));
$('#chatFile').addEventListener('change', async e => {
  const f = e.target.files[0]; e.target.value = '';
  if (f) { S.attach = await fileToImage(f); renderAttach(); }
});
function autoGrow(ta) { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 160) + 'px'; }
function renderAttach() {
  const el = $('#chatAttach');
  if (!S.attach) { el.hidden = true; el.innerHTML = ''; return; }
  el.hidden = false;
  el.innerHTML = `<img src="${S.attach.url}" alt=""><span>Foto bifogat</span><button type="button" class="ghost small">Ta bort</button>`;
  el.querySelector('button').onclick = () => { S.attach = null; renderAttach(); };
}
function renderChat(scroll) {
  const log = $('#chatLog');
  if (!S.chat.length) {
    log.innerHTML = `<div class="chat-empty"><p>Fråga vad som helst medan du lagar – svaren hamnar här och receptet stannar kvar till vänster.</p>
      <button class="chip" data-ask="Hur räddar jag en sås som skurit sig?">Såsen skar sig</button>
      <button class="chip" data-ask="Vilken innertemp ska jag ha på karré?">Innertemp karré</button>
      <button class="chip" data-ask="Vad kan jag byta grädde mot för att göra det lättare?">Byt ut grädden</button></div>`;
  } else {
    log.innerHTML = S.chat.map((m, i) => {
      if (m.role === 'user') return `<div class="msg user">${m.image ? `<img src="${m.image.url}" alt="Bifogat foto">` : ''}${md(m.text)}</div>`;
      if (m.role === 'error') return `<div class="msg error">${esc(m.text)}${m.nokey ? ` <button class="view-link" data-go="settings">Öppna inställningar</button>` : ''}</div>`;
      let extra = '';
      if (m.view?.recipe) extra += `<button class="view-link" data-view="${i}">Visa receptet: ${esc(m.view.recipe.title)}</button>`;
      if (m.view?.suggestions) extra += `<button class="view-link" data-view="${i}">Visa ${m.view.suggestions.length} förslag</button>`;
      if (m.learned?.length) extra += `<div class="learned">Kocken kommer ihåg: ${m.learned.map(esc).join(' · ')}</div>`;
      return `<div class="msg assistant">${md(m.text) || ''}${extra}</div>`;
    }).join('');
  }
  if (S.busy) log.insertAdjacentHTML('beforeend', `<div class="msg assistant typing" aria-label="Kocken skriver"><i></i><i></i><i></i></div>`);
  $('#chatInput').disabled = false;
  $('#composer .send').disabled = S.busy;
  if (scroll) log.scrollTop = log.scrollHeight;
}
$('#chatLog').addEventListener('click', e => {
  const a = e.target.closest('[data-ask]');
  if (a) { send(a.dataset.ask); return; }
  const v = e.target.closest('[data-view]');
  if (v) {
    const m = S.chat[+v.dataset.view];
    if (m.view.recipe) { S.current.recipe = m.view.recipe; S.current.recipeSavedId = null; S.current.dirty = false; S.checked = {}; S.doneSteps = {}; go('recipe'); }
    else { S.current.suggestions = m.view.suggestions; S.current.suggIntro = m.text; go('suggestions'); }
    saveCurrent();
  }
});

/* ============ Vyer ============ */
function renderStage() {
  const st = $('#stage');
  st.classList.toggle('fill', S.route.view === 'recipe');
  const v = S.route.view;
  if (v === 'home') st.innerHTML = viewHome();
  else if (v === 'suggestions') st.innerHTML = viewSuggestions();
  else if (v === 'recipe') st.innerHTML = viewRecipe();
  else if (v === 'book') st.innerHTML = viewBook();
  else if (v === 'settings') st.innerHTML = viewSettings();
  bindStage();
}

function viewHome() {
  const d = dayInfo();
  const hint = d.weekend
    ? `Det är <strong>${d.name}</strong> – helg. Kocken räknar med att du har tid för kolgrillen, sous viden eller ett längre projekt.`
    : `Det är <strong>${d.name}</strong> – vardag. Kocken håller det snabbt, med lite disk.`;
  const recent = S.data.recipes.slice().sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')).slice(0, 4);
  if (S.busy) {
    return `<section class="home"><div class="loading-stage">${potSvg()}<span>Kocken tänker…</span></div></section>`;
  }
  return `<section class="home">
    <h1>Vad har ni, och vad är ni sugna på?</h1>
    <p class="day-line">${hint}</p>
    <form class="asker" id="homeAsk">
      <textarea id="homeInput" placeholder="T.ex. Vi har kycklinglår, en halv vitkål, kokosmjölk och lime. Något starkt och asiatiskt." aria-label="Beskriv vad ni har och vad ni vill ha"></textarea>
      <div class="attach-preview" id="homeAttach" ${S.homeAttach ? '' : 'hidden'}>${S.homeAttach ? `<img src="${S.homeAttach.url}" alt=""><span>Foto bifogat</span>` : ''}</div>
      <div class="asker-row">
        <label class="ghost" title="Fota kylen eller skafferiet">
          <input type="file" accept="image/*" capture="environment" id="homeFile" hidden>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="13" r="3.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>
          Foto
        </label>
        <button class="btn" type="submit">Ge oss förslag</button>
      </div>
    </form>
    <div class="quick">
      ${[
        d.weekend ? 'Helgprojekt på kolgrillen ikväll' : 'Snabb vardagsmiddag på 30 min',
        'Nyttigt men gott – Pappas val',
        'Vegetariskt med tydlig karaktär',
        'Något malaysiskt eller singaporianskt',
        'Laga om en favorit från kockboken',
      ].map(q => `<button class="chip" data-quick="${esc(q)}">${esc(q)}</button>`).join('')}
    </div>
    ${S.current.recipe || S.current.suggestions ? `<div class="row" style="margin:-20px 0 32px">
      ${S.current.recipe ? `<button class="ghost" data-go="recipe">Fortsätt med ${esc(S.current.recipe.title)}</button>` : ''}
      ${S.current.suggestions ? `<button class="ghost" data-go="suggestions">Senaste förslagen</button>` : ''}</div>` : ''}
    ${recent.length ? `<h2>Senast i kockboken</h2><div class="recent">${recent.map(bookRow).join('')}</div>` : ''}
  </section>`;
}
function potSvg() {
  return `<svg class="pot" viewBox="0 0 48 48" aria-hidden="true"><path class="steam" d="M17 6c2 3-2 4 0 8" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round"/><path class="steam" d="M24 4c2 3-2 4 0 8" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round"/><path class="steam" d="M31 6c2 3-2 4 0 8" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M6 22h36v4a14 14 0 0 1-14 14h-8A14 14 0 0 1 6 26z" fill="currentColor"/><path d="M2 24h4M42 24h4" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>`;
}

function viewSuggestions() {
  const list = S.current.suggestions || [];
  if (!list.length) return `<div class="empty"><h2>Inga förslag än</h2><p>Berätta vad ni har så föreslår kocken rätter.</p><button class="btn" data-go="home">Till kocken</button></div>`;
  return `<section>
    <div class="sugg-head"><h1>${list.length} förslag till ${dayInfo().name}</h1></div>
    ${S.current.suggIntro ? `<div class="sugg-intro">${md(S.current.suggIntro)}</div>` : ''}
    <div class="sugg-grid">${list.map((s, i) => `
      <article class="sugg ${s.healthier ? 'healthier' : ''}">
        <div class="tags">
          <span class="tag ${String(s.tag).toLowerCase() === 'helg' ? 'helg' : 'vardag'}">${String(s.tag).toLowerCase() === 'helg' ? 'Helg' : 'Vardag'}</span>
          ${s.healthier ? '<span class="tag health">Pappas val – nyttigare</span>' : ''}
          ${s.vegetarian ? '<span class="tag veg">Vegetarisk</span>' : ''}
        </div>
        <h3>${esc(s.name)}</h3>
        ${s.origin ? `<div class="origin">${esc(s.origin)}</div>` : ''}
        ${s.why ? `<p class="why">${esc(s.why)}</p>` : ''}
        <dl>
          ${s.time || s.difficulty ? `<dt>Tid</dt><dd>${esc([s.time, s.difficulty].filter(Boolean).join(', '))}</dd>` : ''}
          ${s.keyIngredients?.length ? `<dt>Handla</dt><dd>${esc(s.keyIngredients.join(', '))}</dd>` : ''}
          ${s.equipment ? `<dt>Utrustning</dt><dd>${esc(s.equipment)}</dd>` : ''}
        </dl>
        <button class="btn" data-pick="${i}">Ge mig receptet</button>
      </article>`).join('')}
    </div>
    <div class="sugg-foot row" style="margin-top:20px"><button class="ghost" data-more>Fler förslag</button></div>
  </section>`;
}

function viewRecipe() {
  const r = S.current.recipe;
  if (!r) return `<div class="empty"><h2>Inget recept öppet</h2><p>Välj ett förslag eller öppna en rätt i kockboken.</p><button class="btn" data-go="home">Till kocken</button></div>`;
  const saved = S.current.recipeSavedId ? S.data.recipes.find(x => x.id === S.current.recipeSavedId) : null;
  const groups = [];
  r.ingredients.forEach(ing => {
    let g = groups.find(x => x.name === (ing.group || ''));
    if (!g) groups.push(g = { name: ing.group || '', items: [] });
    g.items.push(ing);
  });
  const ingById = Object.fromEntries(r.ingredients.map(i => [i.id, i]));
  const checkedCount = r.ingredients.filter(i => S.checked[i.id]).length;
  const isHelg = String(r.tag).toLowerCase() === 'helg';
  return `
  <div class="r-head">
    <div class="r-title">
      <h1>${esc(r.title)}</h1>
      <div class="r-meta">
        ${r.tag ? `<span class="tag ${isHelg ? 'helg' : 'vardag'}">${isHelg ? 'Helg' : 'Vardag'}</span>` : ''}
        ${r.origin ? `<span>${esc(r.origin)}</span>` : ''}
        ${r.time ? `<span>${esc(r.time)}</span>` : ''}
        <span>${esc(r.servings)} portioner</span>
        ${saved?.rating ? `<span class="rt" style="color:var(--kunyit)">${'★'.repeat(saved.rating)}</span>` : ''}
      </div>
      ${r.intro ? `<p class="r-intro">${esc(r.intro)}</p>` : ''}
    </div>
    <div class="r-actions">
      ${!saved ? `<button class="btn" data-save>Spara i kockboken</button>`
        : S.current.dirty ? `<button class="btn" data-save>Spara ändringarna</button>`
        : `<button class="ghost" data-cooked>Vi lagade den idag</button>`}
      ${S.current.suggestions && !saved ? `<button class="ghost" data-go="suggestions">Förslagen</button>` : ''}
      ${saved ? `<button class="ghost" data-go="book">Kockboken</button>` : ''}
    </div>
  </div>
  <div class="r-body">
    <section class="pane ingredients" aria-label="Ingredienser">
      <div class="pane-head"><h2>Ingredienser</h2><span class="count">${checkedCount}/${r.ingredients.length} framme</span></div>
      <div class="pane-inner">
        ${groups.map(g => `${g.name ? `<div class="group-label">${esc(g.name)}</div>` : ''}
          ${g.items.map(i => `<label class="ing ${S.checked[i.id] ? 'checked' : ''}" data-ing="${esc(i.id)}">
            <input type="checkbox" ${S.checked[i.id] ? 'checked' : ''} data-check="${esc(i.id)}">
            <span class="amt">${esc(i.amount)}</span>
            <span><span class="name">${esc(i.name)}</span>${i.note ? ` <span class="note">${esc(i.note)}</span>` : ''}</span>
          </label>`).join('')}`).join('')}
        ${r.health ? `<div class="health"><h3>Pappas val</h3>${r.health.summary ? `<div>${md(r.health.summary)}</div>` : ''}
          ${r.health.tips?.length ? `<ul>${r.health.tips.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}</div>` : ''}
        ${r.tips?.length ? `<div class="tips"><h3>Kockens tips</h3><ul>${r.tips.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>` : ''}
      </div>
    </section>
    <section class="pane steps" aria-label="Gör så här">
      <div class="pane-head"><h2>Gör så här</h2><span class="count">${r.steps.length} steg</span></div>
      <div class="pane-inner">
        <ol>${r.steps.map((s, n) => `
          <li class="step ${S.activeStep === n ? 'active' : ''} ${S.doneSteps[n] ? 'done' : ''}" data-step="${n}">
            <div class="step-text">${highlightAmounts(s.text)}</div>
            ${s.uses.length ? `<div class="step-uses">${s.uses.filter(u => ingById[u]).map(u => `<button class="use" data-lite="${esc(u)}" title="Visa i ingredienslistan">${esc(ingById[u].amount)} ${esc(ingById[u].name)}</button>`).join('')}</div>` : ''}
            <div class="step-tools">
              ${s.minutes ? `<button class="ghost" data-timer="${n}">Starta ${fmtMin(s.minutes)}-timer</button>` : ''}
              <button class="ghost" data-done="${n}">${S.doneSteps[n] ? 'Ångra klar' : 'Klar'}</button>
            </div>
          </li>`).join('')}</ol>
        ${saved ? notesBox(saved) : ''}
      </div>
    </section>
  </div>`;
}
const fmtMin = m => m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ''}` : `${m} min`;
function notesBox(saved) {
  return `<div class="notes-box">
    <h3>Våra anteckningar</h3>
    <div class="row" style="margin-bottom:8px"><span class="muted">Betyg</span><span class="stars" role="radiogroup" aria-label="Betyg">${[1, 2, 3, 4, 5].map(n => `<button role="radio" aria-checked="${saved.rating === n}" aria-label="${n} av 5" class="${saved.rating >= n ? 'on' : ''}" data-rate="${n}">★</button>`).join('')}</span></div>
    <textarea id="notes" placeholder="Vad blev bra, vad gör vi annorlunda nästa gång? Kocken läser det här.">${esc(saved.notes || '')}</textarea>
    ${saved.cooked?.length ? `<div class="cooked-log">Lagad ${saved.cooked.length} ${saved.cooked.length === 1 ? 'gång' : 'gånger'}, senast ${new Date(saved.cooked[saved.cooked.length - 1]).toLocaleDateString('sv-SE')}</div>` : ''}
    <div class="row" style="margin-top:12px"><button class="ghost small danger" data-delete>Ta bort ur kockboken</button></div>
  </div>`;
}

function bookRow(r) {
  return `<button class="book-row" data-open="${esc(r.id)}">
    <h3>${esc(r.title)}</h3>
    <span class="rt" aria-label="${r.rating ? r.rating + ' av 5' : 'Inget betyg'}">${r.rating ? '★'.repeat(r.rating) : ''}</span>
    <span class="sub">${esc([r.origin, r.time, r.cooked?.length ? `lagad ${r.cooked.length} ggr` : 'inte lagad än'].filter(Boolean).join(', '))}</span>
    ${r.notes ? `<span class="note-snip">${esc(r.notes.slice(0, 140))}${r.notes.length > 140 ? '…' : ''}</span>` : ''}
  </button>`;
}
function viewBook() {
  const q = S.bookQuery.toLowerCase();
  let list = S.data.recipes.slice();
  if (S.bookFilter === 'favoriter') list = list.filter(r => (r.rating || 0) >= 4);
  if (S.bookFilter === 'vardag') list = list.filter(r => String(r.tag).toLowerCase() !== 'helg');
  if (S.bookFilter === 'helg') list = list.filter(r => String(r.tag).toLowerCase() === 'helg');
  if (q) list = list.filter(r => [r.title, r.origin, r.notes, ...(r.ingredients || []).map(i => i.name)].join(' ').toLowerCase().includes(q));
  list.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  const f = (k, l) => `<button class="chip" aria-pressed="${S.bookFilter === k}" data-filter="${k}">${l}</button>`;
  return `<section>
    <div class="book-head"><h1>Familjens kockbok</h1>
      <input class="search" id="bookSearch" type="search" placeholder="Sök rätt, råvara eller anteckning" value="${esc(S.bookQuery)}" aria-label="Sök i kockboken"></div>
    <div class="filters">${f('alla', 'Alla')}${f('favoriter', 'Favoriter')}${f('vardag', 'Vardag')}${f('helg', 'Helg')}</div>
    ${S.data.recipes.length === 0
      ? `<div class="empty"><h2>Kockboken är tom</h2><p>Be kocken om ett recept och tryck på <strong>Spara i kockboken</strong>. Betyg och anteckningar hjälper kocken att lära sig vad ni gillar.</p><button class="btn" data-go="home">Till kocken</button></div>`
      : list.length ? `<div class="book-list">${list.map(bookRow).join('')}</div>` : `<p class="muted">Inget i kockboken matchar.</p>`}
  </section>`;
}

function viewSettings() {
  const s = S.settings, p = s.provider;
  const mem = S.data.memory.filter(m => !m.deleted);
  return `<section class="settings">
    <h1>Inställningar</h1>
    <div class="card">
      <h2>Kockens AI</h2>
      <p>Appen pratar direkt med AI-tjänsten med er egen nyckel. Nyckeln sparas bara i den här webbläsaren.</p>
      <div class="field"><label>Tjänst</label>
        <div class="seg" role="group"><button type="button" data-prov="gemini" aria-pressed="${p === 'gemini'}">Google Gemini</button><button type="button" data-prov="claude" aria-pressed="${p === 'claude'}">Anthropic Claude</button></div></div>
      ${p === 'gemini' ? `
        <div class="field"><label for="geminiKey">Gemini API-nyckel</label><input id="geminiKey" type="password" autocomplete="off" value="${esc(s.geminiKey)}">
          <span class="hint">Skapa en gratis nyckel på <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">aistudio.google.com/apikey</a>.</span></div>
        <div class="field"><label for="geminiModel">Modell</label><input id="geminiModel" value="${esc(s.geminiModel)}"><span class="hint">Standard: ${DEFAULT_MODELS.gemini}</span></div>`
      : `
        <div class="field"><label for="claudeKey">Claude API-nyckel</label><input id="claudeKey" type="password" autocomplete="off" value="${esc(s.claudeKey)}">
          <span class="hint">Skapa en nyckel på <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener">console.anthropic.com</a> (betalas per användning).</span></div>
        <div class="field"><label for="claudeModel">Modell</label><input id="claudeModel" value="${esc(s.claudeModel)}"><span class="hint">Standard: ${DEFAULT_MODELS.claude}</span></div>`}
      <div class="row"><button class="btn" data-savekeys>Spara</button><button class="ghost" data-testai>Testa kocken</button></div>
    </div>

    <div class="card">
      <h2>Dela kockboken mellan enheter</h2>
      <p>Kockboken, smakminnet och instruktionerna sparas i en privat GitHub Gist så att dator, mobil och platta – och båda föräldrarna – ser samma sak.</p>
      <div class="field"><label for="ghToken">GitHub-token</label><input id="ghToken" type="password" autocomplete="off" value="${esc(s.ghToken)}">
        <span class="hint">Skapa en <a href="https://github.com/settings/tokens/new?scopes=gist&description=Familjens%20kockbok" target="_blank" rel="noopener">klassisk token med bara behörigheten "gist"</a>.</span></div>
      <div class="field"><label for="gistId">Gist-id</label><input id="gistId" value="${esc(s.gistId)}" placeholder="Lämna tomt och tryck Skapa för att starta en ny">
      </div>
      <div class="row">
        ${s.gistId ? `<button class="btn" data-syncnow>Synka nu</button>` : `<button class="btn" data-gistcreate>Skapa delad kockbok</button>`}
        <button class="ghost" data-savesync>Spara</button>
        <button class="ghost" data-sharelink>Kopiera länk för annan enhet</button>
      </div>
      <p class="hint muted" style="margin:10px 0 0;font-size:14px">Länken innehåller nycklarna – skicka den bara till er själva. Öppna den på den andra enheten så kopplas allt automatiskt.</p>
    </div>

    <div class="card">
      <h2>Familjen</h2>
      <p>Det här vet kocken alltid om er. Skriv in allergier, sådant barnen inte äter och hur mycket ni brukar äta.</p>
      <div class="field"><textarea id="profile" aria-label="Familjeprofil">${esc(S.data.profile)}</textarea></div>
      <button class="btn" data-saveprofile>Spara</button>
    </div>

    <div class="card">
      <h2>Smakminne</h2>
      <p>Saker kocken har lärt sig av era samtal. Ta bort det som inte stämmer, eller lägg till själv.</p>
      ${mem.length ? `<ul class="memory-list">${mem.map(m => `<li><span>${esc(m.text)}</span><button class="ghost small" data-forget="${m.id}">Ta bort</button></li>`).join('')}</ul>` : '<p class="muted">Inget ännu.</p>'}
      <div class="row"><input id="memNew" class="search" placeholder="T.ex. Vi älskar sambal" style="max-width:none"><button class="ghost" data-memadd>Lägg till</button></div>
    </div>

    <div class="card">
      <h2>Kockens instruktioner</h2>
      <p>Grundprompten från er Gemini-gem. Ändra fritt; svarsformatet för appen läggs till automatiskt.</p>
      <div class="field"><textarea id="instructions" class="tall" aria-label="Kockens instruktioner">${esc(S.data.instructions)}</textarea></div>
      <div class="row"><button class="btn" data-saveinstr>Spara</button><button class="ghost" data-resetinstr>Återställ original</button></div>
    </div>

    <div class="card">
      <h2>Utseende och data</h2>
      <div class="field"><label>Tema</label><div class="seg" role="group">${[['auto', 'Som enheten'], ['light', 'Ljust'], ['dark', 'Mörkt']].map(([k, l]) => `<button type="button" data-theme="${k}" aria-pressed="${s.theme === k}">${l}</button>`).join('')}</div></div>
      <div class="row"><button class="ghost" data-export>Ladda ner säkerhetskopia</button>
        <label class="ghost">Läs in säkerhetskopia<input type="file" accept="application/json" id="importFile" hidden></label></div>
    </div>
  </section>`;
}

/* ============ Händelser i vyerna ============ */
function bindStage() {
  const st = $('#stage');
  const homeAsk = $('#homeAsk', st);
  if (homeAsk) {
    homeAsk.onsubmit = e => {
      e.preventDefault();
      const v = $('#homeInput').value, img = S.homeAttach; S.homeAttach = null;
      send(v || (img ? 'Det här har vi hemma. Ge förslag.' : ''), img);
    };
    $('#homeInput').onkeydown = e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) homeAsk.requestSubmit(); };
    $('#homeFile').onchange = async e => {
      const f = e.target.files[0]; if (!f) return;
      S.homeAttach = await fileToImage(f);
      const el = $('#homeAttach'); el.hidden = false; el.innerHTML = `<img src="${S.homeAttach.url}" alt=""><span>Foto bifogat</span>`;
    };
  }
  const search = $('#bookSearch', st);
  if (search) search.oninput = e => { S.bookQuery = e.target.value; const pos = e.target.selectionStart; renderStage(); const n = $('#bookSearch'); n.focus(); n.setSelectionRange(pos, pos); };
  const notes = $('#notes', st);
  if (notes) notes.oninput = debounce(e => { const r = savedRecipe(); if (r) { r.notes = e.target.value; touch(r); saveData(); } }, 600);
  const imp = $('#importFile', st);
  if (imp) imp.onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    try { const d = JSON.parse(await f.text()); mergeData(d); saveData(); toast('Säkerhetskopian är inläst'); renderStage(); }
    catch { toast('Filen kunde inte läsas som en kockbok'); }
  };
}
const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
const savedRecipe = () => S.current.recipeSavedId && S.data.recipes.find(x => x.id === S.current.recipeSavedId);
const touch = r => { r.updatedAt = now(); };

$('#stage').addEventListener('click', async e => {
  const t = e.target;
  const q = t.closest('[data-quick]');
  if (q) { send(q.dataset.quick); return; }
  const pick = t.closest('[data-pick]');
  if (pick) { const s = S.current.suggestions[+pick.dataset.pick]; send(`Ge mig det kompletta receptet på ${s.name}.`); return; }
  if (t.closest('[data-more]')) { send('Ge mig fler förslag, gärna åt ett annat håll.'); return; }

  // Recept
  const chk = t.closest('[data-check]');
  if (chk) { S.checked[chk.dataset.check] = chk.checked; const row = chk.closest('.ing'); row.classList.toggle('checked', chk.checked); updateCount(); return; }
  const lite = t.closest('[data-lite]');
  if (lite) { e.stopPropagation(); flashIngredient(lite.dataset.lite); return; }
  const tm = t.closest('[data-timer]');
  if (tm) { const s = S.current.recipe.steps[+tm.dataset.timer]; startTimer(`Steg ${+tm.dataset.timer + 1}`, s.minutes); return; }
  const dn = t.closest('[data-done]');
  if (dn) { const n = +dn.dataset.done; S.doneSteps[n] = !S.doneSteps[n]; if (S.doneSteps[n] && S.activeStep === n) S.activeStep = n + 1 < S.current.recipe.steps.length ? n + 1 : null; refreshSteps(); return; }
  const step = t.closest('[data-step]');
  if (step && !t.closest('button')) { const n = +step.dataset.step; S.activeStep = S.activeStep === n ? null : n; refreshSteps(); return; }
  if (t.closest('[data-save]')) { saveRecipe(); return; }
  if (t.closest('[data-cooked]')) { const r = savedRecipe(); r.cooked = [...(r.cooked || []), now()]; touch(r); saveData(); toast('Antecknat! Sätt gärna betyg och skriv vad som blev bra.'); renderStage(); const n = $('#notes'); if (n) n.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
  const rate = t.closest('[data-rate]');
  if (rate) { const r = savedRecipe(); r.rating = r.rating === +rate.dataset.rate ? 0 : +rate.dataset.rate; touch(r); saveData(); const sc = $('.pane.steps')?.scrollTop || 0; renderStage(); const p = $('.pane.steps'); if (p) p.scrollTop = sc; return; }
  if (t.closest('[data-delete]')) {
    const r = savedRecipe();
    if (r && confirm(`Ta bort "${r.title}" ur kockboken?`)) {
      S.data.recipes = S.data.recipes.filter(x => x.id !== r.id); S.data.deleted[r.id] = now();
      S.current.recipeSavedId = null; saveData(); saveCurrent(); toast('Borttagen ur kockboken'); go('book');
    }
    return;
  }

  // Kockboken
  const op = t.closest('[data-open]');
  if (op) {
    const r = S.data.recipes.find(x => x.id === op.dataset.open);
    if (r) { S.current.recipe = JSON.parse(JSON.stringify(r)); S.current.recipeSavedId = r.id; S.current.dirty = false; S.checked = {}; S.doneSteps = {}; S.activeStep = null; saveCurrent(); go('recipe'); }
    return;
  }
  const fl = t.closest('[data-filter]');
  if (fl) { S.bookFilter = fl.dataset.filter; renderStage(); return; }

  // Inställningar
  const prov = t.closest('[data-prov]');
  if (prov) { readKeyFields(); S.settings.provider = prov.dataset.prov; saveSettings(); renderStage(); return; }
  if (t.closest('[data-savekeys]')) { readKeyFields(); saveSettings(); toast('Sparat'); return; }
  if (t.closest('[data-testai]')) { readKeyFields(); saveSettings(); openChat(true); send('Snabbtest: svara med en mening om vad du kan hjälpa oss med ikväll.'); return; }
  if (t.closest('[data-savesync]')) { readSyncFields(); saveSettings(); toast('Sparat'); if (S.settings.gistId) syncNow(); return; }
  if (t.closest('[data-gistcreate]')) { readSyncFields(); saveSettings(); createGist(); return; }
  if (t.closest('[data-syncnow]')) { readSyncFields(); saveSettings(); syncNow(true); return; }
  if (t.closest('[data-sharelink]')) { readKeyFields(); readSyncFields(); saveSettings(); copyShareLink(); return; }
  if (t.closest('[data-saveprofile]')) { S.data.profile = $('#profile').value; S.data.textUpdatedAt = now(); saveData(); toast('Familjeprofilen är sparad'); return; }
  if (t.closest('[data-saveinstr]')) { S.data.instructions = $('#instructions').value; S.data.textUpdatedAt = now(); saveData(); toast('Instruktionerna är sparade'); return; }
  if (t.closest('[data-resetinstr]')) { if (confirm('Återställ kockens instruktioner till originalet?')) { S.data.instructions = DEFAULT_INSTRUCTIONS; S.data.textUpdatedAt = now(); saveData(); renderStage(); toast('Återställt'); } return; }
  const fg = t.closest('[data-forget]');
  if (fg) { const m = S.data.memory.find(x => x.id === fg.dataset.forget); if (m) { m.deleted = true; m.updatedAt = now(); saveData(); renderStage(); } return; }
  if (t.closest('[data-memadd]')) { const v = $('#memNew').value.trim(); if (v) { S.data.memory.push({ id: uid(), text: v, at: now(), updatedAt: now() }); saveData(); renderStage(); } return; }
  const th = t.closest('[data-theme]');
  if (th) { S.settings.theme = th.dataset.theme; saveSettings(); applyTheme(); renderStage(); return; }
  if (t.closest('[data-export]')) {
    const blob = new Blob([JSON.stringify(S.data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `familjens-kockbok-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
});
function readKeyFields() {
  ['geminiKey', 'geminiModel', 'claudeKey', 'claudeModel'].forEach(k => { const el = document.getElementById(k); if (el) S.settings[k] = el.value.trim(); });
}
function readSyncFields() {
  ['ghToken', 'gistId'].forEach(k => { const el = document.getElementById(k); if (el) S.settings[k] = el.value.trim(); });
}
function updateCount() {
  const r = S.current.recipe; const c = $('.ingredients .count');
  if (c) c.textContent = `${r.ingredients.filter(i => S.checked[i.id]).length}/${r.ingredients.length} framme`;
}
function refreshSteps() {
  document.querySelectorAll('.step').forEach(li => {
    const n = +li.dataset.step;
    li.classList.toggle('active', S.activeStep === n); li.classList.toggle('done', !!S.doneSteps[n]);
    const b = li.querySelector('[data-done]'); if (b) b.textContent = S.doneSteps[n] ? 'Ångra klar' : 'Klar';
  });
  const a = document.querySelector('.step.active');
  if (a) a.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}
function flashIngredient(id) {
  document.querySelectorAll('.ing.lit').forEach(x => x.classList.remove('lit'));
  const el = document.querySelector(`.ing[data-ing="${CSS.escape(id)}"]`);
  if (!el) return;
  el.classList.add('lit');
  el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  clearTimeout(flashIngredient._t); flashIngredient._t = setTimeout(() => el.classList.remove('lit'), 2400);
}
function saveRecipe() {
  const r = S.current.recipe; if (!r) return;
  const existing = savedRecipe();
  if (existing) {
    Object.assign(existing, stripRecipe(r)); touch(existing);
    toast('Ändringarna är sparade i kockboken');
  } else {
    const rec = { ...stripRecipe(r), id: uid(), savedAt: now(), updatedAt: now(), notes: '', rating: 0, cooked: [] };
    S.data.recipes.push(rec); S.current.recipeSavedId = rec.id;
    toast('Sparad i familjens kockbok');
  }
  S.current.dirty = false; saveData(); saveCurrent(); renderStage();
}

/* ============ Timers ============ */
let audioCtx;
function startTimer(label, minutes) {
  S.timers.push({ id: uid(), label, end: Date.now() + minutes * 60000, done: false });
  try { audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)(); audioCtx.resume(); } catch { }
  toast(`Timer startad: ${fmtMin(minutes)}`);
  tickTimers();
}
function beep() {
  try {
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.frequency.value = 880; o.connect(g); g.connect(audioCtx.destination);
    g.gain.setValueAtTime(0.25, audioCtx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
    o.start(); o.stop(audioCtx.currentTime + 0.6);
  } catch { }
  if (navigator.vibrate) navigator.vibrate([300, 150, 300]);
}
function tickTimers() {
  const el = $('#timers');
  el.innerHTML = S.timers.map(t => {
    const left = Math.max(0, Math.round((t.end - Date.now()) / 1000));
    if (left === 0 && !t.done) { t.done = true; beep(); toast(`${t.label}: tiden är ute!`, 5000); }
    if (t.done && Date.now() % 4000 < 1000) beep();
    const mm = Math.floor(left / 60), ss = String(left % 60).padStart(2, '0');
    return `<button class="timer-chip ${t.done ? 'done' : ''}" data-tid="${t.id}" title="Tryck för att stänga">${esc(t.label)} ${t.done ? 'klar!' : `${mm}:${ss}`}</button>`;
  }).join('');
}
setInterval(() => { if (S.timers.length) tickTimers(); }, 1000);
$('#timers').addEventListener('click', e => {
  const b = e.target.closest('[data-tid]'); if (!b) return;
  const t = S.timers.find(x => x.id === b.dataset.tid);
  if (t && (t.done || confirm(`Stoppa timern "${t.label}"?`))) { S.timers = S.timers.filter(x => x !== t); tickTimers(); }
});

/* ============ Skärmen vaken ============ */
let wakeLock = null;
async function updateWakeLock() {
  try {
    if (S.route.view === 'recipe' && 'wakeLock' in navigator && document.visibilityState === 'visible') {
      if (!wakeLock) { wakeLock = await navigator.wakeLock.request('screen'); wakeLock.addEventListener('release', () => { wakeLock = null; }); }
    } else if (wakeLock) { await wakeLock.release(); wakeLock = null; }
  } catch { wakeLock = null; }
}

/* ============ Synk via GitHub Gist ============ */
function setSync(state, title = '') { S.sync.state = state; const el = $('#sync'); el.textContent = state; el.title = title; }
function scheduleSync() {
  if (!S.settings.ghToken || !S.settings.gistId) return;
  clearTimeout(S.sync.timer); S.sync.timer = setTimeout(() => syncNow(), 1500);
}
function gh(path, opts = {}) {
  return fetch('https://api.github.com' + path, {
    ...opts, headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${S.settings.ghToken}`, 'X-GitHub-Api-Version': '2022-11-28', ...(opts.body ? { 'Content-Type': 'application/json' } : {}) },
  });
}
async function createGist() {
  if (!S.settings.ghToken) { toast('Lägg in en GitHub-token först'); return; }
  setSync('Skapar…');
  const res = await gh('/gists', { method: 'POST', body: JSON.stringify({ description: 'Familjens kockbok', public: false, files: { [DATA_FILE]: { content: JSON.stringify(S.data, null, 1) } } }) });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) { setSync('Synk misslyckades', j.message || ''); toast('Kunde inte skapa: ' + (j.message || res.status)); return; }
  S.settings.gistId = j.id; saveSettings(); setSync('Synkad'); toast('Delad kockbok skapad'); renderStage();
}
let syncing = false;
async function syncNow(manual) {
  if (!S.settings.ghToken || !S.settings.gistId || syncing) return;
  syncing = true; setSync('Synkar…');
  try {
    const res = await gh('/gists/' + S.settings.gistId);
    const j = await res.json();
    if (!res.ok) throw new Error(j.message || res.status);
    const f = j.files?.[DATA_FILE];
    let remote = null;
    if (f) {
      const txt = f.truncated ? await (await fetch(f.raw_url)).text() : f.content;
      try { remote = JSON.parse(txt); } catch { remote = null; }
    }
    const before = canon(S.data);
    if (remote) mergeData(remote);
    LS.set('fk.data', S.data);
    const merged = canon(S.data);
    if (!remote || merged !== canon(Object.assign(freshData(), remote))) {
      const up = await gh('/gists/' + S.settings.gistId, { method: 'PATCH', body: JSON.stringify({ files: { [DATA_FILE]: { content: JSON.stringify(S.data, null, 1) } } }) });
      if (!up.ok) { const e = await up.json().catch(() => ({})); throw new Error(e.message || up.status); }
    }
    setSync('Synkad', 'Senast ' + new Date().toLocaleTimeString('sv-SE'));
    if (before !== merged && ['book', 'home', 'settings'].includes(S.route.view)) renderStage();
    if (manual) toast('Kockboken är synkad');
  } catch (e) {
    setSync('Synk misslyckades', String(e.message || e));
    if (manual) toast('Synk misslyckades: ' + (e.message || e));
  } finally { syncing = false; }
}
function canon(d) {
  const recipes = (d.recipes || []).slice().sort((a, b) => a.id.localeCompare(b.id)).map(r => r.id + '|' + (r.updatedAt || ''));
  const memory = (d.memory || []).map(m => m.id + '|' + (m.updatedAt || '')).sort();
  return JSON.stringify([d.textUpdatedAt, recipes, memory, Object.keys(d.deleted || {}).sort()]);
}
function mergeData(remote) {
  const L = S.data, R = Object.assign(freshData(), remote || {});
  const newer = (a, b) => (a?.updatedAt || a?.savedAt || '') >= (b?.updatedAt || b?.savedAt || '') ? a : b;
  const deleted = { ...(R.deleted || {}), ...(L.deleted || {}) };
  const byId = new Map();
  [...(R.recipes || []), ...(L.recipes || [])].forEach(r => { const e = byId.get(r.id); byId.set(r.id, e ? newer(e, r) : r); });
  L.recipes = [...byId.values()].filter(r => !deleted[r.id] || (r.updatedAt || '') > deleted[r.id]).sort((a, b) => a.id.localeCompare(b.id));
  const mem = new Map();
  [...(R.memory || []), ...(L.memory || [])].forEach(m => { const e = mem.get(m.id); mem.set(m.id, e ? newer(e, m) : m); });
  L.memory = [...mem.values()].sort((a, b) => (a.at || '').localeCompare(b.at || ''));
  if ((R.textUpdatedAt || '') > (L.textUpdatedAt || '')) { L.instructions = R.instructions; L.profile = R.profile; L.textUpdatedAt = R.textUpdatedAt; }
  L.deleted = deleted;
}
async function copyShareLink() {
  const payload = { geminiKey: S.settings.geminiKey, claudeKey: S.settings.claudeKey, provider: S.settings.provider, ghToken: S.settings.ghToken, gistId: S.settings.gistId };
  const link = location.origin + location.pathname + '#koppla=' + btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  try { await navigator.clipboard.writeText(link); toast('Länken är kopierad'); }
  catch { prompt('Kopiera länken:', link); }
}
function readShareLink() {
  const m = location.hash.match(/#koppla=([^&]+)/);
  if (!m) return;
  try {
    const p = JSON.parse(decodeURIComponent(escape(atob(m[1]))));
    Object.keys(p).forEach(k => { if (p[k]) S.settings[k] = p[k]; });
    saveSettings(); toast('Enheten är kopplad till familjens kockbok');
  } catch { toast('Kopplingslänken gick inte att läsa'); }
  history.replaceState(null, '', location.pathname);
}

/* ============ Tema & start ============ */
function applyTheme() {
  const t = S.settings.theme;
  if (t === 'auto') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.dataset.theme = t;
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') { syncNow(); updateWakeLock(); }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && $('#app').dataset.chat === 'open' && document.activeElement?.closest('#chat')) openChat(false);
});

readShareLink();
applyTheme();
go(S.current.recipe && LS.get('fk.lastView', '') === 'recipe' ? 'recipe' : 'home');
renderChat(true);
syncNow();
