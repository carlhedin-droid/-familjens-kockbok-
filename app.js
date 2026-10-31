/* Familjens kockbok — en statisk webbapp (GitHub Pages).
   AI: Gemini eller Claude via egen API-nyckel. Data: localStorage + valfri synk via privat GitHub Gist. */
'use strict';

/* ============ Standardtexter ============ */
const LEGACY_INSTRUCTIONS = `ROLL & TONALITET
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

const LEGACY_PROFILE = `Familj på 4: pappa, mamma och två tonåringar (13–15 år) med stor aptit. Vi äter ganska mycket – räkna hellre för rejält än för snålt.
Pappa: periodisk fasta och styrketräning, vill gå ner i vikt men äta mycket protein ("Pappas val").
Vi bor på Ekerö utanför Stockholm och handlar i vanliga svenska matbutiker.`;

const DEFAULT_INSTRUCTIONS = `ROLL
Du är vår personliga kockcoach och receptgranskare. Ton, kunskapsnivå, portioner, utrustning, kök och hälsomål styrs av INSTÄLLNINGAR nedan – följ dem.

DAG & TID
Anta att maten lagas idag om inget annat sägs. Följ dagläge och tidspreferens i INSTÄLLNINGAR:
- VARDAG: effektivitet, genvägar, "allt-i-ett", mindre disk.
- HELG: "proffsvägen" för maxad smak, nyttja specialutrustningen, matlagning som hobby.

DINA TRE ARBETSLÄGEN
1. Snabba köksfrågor (direkt fråga under matlagning): punktform eller max 3–5 meningar. Fokus på varför och hur – temperaturer, räddning av skurna såser, smakkombinationer.
2. Receptbearbetning (delat recept/länk eller vald rätt): metriska mått (gram/liter), skala till antalet portioner i INSTÄLLNINGAR. Mängden ska stå i varje steg så vi slipper scrolla. Korta, numrerade, imperativa steg ("Rosta kryddorna", "Sila såsen"). Missa inga kritiska moment. Hälsoanalys utifrån hälsomålen; tillåt fett/kalorier som ger hög smakutdelning ("Flavor ROI") – smak går före total asketism, maten får aldrig bli tråkig.
3. Inspiration (vi listar råvaror och vill ha förslag): antal förslag enligt INSTÄLLNINGAR, var och en med en kort förklaring till varför den passar just oss. Vardag: mest snabba/enkla. Helg: mer ambitiösa. Sprid över våra favoritkök, minst ett vegetariskt och minst ett tydligt hälsosammare förslag. Avsluta med att fråga vilken rätt vi vill ha komplett recept på.

Om viktig information saknas (t.ex. allergier), ställ en motfråga direkt.`;

const DEFAULT_PROFILE = `Två vuxna och två tonåringar (13–15 år). Vi bor på Ekerö och handlar i vanliga svenska matbutiker.
Allergier: inga kända.`;

const OPT = {
  eaters: ['Tonåringar', 'Småbarn', 'Tränande / idrottare', 'Kräsna ätare', 'Storätare', 'Gäster / vänner', 'Bara vuxna'],
  equipment: ['Matberedare', 'Airfryer / fritös', 'Slow cooker', 'Bakstål', 'Sous vide', 'Köttkvarn', 'Vakuummaskin', 'Grillpanna', 'Kolgrill', 'Gasolgrill', 'Wokpanna', 'Stor soppkastrull', 'Riskokare', 'Mixer', 'Köksassistent', 'Pizzaugn', 'Rökskåp', 'Mandolin', 'Ångkokare'],
  cuisines: ['Svenska', 'Nordiska', 'Franska', 'Italienska', 'Spanska', 'Grekiska', 'Libanesiska', 'Turkiska', 'Indiska', 'Thailändska', 'Malaysiska', 'Singaporianska', 'Vietnamesiska', 'Kinesiska', 'Koreanska', 'Japanska', 'Amerikanska', 'Mexikanska', 'Sydamerikanska', 'Vegetariskt med karaktär'],
  profiles: [
    ['vardag', 'Vardagspusslaren', 'Tid och smidighet först. Smarta maskiner, familjevänligt, utan stress.'],
    ['pryl', 'Entusiasten & prylnörden', 'Teknik och perfektion. Avancerad utrustning för restaurangklass hemma.'],
    ['hantverk', 'Hantverkaren & bagaren', 'Från grunden. Långsamma, metodiska processer och djupa smaker över tid.'],
    ['foodie', 'Foodien', 'Prylnördens tekniska exakthet kombinerad med nyfikenhet på globala matkulturer.'],
  ],
  tones: [
    ['rakt', 'Rakt på sak', 'Kort och koncist. Inget onödigt prat.', 'Hacka löken. Stek i smör på medelvärme 3 min. Tillsätt grädden.'],
    ['utbildande', 'Utbildande', 'Förklarar varför ett steg är viktigt och vilken teknik som används.', 'Stek löken långsamt i 10 min – sötman lockas fram utan att den bränns.'],
    ['inspirerande', 'Inspirerande', 'Varm och flexibel. Doft, smak och känsla, utrymme att improvisera.', 'Låt löken svettas tills den doftar fantastiskt, slå sedan i en rejäl skvätt grädde.'],
    ['proffs', 'Professionell', 'Restaurangtermer, förutsätter kunskap, fokus på temperaturer och tider.', 'Mise en place: finhacka löken. Fräs vid 140 °C tills translucent. Deglasera med grädde.'],
  ],
  health: [
    ['volym', 'Volym & Flavor ROI', 'Mycket mat, lite kalorier, maximal smak. Mättande "gratis" grönt som bas, en smakspets ovanpå.'],
    ['protein', 'Högprotein', 'Minst 30 g protein per portion.'],
    ['lowcarb', 'Lågkolhydrat', 'Bra fetter och protein, lite socker och stärkelse.'],
    ['veg', 'Vegetariskt & glutenfritt', 'Växtbaserat och rikt på mikronäringsämnen.'],
  ],
  time: [['snabbt', 'Snabbt', 'Max 20–30 min, minimal disk'], ['standard', 'Standard', 'Anpassat efter dagen'], ['gott', 'Gott om tid', 'Ambitiöst, hantverk och omsorg']],
  sugg: [['3-5', '3–5'], ['5-8', '5–8'], ['8-10', '8–10']],
};
const DEFAULT_PREFS = {
  portions: 4, bigEaters: true, eaters: ['Tonåringar', 'Tränande / idrottare'],
  profile: 'foodie',
  expertise: 'Foodie med hög kunskapsnivå, särskilt inom asiatisk matlagning efter 5 år i Malaysia/Singapore. Förklara inte grunder – fokusera på teknik och smakoptimering.',
  tone: 'rakt',
  health: ['volym', 'protein'], healthWho: 'Pappa',
  healthNote: 'Periodisk fasta och styrketräning. Mål: viktminskning men högt proteinintag.',
  healthyAlt: true,
  time: 'standard', sugg: '5-8',
  cuisines: ['Svenska', 'Franska', 'Italienska', 'Amerikanska', 'Mexikanska', 'Sydamerikanska', 'Malaysiska', 'Singaporianska', 'Japanska', 'Vegetariskt med karaktär'],
  equipment: ['Matberedare', 'Airfryer / fritös', 'Slow cooker', 'Bakstål', 'Sous vide', 'Köttkvarn', 'Vakuummaskin', 'Grillpanna', 'Kolgrill', 'Wokpanna', 'Stor soppkastrull'],
  customEquipment: [],
};

const S_STR = { type: 'STRING' }, S_STRN = { type: 'STRING', nullable: true }, S_ARR = { type: 'ARRAY', items: S_STR };
const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    reply: S_STR,
    suggestions: { type: 'ARRAY', nullable: true, items: { type: 'OBJECT', properties: {
      name: S_STR, origin: S_STR, countries: S_ARR, tag: { type: 'STRING', enum: ['VARDAG', 'HELG'] }, time: S_STR, difficulty: S_STR,
      why: S_STR, keyIngredients: S_ARR, equipment: S_STRN, healthier: { type: 'BOOLEAN' }, vegetarian: { type: 'BOOLEAN' } },
      required: ['name', 'origin', 'tag', 'time', 'why'] } },
    recipe: { type: 'OBJECT', nullable: true, properties: {
      title: S_STR, origin: S_STR, countries: S_ARR, tag: { type: 'STRING', enum: ['VARDAG', 'HELG'] }, time: S_STR, servings: { type: 'INTEGER' }, intro: S_STR,
      ingredients: { type: 'ARRAY', items: { type: 'OBJECT', properties: { id: S_STR, amount: S_STR, name: S_STR, note: S_STRN, group: S_STRN }, required: ['id', 'amount', 'name'] } },
      steps: { type: 'ARRAY', items: { type: 'OBJECT', properties: { text: S_STR, uses: S_ARR, minutes: { type: 'INTEGER', nullable: true } }, required: ['text'] } },
      health: { type: 'OBJECT', nullable: true, properties: { summary: S_STR, tips: S_ARR } },
      tips: S_ARR },
      required: ['title', 'ingredients', 'steps'] },
    learn: S_ARR,
  },
  required: ['reply'],
  propertyOrdering: ['reply', 'suggestions', 'recipe', 'learn'],
};

const FORMAT_RULES = `## APPENS SVARSFORMAT (måste följas)
Du svarar inuti en app. Svara ALLTID med exakt ett JSON-objekt – ingen text före eller efter, inga kodstaket.
{
  "reply": "Text som visas i chatten. Vid snabba frågor (LÄGE 1) är detta hela svaret. När du ger förslag eller recept: högst 1–2 meningar – upprepa INTE förslagen eller receptet här. Enkel markdown (**fet**, punktlistor med '- ') är ok.",
  "suggestions": null | [ { "name": "", "origin": "kök/land", "countries": ["MY"], "tag": "VARDAG" | "HELG", "time": "t.ex. 35 min", "difficulty": "Lätt" | "Medel" | "Avancerad", "why": "1–2 meningar om varför den passar oss", "keyIngredients": [""], "equipment": "" | null, "healthier": true|false, "vegetarian": true|false } ],
  "recipe": null | {
    "title": "", "origin": "", "countries": ["MY"], "tag": "VARDAG" | "HELG", "time": "", "servings": 4, "intro": "1–2 meningar",
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
- "countries": ISO 3166-1 alfa-2-koder (versaler) för rättens ursprungsland, t.ex. ["MY"], ["FR","SE"] för fusion. Regionalt kök → huvudlandet (Sydamerikanskt ceviche → ["PE"]).
- "group" används för att dela upp ingredienser (t.ex. "Marinad", "Sås", "Servering"); annars null.
- "learn": bara NYA saker vi själva sagt eller tydligt visat (t.ex. "Barnen tycker inte om koriander", "Vi gillade mer chili i panangen"). Inga gissningar. Annars [].
- Använd smakminnet och kockboken nedan för att träffa vår smak. Föreslå gärna variationer på rätter vi gett högt betyg.
- Svara på svenska. Om info saknas: ställ motfrågan i "reply" och sätt suggestions/recipe till null.`;

const DEFAULT_MODELS = { gemini: 'gemini-3.6-flash', claude: 'claude-sonnet-5-5' };
const GEMINI_FALLBACKS = ['gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
const DATA_FILE = 'familjens-kockbok.json';

/* ============ Lagring ============ */
const LS = {
  get(k, fb) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
};
const now = () => new Date().toISOString();
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

function freshData() {
  return { v: 1, prefs: JSON.parse(JSON.stringify(DEFAULT_PREFS)), instructions: DEFAULT_INSTRUCTIONS, profile: DEFAULT_PROFILE, textUpdatedAt: '1970-01-01T00:00:00.000Z',
           memory: [], recipes: [], deleted: {} };
}
const S = {
  settings: Object.assign({ provider: 'gemini', geminiKey: '', geminiModel: DEFAULT_MODELS.gemini,
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
// Gemini är standard (gratis). Flytta över äldre inställningar som saknar Claude-nyckel.
if (!S.settings.migratedGemini) {
  if (!S.settings.claudeKey) S.settings.provider = 'gemini';
  if (S.settings.geminiModel === 'gemini-flash-latest') S.settings.geminiModel = DEFAULT_MODELS.gemini;
  S.settings.migratedGemini = true; saveSettings();
}
// 3.8 är ofta överbelastad på gratisnivån – byt till 3.6 som standard
if (!S.settings.migrated36) { if (!S.settings.geminiModel || /3\.8|flash-latest/.test(S.settings.geminiModel)) S.settings.geminiModel = DEFAULT_MODELS.gemini; S.settings.migrated36 = true; saveSettings(); }
// Inställningar flyttade från prompten till klickbara val
S.data.prefs = Object.assign(JSON.parse(JSON.stringify(DEFAULT_PREFS)), S.data.prefs || {});
if (S.data.instructions === LEGACY_INSTRUCTIONS) S.data.instructions = DEFAULT_INSTRUCTIONS;
if (S.data.profile === LEGACY_PROFILE) S.data.profile = DEFAULT_PROFILE;
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
function dayMode() {
  const dm = S.settings.dayMode;
  return dm && dm.date === new Date().toDateString() ? dm.mode : 'auto';
}
function dayInfo(d = new Date()) {
  const wd = d.getDay();
  const mode = typeof S !== 'undefined' ? dayMode() : 'auto';
  const autoWeekend = wd === 5 || wd === 6 || wd === 0;
  const weekend = mode === 'auto' ? autoWeekend : mode === 'helg';
  return { name: DAYS[wd], weekend, manual: mode !== 'auto', label: weekend ? 'HELG' : 'VARDAG',
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
    .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')).slice(0, 30)
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

${prefsText(d)}

## OM FAMILJEN (fritext)
${S.data.profile}

## SMAKMINNE (det du lärt dig om oss)
${mem}

## FAMILJENS KOCKBOK (sparade rätter, betyg och våra anteckningar)
${book}

## IDAG
Idag är det ${d.name} ${d.date}, klockan ${d.time}. Dagläge: ${d.label}${d.manual ? ' (valt manuellt)' : ''}.

## DET SOM VISAS PÅ SKÄRMEN
${onScreen}

${FORMAT_RULES}`;
}
function prefsText(d) {
  const P = S.data.prefs;
  const find = (list, k) => list.find(x => x[0] === k) || [];
  const prof = find(OPT.profiles, P.profile), tone = find(OPT.tones, P.tone), time = find(OPT.time, P.time);
  const health = P.health.map(k => find(OPT.health, k)).filter(x => x[0]).map(x => `${x[1]} (${x[2]})`);
  const equip = [...P.equipment, ...P.customEquipment];
  return `## INSTÄLLNINGAR (styr dina svar)
- Dagläge: ${d.label}${d.manual ? ' – valt manuellt' : ' – automatiskt efter veckodag'}
- Tidspreferens: ${time[1]} – ${time[2]}
- Portioner: ${P.portions}${P.bigEaters ? ' rejäla portioner – vi äter mycket, räkna hellre för mycket' : ''}
- Vem äter: ${P.eaters.join(', ') || 'ej angivet'}
- Kockprofil: ${prof[1]} – ${prof[2]}
- Vår kunskapsnivå: ${P.expertise || 'ej angiven'}
- Tonalitet: ${tone[1]} – ${tone[2]} Exempel på stil: "${tone[3]}"
- Hälsomål${P.healthWho ? ` (gäller ${P.healthWho})` : ''}: ${health.join('; ') || 'inga särskilda'}${P.healthNote ? `. ${P.healthNote}` : ''}
- Lättare alternativ: ${P.healthyAlt ? `ja – avsluta alltid receptet med hur det anpassas för ${P.healthWho || 'den'} som vill äta lättare ("health" i receptet)` : 'bara om vi ber om det'}
- Favoritkök: ${P.cuisines.join(', ') || 'alla'}
- Utrustning vi har: ${equip.join(', ') || 'vanligt hemmakök'}
- Antal förslag i inspirationsläget: ${(find(OPT.sugg, P.sugg)[1]) || '5–8'}`;
}
function stripRecipe(r) {
  const { id, savedAt, updatedAt, notes, rating, cooked, ...rest } = r;
  return rest;
}

/* ============ AI-anrop ============ */
function historyForModel() {
  return S.chat.filter(m => m.role === 'user' || m.role === 'assistant').slice(-16).map(m => {
    if (m.role === 'user') return { role: 'user', text: m.text || '(foto)', image: m.image };
    // Assistentens tidigare svar i samma JSON-form som den ska svara i (receptet självt ligger i systemprompten)
    const o = { reply: m.placeholder ? '' : (m.text || '') };
    if (m.view?.recipe) o.recipe = `(receptet "${m.view.recipe.title}" visades)`;
    if (m.view?.suggestions) o.suggestions = m.view.suggestions.map(x => x.name);
    return { role: 'assistant', text: JSON.stringify(o) };
  });
}
async function callModel(onProgress = () => {}) {
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
  const lastUser = [...msgs].reverse().find(m => m.role === 'user');
  const hasLink = /https?:\/\/\S+/.test(lastUser?.text || '');
  let schema = RESPONSE_SCHEMA;
  const mkBody = thinking => JSON.stringify({
    ...(hasLink ? { tools: [{ url_context: {} }] } : {}),
    systemInstruction: { parts: [{ text: sys }] },
    contents: mergeRoles(msgs).map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [
      ...(m.image ? [{ inlineData: { mimeType: m.image.mime, data: m.image.data } }] : []), { text: m.text } ] })),
    generationConfig: { ...(hasLink ? {} : { responseMimeType: 'application/json', responseSchema: schema }), temperature: 0.8, ...(thinking ? { thinkingConfig: { thinkingLevel: thinking } } : {}) },
  });
  // Prova vald modell först, sedan reservmodeller om den inte finns/inte ingår i gratisnivån
  const models = [...new Set([S.settings.geminiModel || DEFAULT_MODELS.gemini, ...GEMINI_FALLBACKS])];
  let lastErr = '';
  for (const model of models) {
    // Minsta tänkande = snabbast. 3.8 klarar "low", övriga "minimal".
    let thinking = /3\.8|latest/.test(model) ? 'low' : 'minimal';
    for (let attempt = 0; attempt < 3; attempt++) {
      let res;
      try {
        res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key }, body: mkBody(thinking) });
      } catch (e) { throw new Error('Kunde inte nå Google (nätverksfel). Kontrollera internetuppkopplingen.'); }
      if (res.ok) {
        if (model !== S.settings.geminiModel && !/överbelastad|kvot/.test(lastErr)) { S.settings.geminiModel = model; saveSettings(); }
        const reader = res.body.getReader(); const dec = new TextDecoder();
        let buf = '', txt = '', finish = '';
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          let i;
          while ((i = buf.indexOf('\n')) >= 0) {
            const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
            if (!line.startsWith('data:')) continue;
            try {
              const j = JSON.parse(line.slice(5));
              const c = j.candidates?.[0];
              (c?.content?.parts || []).forEach(p => { if (!p.thought && p.text) txt += p.text; });
              if (c?.finishReason) finish = c.finishReason;
              onProgress(txt);
            } catch { /* ofullständig rad */ }
          }
        }
        if (!txt) throw new Error('Tomt svar från Gemini (' + (finish || 'okänd orsak') + ')');
        return txt;
      }
      const j = await res.json().catch(() => ({}));
      const msg = j.error?.message || `HTTP ${res.status}`;
      const status = j.error?.status || '';
      console.warn('Gemini', model, res.status, status, msg);
      if (res.status === 400 && thinking && /think/i.test(msg)) { thinking = null; continue; }  // modellen godtar inte nivån
      if (res.status === 400 && schema && /schema|response_schema|responseSchema/i.test(msg)) { schema = undefined; continue; }
      lastErr = `${model}: ${msg}`;
      // Överbelastad (503/500) eller kvot slut (429): prova nästa modell direkt
      if (res.status === 503 || res.status === 500 || res.status === 429 || /UNAVAILABLE|high demand|overloaded|RESOURCE_EXHAUSTED/i.test(msg + status)) {
        lastErr = res.status === 429 ? `${model}: gratiskvoten är slut för stunden` : `${model}: överbelastad just nu`;
        onProgress('', 'Google har mycket att göra – provar igen…');
        if (attempt === 0 && res.status !== 429) { await new Promise(r => setTimeout(r, 1500)); continue; }
        break;
      }
      if (res.status === 404 || /not found|not supported|no longer available|ACCESS_TOKEN_TYPE_UNSUPPORTED/i.test(msg + status)) break;
      if (res.status === 400 && /API key not valid|API_KEY_INVALID/i.test(msg + JSON.stringify(j))) throw new Error('Google säger att nyckeln är ogiltig. Kopiera den igen från aistudio.google.com/apikey och spara på nytt.');
      if (res.status === 403) throw new Error('Nyckeln saknar behörighet (403): ' + msg + ' – skapa en ny nyckel i AI Studio.');
      throw new Error(lastErr);
    }
  }
  throw new Error('Googles gratismodeller är överbelastade just nu (' + lastErr + '). Vänta en minut och försök igen.');
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
  const t = String(raw ?? '').trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  let o = null;
  const a = t.indexOf('{'), b = t.lastIndexOf('}');
  if (a >= 0 && b > a) { try { o = JSON.parse(t.slice(a, b + 1)); } catch { o = null; } }
  if (Array.isArray(o)) o = o.find(x => x && typeof x === 'object') || null;
  if (!o || typeof o !== 'object') {
    // Inte giltig JSON: plocka ut "reply" om det finns, annars visa texten utan JSON-skräp
    const r = partialReply(t);
    o = { reply: r || (a >= 0 ? '' : t) };
  }
  return { reply: cleanReply(o.reply), suggestions: o.suggestions ?? null, recipe: o.recipe ?? null, learn: Array.isArray(o.learn) ? o.learn : [] };
}
function cleanReply(r) {
  if (r == null) return '';
  if (typeof r === 'object') r = r.text || r.reply || '';
  r = String(r).trim();
  if (/^(null|undefined|none|n\/a|\{\}|\[\])$/i.test(r)) return '';
  // Ta bort ev. inbakade JSON-rester och våra gamla interna noteringar
  r = r.replace(/\n?\[(Visade receptet|Visade förslag)[^\]]*\]/g, '').replace(/^"|"$/g, '').trim();
  return r;
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

function partialReply(acc) {
  const m = acc.match(/"reply"\s*:\s*"((?:[^"\\]|\\.)*)/);
  if (!m) return '';
  try { return JSON.parse('"' + m[1].replace(/\\$/, '') + '"'); } catch { return m[1].replace(/\\n/g, '\n'); }
}
function showProgress(acc, override) {
  const what = override ? override : /"recipe"\s*:\s*\{/.test(acc) ? 'Kocken skriver receptet…'
    : /"suggestions"\s*:\s*\[/.test(acc) ? `Kocken plockar fram förslag… (${(acc.match(/"name"\s*:/g) || []).length} hittills)`
    : 'Kocken tänker…';
  const st = document.getElementById('stageStatus'); if (st) st.textContent = what;
  const live = document.getElementById('liveReply');
  const r = partialReply(acc);
  if (live && r) { live.classList.remove('typing'); live.innerHTML = md(r); const log = $('#chatLog'); log.scrollTop = log.scrollHeight; }
}
// flow = receptval från huvudfönstret (knappar/startsida). Syns inte i chatten, men kocken minns det.
async function send(text, image, opts = {}) {
  text = (text || '').trim();
  if ((!text && !image) || S.busy) return;
  const flow = !!opts.flow;
  const userMsg = { role: 'user', text: text || 'Vad kan jag laga av det här?', image, at: now(), hidden: flow };
  S.chat.push(userMsg);
  S.busy = flow ? 'flow' : 'chat'; saveChat(); renderChat(true);
  if (S.route.view === 'home' || S.route.view === 'suggestions') renderStage();
  try {
    const raw = await callModel(showProgress);
    const o = parseReply(raw);
    const msg = { role: 'assistant', text: o.reply || '', at: now() };
    const recipe = normalizeRecipe(o.recipe);
    const sugg = Array.isArray(o.suggestions) && o.suggestions.length ? o.suggestions : null;
    if (recipe) {
      const keepId = S.route.view === 'recipe' ? S.current.recipeSavedId : null;
      S.current.recipe = recipe; S.current.recipeSavedId = keepId; S.current.dirty = !!keepId;
      S.checked = {}; S.doneSteps = {}; S.activeStep = null;
      msg.view = { recipe };
      if (flow) msg.hidden = true; else msg.updated = true;
      if (S.route.view !== 'recipe') go('recipe', { keepChat: true }); else { const sc = $('#stage').scrollTop; renderStage(); $('#stage').scrollTop = sc; }
    } else if (sugg) {
      S.current.suggestions = sugg; S.current.suggIntro = o.reply || '';
      msg.view = { suggestions: sugg };
      msg.hidden = true; userMsg.hidden = true;
      go('suggestions', { keepChat: true });
    }
    const learned = (Array.isArray(o.learn) ? o.learn : []).map(s => cleanReply(s)).filter(x => x.length > 3);
    if (!recipe && !sugg && !msg.text) { msg.text = 'Kocken gav inget svar på det. Försök formulera om frågan.'; msg.placeholder = true; }
    if (learned.length) {
      const existing = new Set(S.data.memory.filter(m => !m.deleted).map(m => m.text.toLowerCase()));
      const fresh = learned.filter(l => !existing.has(l.toLowerCase()));
      fresh.forEach(t => S.data.memory.push({ id: uid(), text: t, at: now(), updatedAt: now() }));
      if (fresh.length) { msg.learned = fresh; saveData(); }
    }
    // Motfråga eller vanligt svar på ett receptval: visa i chatten med frågan
    if (!recipe && !sugg) { userMsg.hidden = false; msg.hidden = false; openChat(true); }
    S.chat.push(msg);
    saveCurrent();
  } catch (e) {
    const nokey = e.message === 'NOKEY';
    S.chat.push({ role: 'error', text: nokey ? 'Kocken behöver en gratis Gemini-nyckel. Lägg in den under Inställningar.' : `Det gick inte att nå kocken: ${e.message}`, nokey, at: now() });
    openChat(true);
  } finally {
    S.busy = false; saveChat(); renderChat(true);
    if (S.route.view === 'home' || S.route.view === 'suggestions') renderStage();
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
  renderChat();
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
  const visible = S.chat.filter(m => !m.hidden);
  const r = S.current.recipe && S.route.view === 'recipe' ? S.current.recipe : null;
  if (!visible.length) {
    const asks = r
      ? [['Kan jag förbereda något i förväg?', 'Förbereda i förväg'], ['Vad kan jag byta ut om jag saknar något?', 'Saknar en råvara'], ['Gör receptet lite lättare utan att tappa smak.', 'Gör den lättare']]
      : [['Hur räddar jag en sås som skurit sig?', 'Såsen skar sig'], ['Vilken innertemperatur ska fläskkarré ha?', 'Innertemp karré'], ['Hur länge ska ris vila efter kokning?', 'Vila riset']];
    log.innerHTML = `<div class="chat-empty"><p>${r ? `Frågor om <strong>${esc(r.title)}</strong>. Ber du om en ändring uppdateras receptet direkt.` : 'Snabba frågor medan du lagar. Recept väljer du i huvudfönstret.'}</p>
      ${asks.map(([q, l]) => `<button class="chip" data-ask="${esc(q)}">${esc(l)}</button>`).join('')}</div>`;
  } else {
    log.innerHTML = visible.map(m => {
      if (m.role === 'user') return `<div class="msg user">${m.image ? `<img src="${m.image.url}" alt="Bifogat foto">` : ''}${md(m.text)}</div>`;
      if (m.role === 'error') return `<div class="msg error">${esc(m.text)}${m.nokey ? ` <button class="view-link" data-go="settings">Öppna inställningar</button>` : ''}</div>`;
      let extra = '';
      if (m.updated) extra += `<div class="learned">✓ Receptet är uppdaterat</div>`;
      if (m.learned?.length) extra += `<div class="learned">Kocken kommer ihåg: ${m.learned.map(esc).join(' · ')}</div>`;
      return `<div class="msg assistant">${md(m.text) || ''}${extra}</div>`;
    }).join('');
  }
  if (S.busy === 'chat') log.insertAdjacentHTML('beforeend', `<div class="msg assistant typing" id="liveReply" aria-label="Kocken skriver"><i></i><i></i><i></i></div>`);
  $('#chatInput').disabled = false;
  $('#composer .send').disabled = !!S.busy;
  if (scroll) log.scrollTop = log.scrollHeight;
}
$('#chatLog').addEventListener('click', e => {
  const a = e.target.closest('[data-ask]');
  if (a) send(a.dataset.ask);
});

/* ============ Vyer ============ */
function renderStage() {
  const st = $('#stage');
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
  const P = S.data.prefs;
  const hint = (d.weekend
    ? `${d.manual ? 'Helgläge' : `Det är <strong>${d.name}</strong> – helg`}. Kocken räknar med tid för ${P.equipment.includes('Kolgrill') ? 'kolgrillen, ' : ''}${P.equipment.includes('Sous vide') ? 'sous viden ' : ''}eller ett längre projekt.`
    : `${d.manual ? 'Vardagsläge' : `Det är <strong>${d.name}</strong> – vardag`}. Kocken håller det snabbt, med lite disk.`)
    + ` <button class="linkish" data-status>Ändra</button>`;
  const recent = S.data.recipes.slice().sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')).slice(0, 4);
  if (S.busy === 'flow') {
    return `<section class="home"><div class="loading-stage">${potSvg()}<span id="stageStatus">Kocken tänker…</span></div></section>`;
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
  if (S.busy === 'flow') return `<section class="home"><div class="loading-stage">${potSvg()}<span id="stageStatus">Kocken tänker…</span></div></section>`;
  const list = S.current.suggestions || [];
  if (!list.length) return `<div class="empty"><h2>Inga förslag än</h2><p>Berätta vad ni har så föreslår kocken rätter.</p><button class="btn" data-go="home">Till kocken</button></div>`;
  return `<section>
    <div class="sugg-head"><h1>${list.length} förslag till ${dayInfo().name}</h1></div>
    ${S.current.suggIntro ? `<div class="sugg-intro">${md(S.current.suggIntro)}</div>` : ''}
    <div class="sugg-grid">${list.map((s, i) => `
      <article class="sugg ${s.healthier ? 'healthier' : ''}">
        <div class="tags">
          <span class="tag ${String(s.tag).toLowerCase() === 'helg' ? 'helg' : 'vardag'}">${String(s.tag).toLowerCase() === 'helg' ? 'Helg' : 'Vardag'}</span>
          ${s.healthier ? `<span class="tag healthy">${esc(healthLabel())}</span>` : ''}
          ${s.vegetarian ? '<span class="tag veg">Vegetarisk</span>' : ''}
        </div>
        <h3>${esc(s.name)}</h3>
        ${s.origin || s.countries ? `<div class="origin">${flags(s)}<span>${esc(s.origin || '')}</span></div>` : ''}
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
  const checkedCount = r.ingredients.filter(i => S.checked[i.id]).length;
  const doneCount = r.steps.filter((_, n) => S.doneSteps[n]).length;
  const isHelg = String(r.tag).toLowerCase() === 'helg';
  return `<article class="recipe">
  <header class="r-head">
    ${r.origin || r.countries ? `<div class="r-origin origin">${flags(r)}<span>${esc(r.origin || '')}</span></div>` : ''}
    <h1>${esc(r.title)}</h1>
    <div class="r-meta">
      ${r.tag ? `<span class="tag ${isHelg ? 'helg' : 'vardag'}">${isHelg ? 'Helg' : 'Vardag'}</span>` : ''}
      ${r.time ? `<span>${esc(r.time)}</span>` : ''}
      <span>${esc(r.servings)} portioner</span>
      ${saved?.rating ? `<span style="color:var(--kunyit)">${'★'.repeat(saved.rating)}</span>` : ''}
    </div>
    ${r.intro ? `<p class="r-intro">${esc(r.intro)}</p>` : ''}
    <div class="r-actions">
      ${!saved ? `<button class="btn" data-save>Spara i kockboken</button>`
        : S.current.dirty ? `<button class="btn" data-save>Spara ändringarna</button>`
        : `<button class="ghost" data-cooked>Vi lagade den idag</button>`}
      ${S.current.suggestions && !saved ? `<button class="ghost" data-go="suggestions">Tillbaka till förslagen</button>` : ''}
      ${saved ? `<button class="ghost" data-go="book">Kockboken</button>` : ''}
    </div>
  </header>

  <nav class="r-jump" aria-label="Hoppa till">
    <button data-jump="r-ing" class="on">Ingredienser <span>${checkedCount}/${r.ingredients.length}</span></button>
    <button data-jump="r-steps">Gör så här <span>${doneCount}/${r.steps.length}</span></button>
  </nav>

  <section class="r-sec ingredients" id="r-ing" aria-label="Ingredienser">
    <div class="sec-head"><h2>Ingredienser</h2><span class="muted">${esc(r.servings)} portioner · bocka av det du tagit fram</span></div>
    ${groups.map(g => `<div class="ing-group">${g.name ? `<h3 class="group-label">${esc(g.name)}</h3>` : ''}
      ${g.items.map(i => `<label class="ing ${S.checked[i.id] ? 'checked' : ''}" data-ing="${esc(i.id)}">
        <input type="checkbox" ${S.checked[i.id] ? 'checked' : ''} data-check="${esc(i.id)}">
        <span class="amt">${esc(i.amount)}</span>
        <span><span class="name">${esc(i.name)}</span>${i.note ? ` <span class="note">${esc(i.note)}</span>` : ''}</span>
      </label>`).join('')}</div>`).join('')}
    <button class="btn start-cook" data-startcook>Allt är framme – börja laga</button>
  </section>

  <section class="r-sec steps" id="r-steps" aria-label="Gör så här">
    <div class="sec-head"><h2>Gör så här</h2><span class="muted">Tryck på ett steg för att markera var du är</span></div>
    <ol>${r.steps.map((s, n) => `
      <li class="step ${S.activeStep === n ? 'active' : ''} ${S.doneSteps[n] ? 'done' : ''}" data-step="${n}">
        <div class="step-text">${highlightAmounts(s.text)}</div>
        <div class="step-tools">
          ${s.minutes ? `<button class="ghost" data-timer="${n}">⏱ ${fmtMin(s.minutes)}</button>` : ''}
          <button class="ghost" data-done="${n}">${S.doneSteps[n] ? 'Ångra' : 'Klar'}</button>
        </div>
      </li>`).join('')}</ol>
  </section>

  ${r.health || r.tips?.length ? `<section class="r-sec extras">
    ${r.health ? `<div class="health"><h3>${esc(healthLabel())}</h3>${r.health.summary ? `<div>${md(r.health.summary)}</div>` : ''}
      ${r.health.tips?.length ? `<ul>${r.health.tips.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}</div>` : ''}
    ${r.tips?.length ? `<div class="tips"><h3>Kockens tips</h3><ul>${r.tips.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>` : ''}
  </section>` : ''}
  ${saved ? `<section class="r-sec">${notesBox(saved)}</section>` : ''}
  </article>`;
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

const FLAG_WORDS = [
  [/svensk|sverige|nordisk|skandinav/i, 'SE'], [/fransk|frankrike|provens/i, 'FR'], [/italien/i, 'IT'], [/spansk|spanien|katalan/i, 'ES'],
  [/grek/i, 'GR'], [/liban|levant/i, 'LB'], [/turk/i, 'TR'], [/indisk|indien/i, 'IN'], [/thai/i, 'TH'], [/malays|nyonya|peranakan/i, 'MY'],
  [/singapor/i, 'SG'], [/vietnam/i, 'VN'], [/kines|kina|sichuan|kanton/i, 'CN'], [/korea/i, 'KR'], [/japan/i, 'JP'],
  [/amerikan|usa|texas|cajun|southern/i, 'US'], [/mexik|tex-mex/i, 'MX'], [/peru/i, 'PE'], [/argentin/i, 'AR'], [/brasil/i, 'BR'],
  [/marock|nordafrik/i, 'MA'], [/britt|engelsk|england/i, 'GB'], [/tysk/i, 'DE'], [/indones/i, 'ID'], [/filippin/i, 'PH'],
  [/jamaica|karib/i, 'JM'], [/etiop/i, 'ET'], [/portug/i, 'PT'], [/ungern|ungersk/i, 'HU'], [/polsk|polen/i, 'PL'], [/israel/i, 'IL'], [/persisk|iran/i, 'IR'],
];
function countryCodes(x) {
  let c = Array.isArray(x.countries) ? x.countries.map(v => String(v).trim().toUpperCase()).filter(v => /^[A-Z]{2}$/.test(v)) : [];
  if (!c.length && x.origin) c = FLAG_WORDS.filter(([re]) => re.test(x.origin)).map(([, cc]) => cc);
  return [...new Set(c)].slice(0, 3);
}
function flags(x) {
  // Bilder i stället för emoji – Windows visar inte flagg-emoji
  return countryCodes(x).map(cc => `<img class="flag" src="https://flagcdn.com/w40/${cc.toLowerCase()}.png" alt="${cc}" title="${cc}" width="22" height="16" loading="lazy">`).join('');
}
function healthLabel() {
  const who = (S.data.prefs.healthWho || '').trim();
  return who ? `${who}s val` : 'Nyttigare';
}
function bookRow(r) {
  return `<button class="book-row" data-open="${esc(r.id)}">
    <h3><span class="origin">${flags(r)}</span>${esc(r.title)}</h3>
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

function prefsCards() {
  const P = S.data.prefs;
  const chip = (key, val, label = val) => `<button type="button" class="chip opt" data-ptoggle="${key}" data-val="${esc(val)}" aria-pressed="${P[key].includes(val)}">${esc(label)}</button>`;
  const card = (key, [k, title, desc, ex]) => `<button type="button" class="opt-card" data-pset="${key}" data-val="${k}" aria-pressed="${P[key] === k}"><strong>${esc(title)}</strong><span>${esc(desc)}</span>${ex ? `<em>”${esc(ex)}”</em>` : ''}</button>`;
  return `
    <div class="card">
      <h2>Hushållet</h2>
      <p>Hur många ni är och vilka som äter. Ändringar sparas direkt.</p>
      <div class="field"><label>Portioner</label>
        <div class="row"><div class="stepper"><button type="button" data-portions="-1" aria-label="Färre portioner">−</button><output>${P.portions}</output><button type="button" data-portions="1" aria-label="Fler portioner">+</button></div>
        <button type="button" class="chip opt" data-pbool="bigEaters" aria-pressed="${P.bigEaters}">Vi äter mycket – räkna rejält</button></div></div>
      <div class="field"><label>Vem äter maten?</label><div class="chips">${OPT.eaters.map(v => chip('eaters', v)).join('')}</div></div>
      <div class="field"><label for="profile">Övrigt om familjen</label><textarea id="profile" data-ptext="profile" rows="3" style="min-height:90px">${esc(S.data.profile)}</textarea><span class="hint">Allergier, sådant någon inte äter, var ni handlar.</span></div>
    </div>

    <div class="card">
      <h2>Kockprofil och ton</h2>
      <p>Vilken sorts kock ni är och hur instruktionerna ska låta.</p>
      <div class="field"><label>Kockprofil</label><div class="opt-grid">${OPT.profiles.map(o => card('profile', o)).join('')}</div></div>
      <div class="field"><label for="expertise">Kunskapsnivå och bakgrund</label><textarea id="expertise" data-ptext="expertise" rows="3" style="min-height:80px">${esc(P.expertise)}</textarea></div>
      <div class="field"><label>Tonalitet</label><div class="opt-grid">${OPT.tones.map(o => card('tone', o)).join('')}</div></div>
    </div>

    <div class="card">
      <h2>Hälsomål</h2>
      <p>Styr hälsoanalysen i recepten och det nyttigare förslaget i inspirationen.</p>
      <div class="opt-grid">${OPT.health.map(([k, t, d]) => `<button type="button" class="opt-card" data-ptoggle="health" data-val="${k}" aria-pressed="${P.health.includes(k)}"><strong>${esc(t)}</strong><span>${esc(d)}</span></button>`).join('')}</div>
      <div class="field" style="margin-top:14px"><label for="healthWho">Vem gäller målen?</label><input id="healthWho" data-ptext="healthWho" value="${esc(P.healthWho)}" placeholder="T.ex. Pappa, alla"></div>
      <div class="field"><label for="healthNote">Eget kostmål</label><textarea id="healthNote" data-ptext="healthNote" rows="2" style="min-height:70px">${esc(P.healthNote)}</textarea></div>
      <button type="button" class="chip opt" data-pbool="healthyAlt" aria-pressed="${P.healthyAlt}">Avsluta alltid med ett lättare alternativ</button>
    </div>

    <div class="card">
      <h2>Tid och förslag</h2>
      <div class="field"><label>Tidspreferens</label><div class="opt-grid three">${OPT.time.map(o => card('time', o)).join('')}</div><span class="hint">Vardag eller helg väljs automatiskt efter veckodag. Det går att ändra tillfälligt via knappen uppe till höger.</span></div>
      <div class="field"><label>Antal förslag i inspirationen</label><div class="seg" role="group">${OPT.sugg.map(([k, l]) => `<button type="button" data-pset="sugg" data-val="${k}" aria-pressed="${P.sugg === k}">${l}</button>`).join('')}</div></div>
    </div>

    <div class="card">
      <h2>Favoritkök</h2>
      <p>Förslagen sprids över de kök ni väljer.</p>
      <div class="chips">${OPT.cuisines.map(v => chip('cuisines', v)).join('')}</div>
    </div>

    <div class="card">
      <h2>Köksutrustning</h2>
      <p>Kocken planerar tekniken efter det ni har.</p>
      <div class="chips">${OPT.equipment.map(v => chip('equipment', v)).join('')}${P.customEquipment.map(v => `<button type="button" class="chip opt" data-premove="${esc(v)}" aria-pressed="true" title="Tryck för att ta bort">${esc(v)} ×</button>`).join('')}</div>
      <div class="row" style="margin-top:12px"><input id="equipNew" class="search" placeholder="Lägg till egen, t.ex. Kamado" style="max-width:none"><button class="ghost" data-equipadd>Lägg till</button></div>
    </div>`;
}

function viewSettings() {
  const s = S.settings, p = s.provider;
  const mem = S.data.memory.filter(m => !m.deleted);
  const keyField = p === 'claude' ? 'claudeKey' : 'geminiKey';
  const ai = S.aiStatus || (s[keyField] ? '' : 'Ingen nyckel ännu');
  const sync = !s.ghToken ? 'Av – kockboken finns bara på den här enheten' : (S.sync.state === 'Synkad' ? `✓ På – ${$('#sync').title || 'synkad'}` : S.sync.state || 'Kopplar…');
  return `<section class="settings">
    <h1>Inställningar</h1>

${prefsCards()}

    <div class="card">
      <h2>Smakminne</h2>
      <p>Saker kocken har lärt sig av era samtal. Ta bort det som inte stämmer, eller lägg till själv.</p>
      ${mem.length ? `<ul class="memory-list">${mem.map(m => `<li><span>${esc(m.text)}</span><button class="ghost small" data-forget="${m.id}">Ta bort</button></li>`).join('')}</ul>` : '<p class="muted">Inget ännu.</p>'}
      <div class="row"><input id="memNew" class="search" placeholder="T.ex. Vi älskar sambal" style="max-width:none"><button class="ghost" data-memadd>Lägg till</button></div>
    </div>

    <div class="card">
      <h2>Koppling</h2>
      <p>Görs en gång per enhet. Nycklarna sparas bara i webbläsaren.</p>
      <div class="field"><label for="${keyField}">${p === 'claude' ? 'Claude-nyckel' : 'Gemini-nyckel (gratis)'}</label>
        <input id="${keyField}" type="password" autocomplete="off" value="${esc(s[keyField])}" placeholder="Klistra in nyckeln">
        <span class="hint">${p === 'claude' ? 'Från <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener">console.anthropic.com</a>.' : 'Hämtas på <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">aistudio.google.com/apikey</a>.'}${ai ? ` <strong class="status-line">${esc(ai)}</strong>` : ''}</span></div>
      <div class="field"><label for="ghToken">GitHub-token för att dela kockboken <span class="muted">(valfritt)</span></label>
        <input id="ghToken" type="password" autocomplete="off" value="${esc(s.ghToken)}" placeholder="ghp_…">
        <span class="hint">Behövs bara om fler enheter ska se samma kockbok. <a href="https://github.com/settings/tokens/new?scopes=gist&description=Familjens%20kockbok" target="_blank" rel="noopener">Skapa token</a> (bara behörigheten "gist"). <strong class="status-line">${esc(sync)}</strong></span></div>
      <div class="row"><button class="btn" data-connect>Spara och testa</button>
        ${s[keyField] ? `<button class="ghost" data-sharelink>Kopiera länk till annan enhet</button>` : ''}</div>
      ${s[keyField] ? `<p class="hint muted" style="margin:10px 0 0;font-size:14px">Öppna länken på mobilen eller plattan så kopplas den automatiskt. Länken innehåller nycklarna – skicka den bara till er själva.</p>` : ''}
    </div>

    <details class="card adv">
      <summary><h2>Avancerat</h2></summary>
      <div class="field"><label>AI-tjänst</label>
        <div class="seg" role="group"><button type="button" data-prov="gemini" aria-pressed="${p === 'gemini'}">Google Gemini</button><button type="button" data-prov="claude" aria-pressed="${p === 'claude'}">Anthropic Claude</button></div></div>
      <div class="field"><label for="${p === 'claude' ? 'claudeModel' : 'geminiModel'}">Modell</label><input id="${p === 'claude' ? 'claudeModel' : 'geminiModel'}" value="${esc(p === 'claude' ? s.claudeModel : s.geminiModel)}">
        <span class="hint">Standard: ${DEFAULT_MODELS[p]}.${p === 'gemini' ? ' Är modellen upptagen provar appen andra gratismodeller automatiskt.' : ''}</span></div>
      <div class="field"><label for="gistId">Gist-id för delad kockbok</label><input id="gistId" value="${esc(s.gistId)}" placeholder="Hittas eller skapas automatiskt"></div>
      <div class="row" style="margin-bottom:18px"><button class="ghost" data-savekeys>Spara</button>${s.gistId ? `<button class="ghost" data-syncnow>Synka nu</button>` : ''}</div>
      <div class="field"><label for="instructions">Kockens grundinstruktioner</label>
        <textarea id="instructions" class="tall">${esc(S.data.instructions)}</textarea>
        <span class="hint">Hur kocken arbetar. Familj, utrustning och mål ovan läggs till automatiskt, liksom appens svarsformat.</span></div>
      <div class="row" style="margin-bottom:18px"><button class="ghost" data-saveinstr>Spara instruktioner</button><button class="ghost" data-resetinstr>Återställ standard</button></div>
      <div class="field"><label>Tema</label><div class="seg" role="group">${[['auto', 'Som enheten'], ['light', 'Ljust'], ['dark', 'Mörkt']].map(([k, l]) => `<button type="button" data-theme="${k}" aria-pressed="${s.theme === k}">${l}</button>`).join('')}</div></div>
      <div class="row"><button class="ghost" data-export>Ladda ner säkerhetskopia</button>
        <label class="ghost">Läs in säkerhetskopia<input type="file" accept="application/json" id="importFile" hidden></label></div>
    </details>
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
      send(v || (img ? 'Det här har vi hemma. Ge förslag.' : ''), img, { flow: true });
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
  st.querySelectorAll('[data-ptext]').forEach(el => {
    el.oninput = debounce(() => { const k = el.dataset.ptext; if (k === 'profile') S.data.profile = el.value; else S.data.prefs[k] = el.value; prefsChanged(true); }, 500);
  });
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
  if (q) { send(q.dataset.quick, null, { flow: true }); return; }
  const pick = t.closest('[data-pick]');
  if (pick) { const s = S.current.suggestions[+pick.dataset.pick]; send(`Ge mig det kompletta receptet på ${s.name}.`, null, { flow: true }); return; }
  if (t.closest('[data-more]')) { send('Ge mig fler förslag, gärna åt ett annat håll.', null, { flow: true }); return; }

  // Recept
  const chk = t.closest('[data-check]');
  if (chk) { S.checked[chk.dataset.check] = chk.checked; const row = chk.closest('.ing'); row.classList.toggle('checked', chk.checked); updateCount(); return; }
  const jump = t.closest('[data-jump]');
  if (jump) { scrollToSec(jump.dataset.jump); return; }
  if (t.closest('[data-startcook]')) { if (S.activeStep == null) S.activeStep = 0; refreshSteps(); scrollToSec('r-steps'); return; }
  const tm = t.closest('[data-timer]');
  if (tm) { const s = S.current.recipe.steps[+tm.dataset.timer]; startTimer(`Steg ${+tm.dataset.timer + 1}`, s.minutes); return; }
  const dn = t.closest('[data-done]');
  if (dn) { const n = +dn.dataset.done; S.doneSteps[n] = !S.doneSteps[n]; if (S.doneSteps[n] && S.activeStep === n) S.activeStep = n + 1 < S.current.recipe.steps.length ? n + 1 : null; refreshSteps(); return; }
  const step = t.closest('[data-step]');
  if (step && !t.closest('button')) { const n = +step.dataset.step; S.activeStep = S.activeStep === n ? null : n; refreshSteps(); return; }
  if (t.closest('[data-save]')) { saveRecipe(); return; }
  if (t.closest('[data-cooked]')) { const r = savedRecipe(); r.cooked = [...(r.cooked || []), now()]; touch(r); saveData(); toast('Antecknat! Sätt gärna betyg och skriv vad som blev bra.'); renderStage(); const n = $('#notes'); if (n) n.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
  const rate = t.closest('[data-rate]');
  if (rate) { const r = savedRecipe(); r.rating = r.rating === +rate.dataset.rate ? 0 : +rate.dataset.rate; touch(r); saveData(); const sc = $('#stage').scrollTop; renderStage(); $('#stage').scrollTop = sc; return; }
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

  // Preferenser (sparas direkt)
  const pt = t.closest('[data-ptoggle]');
  if (pt) { const k = pt.dataset.ptoggle, v = pt.dataset.val, P = S.data.prefs; P[k] = P[k].includes(v) ? P[k].filter(x => x !== v) : [...P[k], v]; pt.setAttribute('aria-pressed', P[k].includes(v)); prefsChanged(); return; }
  const ps = t.closest('[data-pset]');
  if (ps) { S.data.prefs[ps.dataset.pset] = ps.dataset.val; ps.parentElement.querySelectorAll('[data-pset]').forEach(b => b.setAttribute('aria-pressed', b === ps)); prefsChanged(); return; }
  const pb = t.closest('[data-pbool]');
  if (pb) { const k = pb.dataset.pbool; S.data.prefs[k] = !S.data.prefs[k]; pb.setAttribute('aria-pressed', S.data.prefs[k]); prefsChanged(); return; }
  const pp = t.closest('[data-portions]');
  if (pp) { const P = S.data.prefs; P.portions = Math.max(1, Math.min(20, P.portions + +pp.dataset.portions)); pp.parentElement.querySelector('output').textContent = P.portions; prefsChanged(); return; }
  const pr = t.closest('[data-premove]');
  if (pr) { const P = S.data.prefs; P.customEquipment = P.customEquipment.filter(x => x !== pr.dataset.premove); prefsChanged(); renderStage(); return; }
  if (t.closest('[data-equipadd]')) { const v = $('#equipNew').value.trim(); if (v) { S.data.prefs.customEquipment.push(v); prefsChanged(); renderStage(); } return; }
  if (t.closest('[data-status]')) { toggleStatusPop(true); return; }

  // Inställningar
  const prov = t.closest('[data-prov]');
  if (prov) { readKeyFields(); S.settings.provider = prov.dataset.prov; saveSettings(); renderStage(); return; }
  if (t.closest('[data-savekeys]')) { readKeyFields(); saveSettings(); toast('Sparat'); return; }
  if (t.closest('[data-connect]')) { readKeyFields(); readSyncFields(); saveSettings(); connectAll(); return; }
  if (t.closest('[data-testai]')) { readKeyFields(); saveSettings(); openChat(true); send('Snabbtest: svara med en mening om vad du kan hjälpa oss med ikväll.'); return; }
  if (t.closest('[data-savesync]')) { readSyncFields(); saveSettings(); toast('Sparat'); if (S.settings.gistId) syncNow(); return; }
  if (t.closest('[data-gistcreate]')) { readSyncFields(); saveSettings(); createGist(); return; }
  if (t.closest('[data-syncnow]')) { readSyncFields(); saveSettings(); syncNow(true); return; }
  if (t.closest('[data-sharelink]')) { readKeyFields(); readSyncFields(); saveSettings(); copyShareLink(); return; }
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
  const r = S.current.recipe; if (!r) return;
  const [a, b] = document.querySelectorAll('.r-jump span');
  if (a) a.textContent = `${r.ingredients.filter(i => S.checked[i.id]).length}/${r.ingredients.length}`;
  if (b) b.textContent = `${r.steps.filter((_, n) => S.doneSteps[n]).length}/${r.steps.length}`;
}
function scrollToSec(id) {
  const el = document.getElementById(id), st = $('#stage'), nav = $('.r-jump');
  if (!el) return;
  const top = el.getBoundingClientRect().top - st.getBoundingClientRect().top + st.scrollTop - (nav ? nav.offsetHeight + 8 : 0);
  st.scrollTo({ top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}
$('#stage').addEventListener('scroll', () => {
  const nav = $('.r-jump'); if (!nav) return;
  const steps = document.getElementById('r-steps');
  const inSteps = steps && steps.getBoundingClientRect().top - $('#stage').getBoundingClientRect().top < nav.offsetHeight + 80;
  nav.querySelectorAll('[data-jump]').forEach(b => b.classList.toggle('on', (b.dataset.jump === 'r-steps') === !!inSteps));
}, { passive: true });
function refreshSteps() {
  document.querySelectorAll('.step').forEach(li => {
    const n = +li.dataset.step;
    li.classList.toggle('active', S.activeStep === n); li.classList.toggle('done', !!S.doneSteps[n]);
    const b = li.querySelector('[data-done]'); if (b) b.textContent = S.doneSteps[n] ? 'Ångra' : 'Klar';
  });
  updateCount();
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

function prefsChanged(quiet) {
  S.data.textUpdatedAt = now(); saveData(); renderStatus();
  if (!quiet) { clearTimeout(prefsChanged._t); prefsChanged._t = setTimeout(() => toast('Sparat'), 400); }
}

/* ============ Statusrad / snabbval ============ */
function statusLabel() {
  const d = dayInfo(), P = S.data.prefs;
  const time = (OPT.time.find(x => x[0] === P.time) || [])[1];
  const tone = (OPT.tones.find(x => x[0] === P.tone) || [])[1];
  return { short: `${d.weekend ? 'Helg' : 'Vardag'} · ${P.portions}`, long: `${d.weekend ? 'Helg' : 'Vardag'}${d.manual ? '' : ' (auto)'} · ${P.portions} port · ${time} · ${tone}` };
}
function renderStatus() {
  const b = $('#statusBtn'); if (!b) return;
  const l = statusLabel();
  b.innerHTML = `<span class="long">${esc(l.long)}</span><span class="short">${esc(l.short)}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>`;
  const pop = $('#statusPop');
  if (!pop.hidden) pop.innerHTML = statusPopHtml();
}
function statusPopHtml() {
  const P = S.data.prefs, m = dayMode();
  return `<div class="field"><label>Dag</label><div class="seg" role="group">${[['auto', 'Auto'], ['vardag', 'Vardag'], ['helg', 'Helg']].map(([k, l]) => `<button type="button" data-day="${k}" aria-pressed="${m === k}">${l}</button>`).join('')}</div><span class="hint">Gäller resten av dagen.</span></div>
    <div class="field"><label>Tid</label><div class="seg" role="group">${OPT.time.map(([k, l]) => `<button type="button" data-pset="time" data-val="${k}" aria-pressed="${P.time === k}">${l}</button>`).join('')}</div></div>
    <div class="field"><label>Portioner</label><div class="stepper"><button type="button" data-portions="-1" aria-label="Färre portioner">−</button><output>${P.portions}</output><button type="button" data-portions="1" aria-label="Fler portioner">+</button></div></div>
    <button class="ghost small" data-go="settings">Alla inställningar</button>`;
}
function toggleStatusPop(open) {
  const pop = $('#statusPop'), b = $('#statusBtn');
  open = open ?? pop.hidden;
  pop.hidden = !open; b.setAttribute('aria-expanded', String(open));
  if (open) pop.innerHTML = statusPopHtml();
}
$('#statusBtn').addEventListener('click', e => { e.stopPropagation(); toggleStatusPop(); });
$('#statusPop').addEventListener('click', e => {
  e.stopPropagation();
  const t = e.target;
  const dd = t.closest('[data-day]');
  if (dd) { S.settings.dayMode = { mode: dd.dataset.day, date: new Date().toDateString() }; saveSettings(); renderStatus(); if (S.route.view === 'home') renderStage(); return; }
  const ps = t.closest('[data-pset]');
  if (ps) { S.data.prefs[ps.dataset.pset] = ps.dataset.val; prefsChanged(true); if (S.route.view === 'settings') renderStage(); return; }
  const pp = t.closest('[data-portions]');
  if (pp) { const P = S.data.prefs; P.portions = Math.max(1, Math.min(20, P.portions + +pp.dataset.portions)); prefsChanged(true); if (S.route.view === 'settings') renderStage(); return; }
  if (t.closest('[data-go]')) toggleStatusPop(false);
});
document.addEventListener('click', e => { if (!e.target.closest('#statusPop') && !$('#statusPop').hidden) toggleStatusPop(false); });

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
async function testAI() {
  const p = S.settings.provider;
  if (!S.settings[p === 'claude' ? 'claudeKey' : 'geminiKey']) return 'Ingen nyckel ännu';
  const sysBackup = S.chat; S.chat = [{ role: 'user', text: 'Test: svara bara med reply "OK".' }];
  try { await callModel(); return '✓ Kocken svarar'; }
  catch (e) { return '✗ ' + (e.message === 'NOKEY' ? 'Ingen nyckel' : e.message); }
  finally { S.chat = sysBackup; }
}
async function findOrCreateGist() {
  try {
    const res = await gh('/gists?per_page=100');
    if (res.ok) {
      const list = await res.json();
      const g = list.find(x => x.files && x.files[DATA_FILE]);
      if (g) { S.settings.gistId = g.id; saveSettings(); await syncNow(); return; }
    } else if (res.status === 401) { setSync('Fel token'); return; }
  } catch { /* skapa ny nedan */ }
  await createGist();
}
async function connectAll() {
  S.aiStatus = 'Testar…'; renderStage();
  const jobs = [testAI().then(r => { S.aiStatus = r; })];
  if (S.settings.ghToken) jobs.push(S.settings.gistId ? syncNow() : findOrCreateGist());
  else setSync('');
  await Promise.all(jobs);
  if (S.route.view === 'settings') renderStage();
  toast(S.aiStatus.startsWith('✓') ? 'Allt är kopplat' : 'Kolla kopplingen');
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
    if (before !== merged) { renderStatus(); if (['book', 'home', 'settings'].includes(S.route.view)) renderStage(); }
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
  if ((R.textUpdatedAt || '') > (L.textUpdatedAt || '')) { L.instructions = R.instructions; L.profile = R.profile; if (R.prefs) L.prefs = Object.assign(JSON.parse(JSON.stringify(DEFAULT_PREFS)), R.prefs); L.textUpdatedAt = R.textUpdatedAt; }
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
renderStatus();
go(S.current.recipe && LS.get('fk.lastView', '') === 'recipe' ? 'recipe' : 'home');
renderChat(true);
syncNow();
