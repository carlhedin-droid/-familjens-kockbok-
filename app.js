/* Souschefen — en statisk webbapp (GitHub Pages).
   AI: Gemini eller Claude via egen API-nyckel. Data: localStorage + valfri synk via privat GitHub Gist. */
'use strict';

/* ============ Språk ============ */
// Svenska är standard. Sparade värden (länder, utrustning m.m.) förblir svenska och översätts bara när de visas.
const L = (sv, en) => (typeof S !== 'undefined' && S.settings.lang === 'en') ? en : sv;
const LOCALE = () => L('sv-SE', 'en-GB');
const EN_VALUES = {
  'Grill och rök': 'Grilling and smoking', 'Precision': 'Precision', 'Maskiner': 'Machines', 'Kokning och stekning': 'Boiling and frying',
  'Kolgrill': 'Charcoal grill', 'Gasolgrill': 'Gas grill', 'Kamado': 'Kamado', 'Rökgrill / rökskåp': 'Smoker', 'Pizzaugn': 'Pizza oven', 'Grillpanna': 'Grill pan',
  'Sous vide': 'Sous vide', 'Vakuummaskin': 'Vacuum sealer', 'Digital stektermometer': 'Digital meat thermometer',
  'Matberedare': 'Food processor', 'Köksassistent': 'Stand mixer', 'Kraftfull mixer': 'High-power blender', 'Köttkvarn': 'Meat grinder', 'Pastamaskin': 'Pasta machine', 'Mandolin': 'Mandoline',
  'Airfryer': 'Air fryer', 'Fritös': 'Deep fryer', 'Slow cooker': 'Slow cooker', 'Tryckkokare': 'Pressure cooker', 'Riskokare': 'Rice cooker', 'Ångugn': 'Steam oven', 'Wokpanna': 'Wok', 'Gjutjärnsgryta': 'Cast-iron pot', 'Bakstål / pizzasten': 'Baking steel / pizza stone',
  'Europa': 'Europe', 'Mellanöstern och Afrika': 'Middle East and Africa', 'Asien': 'Asia', 'Amerika': 'Americas',
  'Sverige': 'Sweden', 'Frankrike': 'France', 'Italien': 'Italy', 'Spanien': 'Spain', 'Grekland': 'Greece', 'Storbritannien': 'United Kingdom', 'Libanon': 'Lebanon', 'Turkiet': 'Turkey', 'Marocko': 'Morocco', 'Indien': 'India', 'Indonesien': 'Indonesia', 'Kina': 'China', 'Mexiko': 'Mexico', 'Brasilien': 'Brazil',
  'Hela eftermiddagen': 'All afternoon',
  'Färsk jäst': 'Fresh yeast', 'Torrjäst': 'Dry yeast', 'Surdeg': 'Sourdough', 'Förjäsning (poolish/biga)': 'Pre-ferment (poolish/biga)',
  'Vetemjöl': 'Wheat flour', 'Rågmjöl': 'Rye flour', 'Dinkel': 'Spelt', 'Fullkorn': 'Whole grain', 'Durum': 'Durum', 'Ölandsvete': 'Öland wheat',
  'Bakstål': 'Baking steel', 'Ånga i ugnen': 'Steam in the oven', 'Plåt': 'Baking tray', 'Form': 'Loaf tin',
  'Efter receptet': 'Follow the recipe', 'Samma dag': 'Same day', 'Över natten i kyl': 'Overnight in the fridge', '1–3 dygn i kyl': '1–3 days in the fridge',
  'För hand': 'By hand', 'Degblandare': 'Dough mixer', 'Utan knådning, vik degen': 'No-knead, fold the dough',
  'Fast, ca 60–65 %': 'Firm, about 60–65%', 'Mellan, ca 65–75 %': 'Medium, about 65–75%', 'Hög, över 75 %': 'High, over 75%',
  'Välkommen': 'Welcome', 'Nyckel': 'Key', 'Hushållet': 'Household', 'Vardag och helg': 'Weekdays and weekends', 'Smak': 'Taste', 'Hälsa': 'Health', 'Utrustning': 'Equipment', 'Klart': 'Done',
  'Synkad': 'Synced', 'Synkar…': 'Syncing…', 'Sparar…': 'Saving…', 'Skapar…': 'Creating…', 'Synk misslyckades': 'Sync failed', 'Fel token': 'Wrong token',
};
const tv = v => L(v, EN_VALUES[v] ?? v);
function langPicker() {
  const cur = S.settings.lang === 'en' ? 'en' : 'sv';
  return `<div class="seg" role="group" aria-label="Språk / Language">${[['sv', 'Svenska'], ['en', 'English']].map(([k, l]) => `<button type="button" data-lang="${k}" aria-pressed="${cur === k}">${l}</button>`).join('')}</div>`;
}
function applyStaticLang() {
  document.documentElement.lang = L('sv', 'en');
  const set = (q, text, attr) => { const el = document.querySelector(q); if (!el) return; if (attr) el.setAttribute(attr, text); else el.textContent = text; };
  const ask = L('Fråga souschefen', 'Ask the sous-chef');
  set('.brand', L('Till startsidan', 'To the home page'), 'aria-label');
  set('.nav', L('Huvudmeny', 'Main menu'), 'aria-label');
  set('.nav-btn[data-go="home"]', L('Laga mat', 'Cook'));
  set('.nav-btn[data-go="book"]', L('Kokboken', 'Cookbook'));
  set('.nav-btn[data-go="settings"]', L('Inställningar', 'Settings'), 'aria-label');
  set('.nav-label', L('Inställningar', 'Settings'));
  set('#statusBtn', L('Dag, tid och portioner', 'Day, time and servings'), 'title');
  set('#statusPop', L('Snabbval', 'Quick settings'), 'aria-label');
  set('#chat', ask, 'aria-label'); set('.chat-head h2', ask);
  set('#chatNew', L('Ny tråd', 'New thread')); set('#chatNew', L('Börja om konversationen', 'Start the conversation over'), 'title');
  set('#chatClose', L('Stäng chatten', 'Close the chat'), 'aria-label');
  set('label.icon-btn', L('Lägg till foto', 'Add a photo'), 'title');
  set('#chatInput', ask + '…', 'placeholder'); set('#chatInput', L('Meddelande till kocken', 'Message to the chef'), 'aria-label');
  set('#composer .send', L('Skicka', 'Send'), 'aria-label');
  set('#chatTab span', ask);
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.content = L('Souschefen – familjens kockcoach och kokbok', 'Souschefen – your family\'s cooking coach and cookbook');
}
function setLang(lang) {
  S.settings.lang = lang === 'en' ? 'en' : 'sv'; saveSettings();
  applyStaticLang(); renderStatus(); renderStage(); renderChat(); renderAttach(); tickTimers();
  const el = $('#sync'); if (el) el.textContent = tv(S.sync.state || '');
}
const ENGLISH_RULE = `- LANGUAGE: The app is set to English. Write everything the user sees in natural English: "reply", all recipe and suggestion text (title, origin, intro, ingredient names and groups, steps, health, tips, why, keyIngredients, equipment) and "learn". This overrides the Swedish examples above, and the instructions being in Swedish does not change it. Use g, kg, ml, l, tbsp and tsp, and "Easy", "Medium" or "Advanced" for "difficulty". Keep "tag" exactly VARDAG or HELG (VARDAG means weekday, HELG means weekend). Family notes may be in Swedish; understand them and answer in English. If a recipe on screen or at a link is in Swedish or another language, translate it when you send it. If information is missing: ask in "reply" and set suggestions/recipe to null.`;
const langRule = () => FORMAT_RULES.replace('- Svara på svenska. Om info saknas: ställ motfrågan i "reply" och sätt suggestions/recipe till null.', L('- Svara på svenska. Om info saknas: ställ motfrågan i "reply" och sätt suggestions/recipe till null.', ENGLISH_RULE));

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

const INSTRUCTIONS_V2 = `ROLL
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

const INSTRUCTIONS_V3 = `ROLL & TONALITET
Du är vår personliga kockcoach och receptgranskare.
Stil: Rakt på sak. Ingen "fluffig" inledning. Korta meningar.
Kompetens: Anpassa nivån efter OM FAMILJEN. Är vi vana i köket – förklara inte grunder, fokusera på teknik och smakoptimering.
Portioner, allergier, tidsram, utrustning, favoritländer och hälsomål styrs av INSTÄLLNINGAR nedan – följ dem. Allergier och "äter inte" får aldrig brytas.

DAG & TID
Anta att maten lagas idag om inget annat sägs. Tidsramen i INSTÄLLNINGAR är total tid inklusive förberedelser – håll dig inom den.
- VARDAG: effektivitet, genvägar, "allt-i-ett", mindre disk.
- HELG: "proffsvägen" för maxad smak och matlagning som hobby; nyttja specialutrustningen om INSTÄLLNINGAR säger det.
Utgå från säsongens råvaror (se IDAG) när det passar.

DINA TRE ARBETSLÄGEN
1. Snabba köksfrågor (direkt fråga under matlagning): punktform eller max 3–5 meningar. Fokus på varför och hur – temperaturer, räddning av skurna såser, smakkombinationer.
2. Receptbearbetning (delat recept/länk eller vald rätt): metriska mått (gram/liter), skala till antalet portioner i INSTÄLLNINGAR. Mängden ska stå i varje steg så vi slipper scrolla. Korta, numrerade, imperativa steg ("Rosta kryddorna", "Sila såsen"). Missa inga kritiska moment. Hälsoanalys utifrån hälsomålet; tillåt fett/kalorier som ger hög smakutdelning ("Flavor ROI") – smak går före total asketism, maten får aldrig bli tråkig.
3. Inspiration (vi listar råvaror och vill ha förslag): 5–8 förslag, var och en med en kort förklaring till varför den passar just oss. Vardag: mest snabba/enkla. Helg: mer ambitiösa. Sprid över våra favoritkök, minst ett vegetariskt och minst ett tydligt hälsosammare förslag. Avsluta med att fråga vilken rätt vi vill ha komplett recept på.

Om viktig information saknas, ställ en motfråga direkt.`;
const DEFAULT_INSTRUCTIONS = `ROLL & TON
Du är vår personliga kockcoach och receptgranskare i appen Souschefen.
- Rakt på sak, korta meningar, ingen inledning eller utfyllnad.
- Nivå: utgå från OM FAMILJEN. Är vi vana i köket – förklara inte grunder; fokusera på teknik, timing och smakoptimering.
- INSTÄLLNINGAR styr portioner, tidsram, utrustning, favoritländer och hälsomål. ALLERGIER OCH ÄTER INTE bryts aldrig – inte heller i tips eller varianter.

DAG, TID & SÄSONG
- KLOCKAN: se IDAG för exakt tid och hur lång tid det är kvar till middagen. Räkna bakåt från middagstiden och säg när vi senast måste börja ("Börja senast 17:20") i reply eller intro. Är det kortare tid kvar än tidsramen – välj snabbare rätter och genvägar och säg det. Har middagstiden passerat eller är det sent – föreslå något snabbt eller fråga om det gäller en annan dag. Under matlagning: använd klockan och pågående timers när du svarar ("om ca 5 min", "vid 17:45").
- Maten lagas idag om inget annat sägs. Tidsramen är total tid från start till bord, inklusive förberedelser. "time" ska vara realistisk och rymmas i ramen; marinering eller vila i förväg nämns tydligt.
- VARDAG: genvägar, allt-i-ett, få kärl, parallella moment.
- HELG: proffsvägen för maxad smak; använd specialutrustningen när INSTÄLLNINGAR tillåter och den faktiskt gör rätten bättre.
- Välj säsongens råvaror och sådant som finns i vanliga svenska butiker (ICA, Coop). Ovanlig råvara: säg var den finns (t.ex. asiatisk butik) och ge ett alternativ.

LÄGE 1 – SNABBA FRÅGOR (under matlagning)
- Börja med vad jag ska göra nu, sedan kort varför. Max 3–5 meningar eller punkter.
- Utgå från receptet på skärmen och vilket steg vi troligen är på.
- Frågar jag "kan jag…" eller "går det att…" – svara bara, och sätt "offerUpdate": true om svaret innebär en ändring av receptet (appen visar då en knapp så vi kan välja att uppdatera). Säger jag "byt", "ändra", "gör om", "lägg till" eller "ja, uppdatera" – skicka HELA det ändrade receptet i "recipe" och säg i en mening vad som ändrats.
- Skriv ALDRIG att receptet är uppdaterat, ändrat eller justerat om du inte samtidigt skickar hela receptet i "recipe".

LÄGE 2 – RECEPT (vald rätt, länk eller inklistrat recept, eller ändring)
- Metriska mått skalade till portionerna, i köpvänliga mängder (1 burk 400 ml, 1 förp).
- Ingredienser i den ordning de används, grupperade vid behov.
- Första steget är förberedelser (mise en place, sätt på ugn eller grill) när det behövs. Sedan korta, numrerade, imperativa steg med parallella moment ("Medan riset kokar: …").
- Varje steg: mängder utskrivna, värme (svag/medel/hög eller °C), tid och klar-tecken (färg, konsistens, innertemperatur för kött, fågel och fisk).
- Flavor ROI: fett och kalorier som ger stor smakutdelning är ok. Smak går före asketism – maten får aldrig bli tråkig.
- Hälsa: följ hälsomålet. Uppskatta protein (g) och energi (kcal) per portion och ge konkreta byten för den som vill äta lättare.
- RENSKRIVNING (länk eller inklistrat recept): återge originalet troget – samma råvaror, mängder, tekniker och ordning. Ändra bara det som gör receptet lättare att följa: metriska mått, skalning till våra portioner, mängder utskrivna i stegen, tydligare och kortare steg, värme och klar-tecken där originalet är otydligt. Egna förbättringar och anpassningar efter våra inställningar läggs i "tips" eller "health" – inte i själva receptet. Undantag: krockar något med ALLERGIER OCH ÄTER INTE, byt ut det och säg det i reply. Sätt "source" till länken. Säg i reply kort varifrån receptet kommer och vad du justerat.
- Kunde du inte läsa länken (sidan saknas, kräver inloggning eller innehåller inget recept): hitta INTE på ett recept. Säg det i reply, sätt recipe till null och be oss klistra in receptets text.
- Ändring: skicka hela receptet, behåll ingrediens-id och portioner om inget annat sägs.

LÄGE 3 – INSPIRATION (råvaror, foto eller önskemål)
- 5–8 förslag, vart och ett med kort "varför den passar oss" – koppla gärna till kokboken, betygen och smakminnet.
- Vardag: flest snabba. Helg: fler ambitiösa. Alla ryms i dagens tidsram om inget annat sägs.
- Sprid över favoritländerna; minst ett vegetariskt och minst ett tydligt nyttigare förslag.
- Undvik rätter vi lagat den senaste veckan om vi inte ber om dem; variationer på högt betygsatta rätter är välkomna.
- Foto: utgå från det du ser, nämn kort vad du identifierat och fråga om något är osäkert.

OSÄKERHET
- Saknas viktig information (vad som finns hemma, vem som äter) – ställ en kort motfråga i stället för att gissa.`;

const DEFAULT_PROFILE_V2 = `Två vuxna och två tonåringar (13–15 år). Vi bor på Ekerö och handlar i vanliga svenska matbutiker.
Allergier: inga kända.`;

const PROFILE_V3 = `Två vuxna och två tonåringar (13–15 år). Vi bor på Ekerö och handlar i vanliga svenska matbutiker.`;
const FOODIE_LINE = 'Vi är foodies med hög kunskapsnivå, särskilt inom asiatisk matlagning efter 5 år i Malaysia/Singapore.';
const CARL_PROFILE = `Två vuxna och två tonåringar (13–15 år). ${FOODIE_LINE}\nVi bor på Ekerö och handlar i vanliga svenska matbutiker.`;

const OPT = {
  eaters: ['Tonåringar', 'Småbarn', 'Tränande / idrottare', 'Kräsna ätare', 'Storätare', 'Gäster / vänner', 'Bara vuxna'],
  equipment: [
    ['Grill och rök', ['Kolgrill', 'Gasolgrill', 'Kamado', 'Rökgrill / rökskåp', 'Pizzaugn', 'Grillpanna']],
    ['Precision', ['Sous vide', 'Vakuummaskin', 'Digital stektermometer']],
    ['Maskiner', ['Matberedare', 'Köksassistent', 'Kraftfull mixer', 'Köttkvarn', 'Pastamaskin', 'Mandolin']],
    ['Kokning och stekning', ['Airfryer', 'Fritös', 'Slow cooker', 'Tryckkokare', 'Riskokare', 'Ångugn', 'Wokpanna', 'Gjutjärnsgryta', 'Bakstål / pizzasten']],
  ],
  cuisines: [
    ['Europa', [['SE', 'Sverige'], ['FR', 'Frankrike'], ['IT', 'Italien'], ['ES', 'Spanien'], ['GR', 'Grekland'], ['GB', 'Storbritannien']]],
    ['Mellanöstern och Afrika', [['LB', 'Libanon'], ['TR', 'Turkiet'], ['MA', 'Marocko']]],
    ['Asien', [['IN', 'Indien'], ['TH', 'Thailand'], ['MY', 'Malaysia'], ['SG', 'Singapore'], ['ID', 'Indonesien'], ['VN', 'Vietnam'], ['CN', 'Kina'], ['KR', 'Korea'], ['JP', 'Japan']]],
    ['Amerika', [['US', 'USA'], ['MX', 'Mexiko'], ['PE', 'Peru'], ['AR', 'Argentina'], ['BR', 'Brasilien']]],
  ],
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
const TIMES = [['20', '20 min'], ['30', '30 min'], ['45', '45 min'], ['60', '1 h'], ['120', '2 h'], ['lang', 'Hela eftermiddagen']];
const timeLabel = k => tv((TIMES.find(x => x[0] === k) || [, k])[1]);
const DEFAULT_HEALTH = 'Volym + spets: mättande grönt som bas och en smakspets ovanpå. Högt protein. Periodisk fasta och styrketräning, mål viktminskning.';
const STANDARD_KITCHEN = 'spis, ugn, mikro, stekpannor, kastruller (även stor gryta), ugnsformar, plåtar, stavmixer, elvisp, våg och vanliga knivar';
const CUISINE_MAP = { Svenska: ['Sverige'], Nordiska: ['Sverige'], Franska: ['Frankrike'], Italienska: ['Italien'], Spanska: ['Spanien'], Grekiska: ['Grekland'], Libanesiska: ['Libanon'], Turkiska: ['Turkiet'], Indiska: ['Indien'], Thailändska: ['Thailand'], Malaysiska: ['Malaysia'], Singaporianska: ['Singapore'], Vietnamesiska: ['Vietnam'], Kinesiska: ['Kina'], Koreanska: ['Korea'], Japanska: ['Japan'], Amerikanska: ['USA'], Mexikanska: ['Mexiko'], Sydamerikanska: ['Peru', 'Argentina'] };
const EQUIP_MAP = { 'Airfryer / fritös': 'Fritös', 'Bakstål': 'Bakstål / pizzasten', 'Rökskåp': 'Rökgrill / rökskåp', 'Mixer': 'Kraftfull mixer', 'Ångkokare': 'Ångugn', 'Stor soppkastrull': null };
const BREAD_OPT = {
  leaven: ['Färsk jäst', 'Torrjäst', 'Surdeg', 'Förjäsning (poolish/biga)'],
  flour: ['Vetemjöl', 'Rågmjöl', 'Dinkel', 'Fullkorn', 'Durum', 'Ölandsvete'],
  bake: ['Gjutjärnsgryta', 'Bakstål', 'Ånga i ugnen', 'Plåt', 'Form'],
  proof: [['', 'Efter receptet'], ['samma', 'Samma dag'], ['natt', 'Över natten i kyl'], ['lang', '1–3 dygn i kyl']],
  knead: [['', 'Efter receptet'], ['hand', 'För hand'], ['maskin', 'Degblandare'], ['vik', 'Utan knådning, vik degen']],
  hydration: [['', 'Efter receptet'], ['fast', 'Fast, ca 60–65 %'], ['mellan', 'Mellan, ca 65–75 %'], ['hog', 'Hög, över 75 %']],
};
const BREAD_DEFAULTS = { breadLeaven: [], breadStarter: false, breadProof: '', breadKnead: '', breadHydration: '', breadFlour: [], breadBake: [], breadNote: '' };
const CARL_PREFS = {
  portions: 4, bigEaters: true, foodieAdded: true,
  allergies: 'Inga kända',
  weekdayTime: '30', weekendTime: '120', weekendGear: true, dinnerWeekday: '18:00', dinnerWeekend: '18:30',
  healthWho: 'Pappa', healthNote: DEFAULT_HEALTH, healthyAlt: true,
  cuisines: ['Sverige', 'Frankrike', 'Italien', 'USA', 'Mexiko', 'Peru', 'Malaysia', 'Singapore', 'Japan'],
  equipment: ['Matberedare', 'Fritös', 'Slow cooker', 'Bakstål / pizzasten', 'Sous vide', 'Köttkvarn', 'Vakuummaskin', 'Grillpanna', 'Kolgrill', 'Wokpanna'],
  migratedV4: true,
  customEquipment: [],
  ...BREAD_DEFAULTS,
};
// Neutrala förval för nya familjer (fylls i via introduktionen)
const DEFAULT_PROFILE = '';
const DEFAULT_PREFS = {
  portions: 4, bigEaters: false, foodieAdded: true, frozen: true,
  allergies: '',
  weekdayTime: '30', weekendTime: '60', weekendGear: true, dinnerWeekday: '18:00', dinnerWeekend: '18:30',
  healthWho: '', healthNote: '', healthyAlt: false,
  cuisines: ['Sverige', 'Italien'],
  equipment: [],
  migratedV4: true,
  customEquipment: [],
  ...BREAD_DEFAULTS,
};
const HAD_DATA = (() => { try { return !!localStorage.getItem('fk.data') || !!(JSON.parse(localStorage.getItem('fk.settings') || '{}').geminiKey); } catch { return false; } })();

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
      title: S_STR, origin: S_STR, countries: S_ARR, source: S_STRN, tag: { type: 'STRING', enum: ['VARDAG', 'HELG'] }, time: S_STR, servings: { type: 'INTEGER' }, intro: S_STR,
      ingredients: { type: 'ARRAY', items: { type: 'OBJECT', properties: { id: S_STR, amount: S_STR, name: S_STR, note: S_STRN, group: S_STRN }, required: ['id', 'amount', 'name'] } },
      steps: { type: 'ARRAY', items: { type: 'OBJECT', properties: { text: S_STR, uses: S_ARR, minutes: { type: 'INTEGER', nullable: true } }, required: ['text'] } },
      health: { type: 'OBJECT', nullable: true, properties: { summary: S_STR, tips: S_ARR } },
      tips: S_ARR },
      required: ['title', 'ingredients', 'steps'] },
    learn: S_ARR,
    offerUpdate: { type: 'BOOLEAN' },
  },
  required: ['reply'],
  propertyOrdering: ['reply', 'suggestions', 'recipe', 'learn'],
};

const FORMAT_RULES = `## APPENS SVARSFORMAT (måste följas)
Du svarar inuti en app. Svara ALLTID med exakt ett JSON-objekt – ingen text före eller efter, inga kodstaket.
{
  "reply": "Text som visas i chatten. LÄGE 1: hela svaret. Nytt recept eller förslag: högst 1–2 meningar, upprepa INTE innehållet. Ändrat recept: en mening om vad som ändrats. Enkel markdown (**fet**, punktlistor med '- ') är ok.",
  "suggestions": null | [ { "name": "", "origin": "kök/land", "countries": ["MY"], "tag": "VARDAG" | "HELG", "time": "t.ex. 35 min", "difficulty": "Lätt" | "Medel" | "Avancerad", "why": "1–2 meningar om varför den passar oss", "keyIngredients": [""], "equipment": "" | null, "healthier": true|false, "vegetarian": true|false } ],
  "recipe": null | {
    "title": "", "origin": "", "countries": ["MY"], "source": "länk till originalet" | null, "tag": "VARDAG" | "HELG", "time": "", "servings": 4, "intro": "1–2 meningar",
    "ingredients": [ { "id": "i1", "amount": "300 g", "name": "kycklinglårfilé", "note": "i bitar" | null, "group": "Marinad" | null } ],
    "steps": [ { "text": "Bryn 300 g kycklinglårfilé ...", "uses": ["i1"], "minutes": 8 | null } ],
    "health": { "summary": "≈45 g protein och 650 kcal per portion. …", "tips": ["konkret byte för den som vill äta lättare"] },
    "tips": [""]
  },
  "learn": [ "kort ny lärdom om familjens smak/vanor" ],
  "offerUpdate": false
}
Regler:
- LÄGE 3 (inspiration) → fyll "suggestions". LÄGE 2 (komplett recept, eller när jag ber dig ändra receptet som visas) → fyll "recipe" med HELA receptet. LÄGE 1 → båda null.
- I varje steg: skriv ut mängderna i texten och lista ingrediensernas id i "uses". "minutes" anges för steg med vänte-/tillagningstid.
- "countries": ISO 3166-1 alfa-2-koder (versaler) för rättens ursprungsland, t.ex. ["MY"], ["FR","SE"] för fusion. Regionalt kök → huvudlandet (Sydamerikanskt ceviche → ["PE"]).
- "group" används för att dela upp ingredienser (t.ex. "Marinad", "Sås", "Servering"); annars null.
- "learn": bara NYA saker vi själva sagt eller tydligt visat (t.ex. "Barnen tycker inte om koriander", "Vi gillade mer chili i panangen"). Inga gissningar. Annars [].
- Använd smakminnet och kokboken nedan för att träffa vår smak. Föreslå gärna variationer på rätter vi gett högt betyg.
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
           memory: [], recipes: [], deleted: {}, session: null, history: [] };
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
function migrateData() {
  if (HAD_DATA && !(S.data.prefs && S.data.prefs.frozen)) {
    // Befintlig användare: behåll tidigare förval (fyll luckor med dem, inte med de neutrala)
    S.data.prefs = Object.assign(JSON.parse(JSON.stringify(CARL_PREFS)), S.data.prefs || {}, { frozen: true });
    if (!S.data.profile) S.data.profile = CARL_PROFILE;
    S.data.textUpdatedAt = new Date().toISOString();
    try { localStorage.setItem('fk.data', JSON.stringify(S.data)); } catch { }
  }
  const P0 = S.data.prefs;
  if (P0 && !P0.migratedV4) {
    // Kök → länder, utrustning → bara utöver standard
    const allC = OPT.cuisines.flatMap(([, l]) => l.map(x => x[1]));
    if (Array.isArray(P0.cuisines)) P0.cuisines = [...new Set(P0.cuisines.flatMap(c => CUISINE_MAP[c] || (allC.includes(c) ? [c] : [])))];
    const allE = OPT.equipment.flatMap(([, l]) => l);
    if (Array.isArray(P0.equipment)) {
      const mapped = P0.equipment.map(e => e in EQUIP_MAP ? EQUIP_MAP[e] : e).filter(Boolean);
      P0.equipment = [...new Set(mapped.filter(e => allE.includes(e)))];
      P0.customEquipment = [...new Set([...(P0.customEquipment || []), ...mapped.filter(e => !allE.includes(e))])];
    }
    P0.migratedV4 = true;
  }
  if (P0 && Array.isArray(P0.customEquipment)) {
    const allE = OPT.equipment.flatMap(([, l]) => l);
    const known = P0.customEquipment.filter(e => allE.includes(e));
    if (known.length) { P0.equipment = [...new Set([...(P0.equipment || []), ...known])]; P0.customEquipment = P0.customEquipment.filter(e => !allE.includes(e)); }
  }
  S.data.prefs = Object.assign(JSON.parse(JSON.stringify(DEFAULT_PREFS)), S.data.prefs || {});
  if (S.data.instructions === LEGACY_INSTRUCTIONS || S.data.instructions === INSTRUCTIONS_V2 || S.data.instructions === INSTRUCTIONS_V3) S.data.instructions = DEFAULT_INSTRUCTIONS;
  if (/^Periodisk fasta och styrketräning\. Mål: viktminskning/.test(S.data.prefs.healthNote || '')) S.data.prefs.healthNote = DEFAULT_HEALTH;
  if (S.data.profile === DEFAULT_PROFILE_V2 || S.data.profile === PROFILE_V3) S.data.profile = CARL_PROFILE;
  else if (S.data.profile && !/Malaysia|foodie/i.test(S.data.profile) && !S.data.prefs.foodieAdded) { S.data.profile = S.data.profile.trim() + '\n' + FOODIE_LINE; }
  S.data.prefs.foodieAdded = true;
  if (S.data.profile === LEGACY_PROFILE) S.data.profile = CARL_PROFILE;
}
migrateData();
if (!S.current) S.current = { suggestions: null, suggIntro: '', recipe: null, recipeSavedId: null, dirty: false };

function saveSettings() { LS.set('fk.settings', S.settings); }
function saveCurrent() { LS.set('fk.current', S.current); }
function chatSig(list) { const v = list.filter(m => !m.hidden); return v.length + '|' + (v[v.length - 1]?.at || '') + '|' + v.map(m => (m.applied ? 'a' : '') + (m.text || '').length).join(','); }
function saveChat() {
  const slim = S.chat.slice(-80).map(m => ({ ...m, image: undefined }));
  LS.set('fk.chat', slim);
  // Dela chatten mellan enheter (bara synliga meddelanden, utan bilder)
  if (typeof S.data === 'object' && !S.busy) {
    const sig = chatSig(S.chat);
    if (sig !== S.chatSigSent && sig !== S.data.chatSync?.sig) {
      S.chatSigSent = sig;
      S.data.chatSync = { msgs: S.chat.filter(m => !m.hidden).slice(-40).map(m => ({ ...m, image: undefined, view: undefined })), sig, device: S.settings.deviceId, updatedAt: now() };
      S.chatAppliedAt = S.data.chatSync.updatedAt;
      saveData();
    }
  }
}
function applyRemoteChat() {
  const cs = S.data.chatSync;
  if (!cs || cs.device === S.settings.deviceId || (S.chatAppliedAt || '') >= cs.updatedAt || S.busy) return false;
  S.chatAppliedAt = cs.updatedAt; S.chatSigSent = cs.sig;
  // Behåll dolda receptval (kontext till kocken) men ta in den delade synliga tråden
  S.chat = [...S.chat.filter(m => m.hidden).slice(-10), ...cs.msgs];
  S.chat.sort((a, b) => (a.at || '').localeCompare(b.at || ''));
  LS.set('fk.chat', S.chat.slice(-80).map(m => ({ ...m, image: undefined })));
  return true;
}
function saveData(opts = {}) {
  LS.set('fk.data', S.data);
  if (!opts.noSync) scheduleSync();
}

/* ============ Pågående matlagning & historik (synkas mellan enheter) ============ */
if (!S.settings.deviceId) { S.settings.deviceId = uid(); saveSettings(); }
function deviceName() {
  const ua = navigator.userAgent;
  if (/iPad|Tablet|SM-X|SM-T/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua)) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(ua))) return 'plattan';
  if (/Mobi|iPhone|Android/i.test(ua)) return 'mobilen';
  return 'datorn';
}
function recipeKey(r) { return (r?.title || '').trim().toLowerCase(); }
function newSession() {
  S.current.sessionId = uid();
}
let sessionTimer = null;
function saveSession() {
  const r = S.current.recipe;
  if (!r || S.route.view !== 'recipe') return;
  if (!S.current.sessionId) newSession();
  clearTimeout(sessionTimer);
  sessionTimer = setTimeout(() => {
    S.data.session = {
      id: S.current.sessionId, recipe: r, savedId: S.current.recipeSavedId || null,
      checked: S.checked, doneSteps: S.doneSteps, activeStep: S.activeStep,
      portions: S.portions, chat: S.chat.filter(m => !m.hidden).slice(-30).map(m => ({ ...m, image: undefined, view: undefined })),
      device: S.settings.deviceId, deviceName: deviceName(), updatedAt: now(), ended: false,
    };
    saveData();
  }, 600);
}
function addHistory(r, savedId) {
  if (!r) return;
  const key = recipeKey(r);
  S.data.history = (S.data.history || []).filter(h => recipeKey(h.recipe) !== key);
  S.data.history.unshift({ id: uid(), recipe: r, savedId: savedId || null, viewedAt: now() });
  S.data.history = S.data.history.slice(0, 30);
  saveData();
}
function applySession(ss) {
  S.current.recipe = ss.recipe; S.current.recipeSavedId = ss.savedId || null; S.current.dirty = false;
  S.current.sessionId = ss.id;
  S.checked = ss.checked || {}; S.doneSteps = ss.doneSteps || {}; S.activeStep = ss.activeStep ?? null;
  S.portions = ss.portions || null;
  if (Array.isArray(ss.chat)) S.chat = ss.chat;
  saveCurrent(); saveChat();
}
function joinIfActive(r) {
  const ss = S.data.session;
  if (!ss || ss.ended || !ss.recipe || recipeKey(ss.recipe) !== recipeKey(r)) return false;
  if (Date.now() - new Date(ss.updatedAt).getTime() > 12 * 3600e3) return false;
  applySession(ss); return true;
}
function otherSession() {
  const ss = S.data.session;
  if (!ss || ss.ended || !ss.recipe) return null;
  if (ss.id === S.current.sessionId) return null;
  if (Date.now() - new Date(ss.updatedAt).getTime() > 12 * 3600e3) return null;
  return ss;
}
function sessionBanner() {
  const ss = otherSession(); if (!ss) return '';
  const total = ss.recipe.steps?.length || 0;
  const done = Object.values(ss.doneSteps || {}).filter(Boolean).length;
  const at = new Date(ss.updatedAt).toLocaleTimeString(LOCALE(), { hour: '2-digit', minute: '2-digit' });
  const devEn = { plattan: 'the tablet', mobilen: 'the phone', datorn: 'the computer' };
  const where = ss.device === S.settings.deviceId ? L('här', 'here') : L(`på ${ss.deviceName || 'en annan enhet'}`, `on ${devEn[ss.deviceName] || 'another device'}`);
  const pos = ss.activeStep != null ? L(`steg ${ss.activeStep + 1} av ${total}`, `step ${ss.activeStep + 1} of ${total}`) : done ? L(`${done} av ${total} steg klara`, `${done} of ${total} steps done`) : L('inte påbörjad', 'not started');
  return `<div class="resume"><div><strong>${L('Fortsätt', 'Continue')}: ${esc(ss.recipe.title)}</strong><span class="muted">${L(`Startad ${where} ${at}`, `Started ${where} at ${at}`)} · ${pos}</span></div>
    <div class="row"><button class="btn" data-resume>${L('Fortsätt', 'Continue')}</button><button class="ghost small" data-endsession>${L('Avsluta', 'End')}</button></div></div>`;
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
const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const dayName = (d = new Date()) => L(DAYS[d.getDay()], DAYS_EN[d.getDay()]);
function dayMode() {
  const dm = S.settings.dayMode;
  return dm && dm.date === new Date().toDateString() ? dm.mode : 'auto';
}
function timeOverride() {
  const t = S.settings.timeOverride;
  return t && t.date === new Date().toDateString() ? t.val : null;
}
function todayTime() {
  const P = S.data.prefs, d = dayInfo();
  const def = d.weekend ? P.weekendTime : P.weekdayTime;
  const o = timeOverride();
  return { key: o || def, label: timeLabel(o || def), manual: !!o && o !== def, def };
}
function hm(str) { const m = String(str || '').match(/^(\d{1,2})[:.](\d{2})$/); return m ? +m[1] * 60 + +m[2] : null; }
function fmtDur(min) { const a = Math.abs(min), h = Math.floor(a / 60), m = a % 60; return (h ? `${h} h ` : '') + `${m} min`; }
function clockText() {
  const n = new Date(), d = dayInfo(n), P = S.data.prefs;
  const dinner = d.weekend ? P.dinnerWeekend : P.dinnerWeekday;
  const nowMin = n.getHours() * 60 + n.getMinutes(), dm = hm(dinner);
  let line = `Klockan är ${d.time}.`;
  if (dm != null) {
    const left = dm - nowMin;
    line += left > 0 ? ` Middag brukar serveras ${dinner} – om ${fmtDur(left)}.` : ` Middagstiden (${dinner}) passerades för ${fmtDur(left)} sedan.`;
  }
  const lines = [line];
  if (S.cookStart) lines.push(`Matlagningen startade ${new Date(S.cookStart).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })} (${fmtDur(Math.floor((n - S.cookStart) / 60000))} sedan).`);
  if (S.route.view === 'recipe' && S.current.recipe && S.activeStep != null) lines.push(`Vi är på steg ${S.activeStep + 1} av ${S.current.recipe.steps.length}.`);
  const tms = (S.timers || []).map(t => { const s = Math.round((t.end - Date.now()) / 1000); return s > 0 ? `${t.label}: ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')} kvar` : `${t.label}: klar`; });
  if (tms.length) lines.push(`Pågående timers: ${tms.join('; ')}.`);
  return lines.join('\n');
}
function season(m = new Date().getMonth()) {
  return ['vinter', 'vinter', 'vår', 'vår', 'vår', 'sommar', 'sommar', 'sommar', 'höst', 'höst', 'höst', 'vinter'][m];
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
  const n = '(?:\\d+\\s\\d+\\/\\d+|\\d+\\/\\d+|\\d+(?:[.,]\\d+)?)';
  return esc(text).replace(new RegExp('(' + n + '(?:\\s?[–-]\\s?' + n + ')?\\s?(?:kg|g|hg|mg|l|dl|cl|ml|msk|tsk|krm|st|klyftor?|förp|nypa|cm|°C|grader|tbsp|tsp|cloves?|cans?|packs?|pinch|degrees)(?![a-zåäö]))', 'gi'), '<b>$1</b>');
}
const UNIT_RE = '(?:kg|g|hg|mg|l|dl|cl|ml|msk|tsk|krm|st|klyftor?|förp|burk|burkar|paket|knippe|skivor|nypa|tbsp|tsp|cloves?|cans?|packs?|bunch|bunches|slices?|pinch)';
function parseNum(t) {
  t = t.trim().replace(',', '.');
  let m;
  if ((m = t.match(/^(\d+)\s+(\d+)\/(\d+)$/))) return +m[1] + m[2] / m[3];
  if ((m = t.match(/^(\d+)\/(\d+)$/))) return m[1] / m[2];
  return parseFloat(t);
}
function fmtNum(x, unit = '') {
  if (!isFinite(x)) return '';
  if (/^(g|ml)$/i.test(unit) && x >= 50) return String(Math.round(x / 5) * 5);
  if (x >= 10) return String(Math.round(x));
  const fr = [[0.25, '1/4'], [0.33, '1/3'], [0.5, '1/2'], [0.67, '2/3'], [0.75, '3/4']];
  const whole = Math.floor(x), rest = x - whole;
  if (/^(st|förp|burk|burkar|paket|knippe|klyfta|klyftor|cloves?|cans?|packs?|bunch|bunches|slices?)$/i.test(unit) || !unit) {
    const f = fr.find(([v]) => Math.abs(rest - v) < 0.05);
    if (f) return (whole ? whole + ' ' : '') + f[1];
    if (rest < 0.05) return String(whole);
    if (rest > 0.95) return String(whole + 1);
  }
  return String(Math.round(x * 10) / 10).replace('.', L(',', '.'));
}
const NUM = '(\\d+\\s\\d+\\/\\d+|\\d+\\/\\d+|\\d+(?:[.,]\\d+)?)';
function scaleAmount(amount, f) {
  if (f === 1 || !amount) return amount;
  // bara första talet (inte "(à 340 g)")
  return String(amount).replace(new RegExp('^\\s*' + NUM + '(\\s?[–-]\\s?' + NUM + ')?(\\s*)(\\S*)'), (m, a, rng, b, sp, unit) =>
    fmtNum(parseNum(a) * f, unit) + (rng ? '–' + fmtNum(parseNum(b) * f, unit) : '') + sp + unit);
}
function scaleStepText(text, f) {
  if (f === 1) return text;
  return String(text).replace(new RegExp(NUM + '(\\s?[–-]\\s?' + NUM + ')?(\\s?)(' + UNIT_RE + ')\\b', 'gi'), (m, a, rng, b, sp, unit) =>
    fmtNum(parseNum(a) * f, unit) + (rng ? '–' + fmtNum(parseNum(b) * f, unit) : '') + sp + unit);
}
function portionsFor(r) {
  return S.portions && S.portions.title === r.title ? S.portions.n : (r.servings || 4);
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
      if (r.cooked?.length) bits.push(`lagad ${r.cooked.length} ggr, senast ${String(r.cooked[r.cooked.length - 1]).slice(0, 10)}`);
      const note = (r.notes || '').replace(/\s+/g, ' ').slice(0, 220);
      return `- ${r.title}${r.origin ? ` (${r.origin})` : ''}${bits.length ? ` – ${bits.join(', ')}` : ''}${note ? `. Anteckning: ${note}` : ''}`;
    }).join('\n') || '- (kokboken är tom än så länge)';
  const onScreen = S.route.view === 'recipe' && S.current.recipe
    ? JSON.stringify(stripRecipe(S.current.recipe)) + (portionsFor(S.current.recipe) !== (S.current.recipe.servings || 4) ? `\n(Vi har skalat receptet till ${portionsFor(S.current.recipe)} portioner i appen. Svara utifrån det. Ber vi om ändringar: skicka receptet för ${portionsFor(S.current.recipe)} portioner.)` : '')
    : (S.route.view === 'suggestions' && S.current.suggestions
      ? 'Förslagslistan: ' + S.current.suggestions.map((s, i) => `${i + 1}. ${s.name}`).join('; ')
      : 'Inget recept visas just nu.');
  return `${DEFAULT_INSTRUCTIONS}

${prefsText(d)}

## OM FAMILJEN (fritext)
${S.data.profile}

## SMAKMINNE (det du lärt dig om oss)
${mem}

## FAMILJENS KOKBOK (sparade rätter, betyg och våra anteckningar)
${book}

## IDAG
Idag är det ${d.name} ${d.date}. Säsong: ${season()}. Dagläge: ${d.label}${d.manual ? ' (valt manuellt)' : ''}, tidsram ${todayTime().label}.
${clockText()}

## DET SOM VISAS PÅ SKÄRMEN
${onScreen}

${langRule()}`;
}
function breadText(P) {
  const lab = (opts, k) => (opts.find(x => x[0] === k) || [, ''])[1];
  const rows = [
    P.breadLeaven.length && `jäsmedel ${P.breadLeaven.join(', ')}`,
    P.breadStarter && 'vi har en levande surdegsgrund hemma',
    P.breadProof && `jäsning ${lab(BREAD_OPT.proof, P.breadProof).toLowerCase()}`,
    P.breadKnead && `knådning ${lab(BREAD_OPT.knead, P.breadKnead).toLowerCase()}`,
    P.breadHydration && `degvätska (hydrering) ${lab(BREAD_OPT.hydration, P.breadHydration).toLowerCase()}`,
    P.breadFlour.length && `mjöl ${P.breadFlour.join(', ')}`,
    P.breadBake.length && `gräddning ${P.breadBake.join(', ')}`,
    P.breadNote.trim() && `övrigt: ${P.breadNote.trim()}`,
  ].filter(Boolean);
  if (!rows.length) return '';
  return `\n- Bakning av bröd (gäller bara bröd och annat jäst bakverk, inte vid renskrivning där originalet följs): ${rows.join('; ')}. Vilande jästid räknas inte in i tidsramen. Skriv ut när degen ska startas för att brödet ska bli klart i tid.`;
}
function prefsText(d) {
  const P = S.data.prefs, t = todayTime();
  const equip = [...P.equipment, ...P.customEquipment];
  return `## INSTÄLLNINGAR (styr dina svar)
- Dagläge: ${d.label}${d.manual ? ' – valt manuellt för idag' : ' – automatiskt efter veckodag'}
- Tidsram idag: ${t.label} totalt${t.manual ? ' (valt för idag)' : ` (vår standard för ${d.weekend ? 'helg' : 'vardag'})`}
- Specialutrustning: ${d.weekend && P.weekendGear ? 'använd gärna – det är helg och vi vill laga mat som hobby' : 'bara om det sparar tid eller disk'}
- Portioner: ${P.portions}${P.bigEaters ? ' rejäla portioner – vi äter mycket, räkna hellre för mycket' : ''}
- ALLERGIER OCH ÄTER INTE (får aldrig brytas): ${P.allergies || 'inga kända'}
- Hälsomål${P.healthWho ? ` (gäller ${P.healthWho})` : ''}: ${P.healthNote || 'inga särskilda'}
- Lättare alternativ: ${P.healthyAlt ? `ja – fyll alltid "health" med hur rätten anpassas för ${P.healthWho || 'den'} som vill äta lättare` : 'bara om vi ber om det'}
- Favoritländer (sprid förslagen över dessa kök): ${P.cuisines.join(', ') || 'alla'}
- Standardutrustning (finns alltid): ${STANDARD_KITCHEN}
- Specialutrustning vi har: ${equip.join(', ') || 'ingen utöver standard'}${breadText(P)}`;
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
  const key = ((window.Cloud?.active() && Cloud.geminiKey()) || S.settings.geminiKey || '').trim();
  if (!key) throw new Error('NOKEY');
  const lastUser = [...msgs].reverse().find(m => m.role === 'user');
  const hasLink = /https?:\/\/\S+/.test(lastUser?.text || '');
  let schema = RESPONSE_SCHEMA, useTool = hasLink;
  S.lastUrlFail = false; S.lastCut = false;
  let cutoffs = 0, bestPartial = '', lastFinish = '';
  const mkBody = thinking => JSON.stringify({
    ...(useTool ? { tools: [{ url_context: {} }] } : {}),
    systemInstruction: { parts: [{ text: sys }] },
    contents: mergeRoles(msgs).map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [
      ...(m.image ? [{ inlineData: { mimeType: m.image.mime, data: m.image.data } }] : []), { text: m.text } ] })),
    generationConfig: { ...(useTool ? {} : { responseMimeType: 'application/json', responseSchema: schema }), temperature: 0.8, ...(thinking ? { thinkingConfig: { thinkingLevel: thinking } } : {}) },
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
      } catch (e) { throw new Error(L('Kunde inte nå Google (nätverksfel). Kontrollera internetuppkopplingen.', 'Could not reach Google (network error). Check your internet connection.')); }
      if (res.ok) {
        if (!cutoffs && model !== S.settings.geminiModel && !/överbelastad|kvot|overloaded|quota/.test(lastErr)) { S.settings.geminiModel = model; saveSettings(); }
        const reader = res.body.getReader(); const dec = new TextDecoder();
        let buf = '', txt = '', finish = '', urlMeta = null;
        const readLine = raw => {
          const line = raw.trim();
          if (!line.startsWith('data:')) return;
          try {
            const j = JSON.parse(line.slice(5));
            const c = j.candidates?.[0];
            (c?.content?.parts || []).forEach(p => { if (!p.thought && p.text) txt += p.text; });
            if (c?.finishReason) finish = c.finishReason;
            const um = c?.urlContextMetadata || c?.url_context_metadata;
            if (um) urlMeta = um.urlMetadata || um.url_metadata || urlMeta;
            onProgress(txt);
          } catch { /* ofullständig rad */ }
        };
        try {
          for (;;) {
            const { value, done } = await reader.read();
            if (done) break;
            buf += dec.decode(value, { stream: true });
            let i;
            while ((i = buf.indexOf('\n')) >= 0) { readLine(buf.slice(0, i)); buf = buf.slice(i + 1); }
          }
          readLine(buf + dec.decode());  // sista raden kan sakna radbrytning
        } catch (e) { console.warn('Gemini: strömmen bröts', model, e); }  // t.ex. skärmen låstes eller nätet föll bort
        // Svar som tog slut för tidigt: prova igen i stället för att visa en halv mening
        if (!replyComplete(txt, finish, !useTool)) {
          console.warn('Gemini: ofullständigt svar', model, finish || 'ingen finishReason', txt.length);
          if (txt.length > bestPartial.length) bestPartial = txt;
          lastFinish = finish;
          cutoffs++;
          if (cutoffs >= 3) break;
          onProgress('', L('Svaret bröts – provar igen…', 'The answer was cut off – trying again…'));
          if (cutoffs === 1) continue;
          break;  // andra gången: byt modell
        }
        S.lastUrlFail = false;
        if (useTool && Array.isArray(urlMeta) && urlMeta.length && !urlMeta.some(u => /SUCCESS/i.test(u.urlRetrievalStatus || u.url_retrieval_status || ''))) S.lastUrlFail = true;
        if (hasLink && !useTool) S.lastUrlFail = true;
        return txt;
      }
      const j = await res.json().catch(() => ({}));
      const msg = j.error?.message || `HTTP ${res.status}`;
      const status = j.error?.status || '';
      console.warn('Gemini', model, res.status, status, msg);
      if (res.status === 400 && thinking && /think/i.test(msg)) { thinking = null; continue; }  // modellen godtar inte nivån
      if (res.status === 400 && schema && /schema|response_schema|responseSchema/i.test(msg)) { schema = undefined; continue; }
      if (res.status === 400 && useTool && /url_context|urlContext|tool/i.test(msg)) { useTool = false; continue; }
      lastErr = `${model}: ${msg}`;
      // Överbelastad (503/500) eller kvot slut (429): prova nästa modell direkt
      if (res.status === 503 || res.status === 500 || res.status === 429 || /UNAVAILABLE|high demand|overloaded|RESOURCE_EXHAUSTED/i.test(msg + status)) {
        lastErr = res.status === 429 ? L(`${model}: gratiskvoten är slut för stunden`, `${model}: the free quota is used up for now`) : L(`${model}: överbelastad just nu`, `${model}: overloaded right now`);
        onProgress('', L('Google har mycket att göra – provar igen…', 'Google is busy – trying again…'));
        if (attempt === 0 && res.status !== 429) { await new Promise(r => setTimeout(r, 1500)); continue; }
        break;
      }
      if (res.status === 404 || /not found|not supported|no longer available|ACCESS_TOKEN_TYPE_UNSUPPORTED/i.test(msg + status)) break;
      if (res.status === 400 && /API key not valid|API_KEY_INVALID/i.test(msg + JSON.stringify(j))) throw new Error(L('Google säger att nyckeln är ogiltig. Kopiera den igen från aistudio.google.com/apikey och spara på nytt.', 'Google says the key is invalid. Copy it again from aistudio.google.com/apikey and save it.'));
      if (res.status === 403) throw new Error(L('Nyckeln saknar behörighet (403): ', 'The key lacks permission (403): ') + msg + L(' – skapa en ny nyckel i AI Studio.', ' – create a new key in AI Studio.'));
      throw new Error(lastErr);
    }
    if (cutoffs >= 3) break;
  }
  if (cutoffs) {
    if (!bestPartial) throw new Error(L('Tomt svar från Gemini (', 'Empty answer from Gemini (') + (lastFinish || L('okänd orsak', 'unknown reason')) + ')');
    S.lastCut = true;
    return bestPartial;
  }
  throw new Error(L('Googles gratismodeller är överbelastade just nu (', 'Google\'s free models are overloaded right now (') + lastErr + L('). Vänta en minut och försök igen.', '). Wait a minute and try again.'));
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
// Helt svar = modellen sa STOP och (när JSON krävs) texten går att tolka
function replyComplete(txt, finish, needJson) {
  if (!txt || finish !== 'STOP') return false;
  if (!needJson) return true;
  const t = txt.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  try { JSON.parse(t.slice(t.indexOf('{'), t.lastIndexOf('}') + 1)); return true; } catch { return false; }
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
  return { reply: cleanReply(o.reply), suggestions: o.suggestions ?? null, recipe: o.recipe ?? null, learn: Array.isArray(o.learn) ? o.learn : [], offerUpdate: !!o.offerUpdate };
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
function recipeDiff(a, b) {
  if (!a || !b) return [];
  const key = i => (i.name || '').toLowerCase().trim();
  const A = new Map(a.ingredients.map(i => [key(i), i])), B = new Map(b.ingredients.map(i => [key(i), i]));
  const out = [];
  const removed = [...A.keys()].filter(k => !B.has(k)), added = [...B.keys()].filter(k => !A.has(k));
  if (removed.length === 1 && added.length === 1) out.push(`${A.get(removed[0]).name} → ${B.get(added[0]).name}${B.get(added[0]).amount ? ` (${B.get(added[0]).amount})` : ''}`);
  else {
    added.forEach(k => out.push(`+ ${B.get(k).amount ? B.get(k).amount + ' ' : ''}${B.get(k).name}`));
    removed.forEach(k => out.push(`− ${A.get(k).name}`));
  }
  [...B.keys()].filter(k => A.has(k) && (A.get(k).amount || '') !== (B.get(k).amount || '')).forEach(k => out.push(`${B.get(k).name}: ${A.get(k).amount} → ${B.get(k).amount}`));
  const sa = a.steps.map(x => x.text).join('|'), sb = b.steps.map(x => x.text).join('|');
  if (sa !== sb) out.push(a.steps.length !== b.steps.length ? L(`stegen: ${a.steps.length} → ${b.steps.length}`, `steps: ${a.steps.length} → ${b.steps.length}`) : L('stegen är justerade', 'the steps are adjusted'));
  if ((a.title || '') !== (b.title || '')) out.push(`${L('namn', 'name')}: ${b.title}`);
  return out;
}
const CLAIM_RE = /(i(?:'ve| have) (?:updated|changed|adjusted|replaced|added|removed)|has been (?:updated|changed|adjusted)|here is the (?:new|updated|revised)|uppdaterat|uppdaterade|uppdaterats|uppdaterar|ändrat|ändrade|ändrats|justerat|justerade|justerats|har bytt|bytt ut|bytts ut|lagt till|lagts till|tagit bort|tagits bort|här är (det|ditt|ert) (nya|ändrade|reviderade))/i;
function normalizeRecipe(r) {
  if (!r || !Array.isArray(r.ingredients) || !Array.isArray(r.steps)) return null;
  r.ingredients = r.ingredients.map((x, i) => ({ id: String(x.id || `i${i + 1}`), amount: x.amount || '', name: x.name || '', note: x.note || '', group: x.group || '' }));
  r.steps = r.steps.map(s => typeof s === 'string' ? { text: s, uses: [], minutes: null } :
    { text: s.text || '', uses: Array.isArray(s.uses) ? s.uses.map(String) : [], minutes: Number(s.minutes) > 0 ? Number(s.minutes) : null });
  r.servings = r.servings || 4;
  if (r.source && !/^https?:\/\//.test(r.source)) r.source = null;
  r.health = r.health || null; r.tips = Array.isArray(r.tips) ? r.tips : [];
  return r;
}

function partialReply(acc) {
  const m = acc.match(/"reply"\s*:\s*"((?:[^"\\]|\\.)*)/);
  if (!m) return '';
  try { return JSON.parse('"' + m[1].replace(/\\$/, '') + '"'); } catch { return m[1].replace(/\\n/g, '\n'); }
}
function showProgress(acc, override) {
  const what = override ? override : S.readingHost && !acc ? L(`Läser receptet från ${S.readingHost}…`, `Reading the recipe from ${S.readingHost}…`) : /"recipe"\s*:\s*\{/.test(acc) ? L('Souschefen skriver receptet…', 'The sous-chef is writing the recipe…')
    : /"suggestions"\s*:\s*\[/.test(acc) ? L(`Souschefen plockar fram förslag… (${(acc.match(/"name"\s*:/g) || []).length} hittills)`, `The sous-chef is picking suggestions… (${(acc.match(/"name"\s*:/g) || []).length} so far)`)
    : L('Souschefen tänker…', 'The sous-chef is thinking…');
  const st = document.getElementById('stageStatus'); if (st) st.textContent = what;
  const live = document.getElementById('liveReply');
  const r = partialReply(acc);
  if (live && override && !r) { live.classList.add('typing'); live.innerHTML = '<i></i><i></i><i></i>'; }
  if (live && r) { live.classList.remove('typing'); live.innerHTML = md(r); const log = $('#chatLog'); log.scrollTop = log.scrollHeight; }
}
// flow = receptval från huvudfönstret (knappar/startsida). Syns inte i chatten, men kocken minns det.
async function send(text, image, opts = {}) {
  text = (text || '').trim();
  if ((!text && !image) || S.busy) return;
  const flow = !!opts.flow;
  S.readingHost = (() => { const l = (text.match(/https?:\/\/[^\s]+/) || [])[0]; try { return l ? new URL(l).hostname.replace(/^www\./, '') : ''; } catch { return ''; } })();
  const userMsg = { role: 'user', text: text || L('Vad kan jag laga av det här?', 'What can I cook with this?'), image, at: now(), hidden: flow, ...(opts.display ? { display: opts.display } : {}) };
  S.chat.push(userMsg);
  S.busy = flow ? 'flow' : 'chat'; saveChat(); renderChat(true);
  if (S.route.view === 'home' || S.route.view === 'suggestions') renderStage();
  try {
    const raw = await callModel(showProgress);
    const o = parseReply(raw);
    const msg = { role: 'assistant', text: o.reply || '', at: now() };
    const linkInMsg = (text.match(/https?:\/\/[^\s]+/) || [])[0];
    let recipe = normalizeRecipe(o.recipe);
    let sugg = Array.isArray(o.suggestions) && o.suggestions.length ? o.suggestions : null;
    if (linkInMsg && S.lastUrlFail) {
      // Sidan gick inte att läsa – visa aldrig ett påhittat recept
      recipe = null; sugg = null;
      let host = linkInMsg; try { host = new URL(linkInMsg).hostname.replace(/^www\./, ''); } catch { }
      msg.text = L(`Jag kunde inte läsa receptet på ${host}. Sidan kan kräva inloggning eller blockera uppläsning. Kopiera receptets text och klistra in den här, så renskriver jag det.`, `I couldn't read the recipe on ${host}. The page may require a login or block reading. Copy the recipe text and paste it here, and I'll clean it up.`);
    }
    if (recipe && linkInMsg && !recipe.source) recipe.source = linkInMsg;
    if (recipe) {
      const keepId = S.route.view === 'recipe' ? S.current.recipeSavedId : null;
      const sameDish = S.route.view === 'recipe' && S.current.recipe;
      const prevRecipe = sameDish ? S.current.recipe : null;
      S.current.recipe = recipe; S.current.recipeSavedId = keepId; S.current.dirty = !!keepId;
      if (!sameDish) { S.checked = {}; S.doneSteps = {}; S.activeStep = null; S.cookStart = null; newSession(); }
      addHistory(recipe, keepId);
      if (!(S.portions && S.portions.title === recipe.title)) S.portions = null;
      msg.view = { recipe };
      if (flow) msg.hidden = true; else { const d = recipeDiff(prevRecipe, recipe); msg.updated = prevRecipe ? (d.length ? d : 'same') : [L('nytt recept', 'new recipe')]; }
      if (S.route.view !== 'recipe') go('recipe', { keepChat: true }); else { const sc = $('#stage').scrollTop; renderStage(); $('#stage').scrollTop = sc; }
      saveSession();
    } else if (sugg) {
      S.current.suggestions = sugg; S.current.suggIntro = o.reply || '';
      msg.view = { suggestions: sugg };
      msg.hidden = true; userMsg.hidden = true;
      go('suggestions', { keepChat: true });
    }
    const learned = (Array.isArray(o.learn) ? o.learn : []).map(s => cleanReply(s)).filter(x => x.length > 3);
    if (S.lastCut && !recipe && !sugg && msg.text) { msg.text = msg.text.trimEnd() + '…'; msg.cut = true; }
    if (!recipe && !sugg && !msg.text) { msg.text = L('Souschefen gav inget svar på det. Försök formulera om frågan.', 'The sous-chef had no answer to that. Try rephrasing the question.'); msg.placeholder = true; }
    if (learned.length) {
      const existing = new Set(S.data.memory.filter(m => !m.deleted).map(m => m.text.toLowerCase()));
      const fresh = learned.filter(l => !existing.has(l.toLowerCase()));
      fresh.forEach(t => S.data.memory.push({ id: uid(), text: t, at: now(), updatedAt: now() }));
      if (fresh.length) { msg.learned = fresh; saveData(); }
    }
    // Svar som föreslår (eller påstår) en ändring utan att skicka receptet: erbjud knapp
    // Varje svar medan ett recept är öppet får en knapp – starkare om souschefen föreslår/påstår en ändring
    if (!recipe && !sugg && !flow && S.route.view === 'recipe' && S.current.recipe && !msg.placeholder && !msg.cut) {
      const claim = CLAIM_RE.test(msg.text), bad = !!o.recipe;
      msg.offer = true;
      msg.offerStrong = !!(o.offerUpdate || claim || bad);
      if (claim || bad) msg.notApplied = true;
    }
    // Motfråga eller vanligt svar på ett receptval: visa i chatten med frågan
    if (!recipe && !sugg) { userMsg.hidden = false; msg.hidden = false; openChat(true); }
    S.chat.push(msg);
    saveCurrent();
    if (S.route.view === 'recipe') saveSession();
  } catch (e) {
    const nokey = e.message === 'NOKEY';
    S.chat.push({ role: 'error', text: nokey ? L('Souschefen behöver en gratis Gemini-nyckel. Lägg in den under Inställningar.', 'The sous-chef needs a free Gemini key. Add it under Settings.') : L(`Det gick inte att nå souschefen: ${e.message}`, `Could not reach the sous-chef: ${e.message}`), nokey, at: now() });
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
  if (!S.chat.length || confirm(L('Börja en ny tråd? Den nuvarande konversationen rensas (recept i kokboken påverkas inte).', 'Start a new thread? The current conversation will be cleared (recipes in the cookbook are not affected).'))) {
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
  el.innerHTML = `<img src="${S.attach.url}" alt=""><span>${L('Foto bifogat', 'Photo attached')}</span><button type="button" class="ghost small">${L('Ta bort', 'Remove')}</button>`;
  el.querySelector('button').onclick = () => { S.attach = null; renderAttach(); };
}
function renderChat(scroll) {
  const log = $('#chatLog');
  const visible = S.chat.filter(m => !m.hidden);
  const r = S.current.recipe && S.route.view === 'recipe' ? S.current.recipe : null;
  if (!visible.length) {
    const asks = r
      ? L([['Kan jag förbereda något i förväg?', 'Förbereda i förväg'], ['Vad kan jag byta ut om jag saknar något?', 'Saknar en råvara'], ['Gör receptet lite lättare utan att tappa smak.', 'Gör den lättare']],
          [['Can I prepare anything ahead?', 'Prepare ahead'], ['What can I swap if I am missing something?', 'Missing an ingredient'], ['Make the recipe a bit lighter without losing flavour.', 'Make it lighter']])
      : L([['Hur räddar jag en sås som skurit sig?', 'Såsen skar sig'], ['Vilken innertemperatur ska fläskkarré ha?', 'Innertemp karré'], ['Hur länge ska ris vila efter kokning?', 'Vila riset']],
          [['How do I rescue a split sauce?', 'Sauce split'], ['What internal temperature should pork neck reach?', 'Pork neck temp'], ['How long should rice rest after cooking?', 'Resting rice']]);
    log.innerHTML = `<div class="chat-empty"><p>${r ? L(`Frågor om <strong>${esc(r.title)}</strong>. Säg "byt" eller "ändra" så uppdateras receptet, eller tryck på Uppdatera receptet när souschefen föreslår något.`, `Questions about <strong>${esc(r.title)}</strong>. Say "swap" or "change" to update the recipe, or tap Update recipe when the sous-chef suggests something.`) : L('Snabba frågor medan du lagar. Recept väljer du i huvudfönstret.', 'Quick questions while you cook. Choose recipes in the main window.')}</p>
      ${asks.map(([q, l]) => `<button class="chip" data-ask="${esc(q)}">${esc(l)}</button>`).join('')}</div>`;
  } else {
    log.innerHTML = visible.map(m => { const i = S.chat.indexOf(m);
      if (m.role === 'user') return `<div class="msg user">${m.image ? `<img src="${m.image.url}" alt="Bifogat foto">` : ''}${md(m.display || m.text)}</div>`;
      if (m.role === 'error') return `<div class="msg error">${esc(m.text)}${m.nokey ? ` <button class="view-link" data-go="settings">Öppna inställningar</button>` : ''}</div>`;
      let extra = '';
      if (m.updated === 'same') extra += `<div class="learned">${L('Receptet skickades men inget ändrades.', 'The recipe was sent but nothing changed.')} <button class="view-link" data-apply="${i}">${L('Försök igen', 'Try again')}</button></div>`;
      else if (Array.isArray(m.updated)) extra += `<div class="learned upd">✓ ${L('Receptet är uppdaterat', 'The recipe is updated')}${m.updated.length ? ':<ul>' + m.updated.slice(0, 6).map(x => `<li>${esc(x)}</li>`).join('') + '</ul>' : ''}</div>`;
      else if (m.updated === true) extra += `<div class="learned">✓ ${L('Receptet är uppdaterat', 'The recipe is updated')}</div>`;
      if (m.offer && !m.applied) extra += m.offerStrong || m.offerStrong === undefined
        ? `<div class="offer">${m.notApplied ? `<span>${L('Receptet är inte ändrat än.', 'The recipe has not been changed yet.')}</span>` : ''}<button class="btn small" data-apply="${i}">${L('Uppdatera receptet', 'Update recipe')}</button><button class="ghost small" data-noapply="${i}">${L('Nej tack', 'No thanks')}</button></div>`
        : `<div class="offer weak"><button class="linkish" data-apply="${i}">${L('Uppdatera receptet utifrån svaret', 'Update the recipe from this answer')}</button></div>`;
      if (m.cut) extra += `<div class="offer weak"><span>${L('Svaret bröts av.', 'The answer was cut off.')}</span> <button class="linkish" data-retry="${i}">${L('Försök igen', 'Try again')}</button></div>`;
      if (m.learned?.length) extra += `<div class="learned">${L('Souschefen kommer ihåg', 'The sous-chef will remember')}: ${m.learned.map(esc).join(' · ')}</div>`;
      return `<div class="msg assistant">${md(m.text) || ''}${extra}</div>`;
    }).join('');
  }
  if (S.busy === 'chat') log.insertAdjacentHTML('beforeend', `<div class="msg assistant typing" id="liveReply" aria-label="${L('Souschefen skriver', 'The sous-chef is writing')}"><i></i><i></i><i></i></div>`);
  $('#chatInput').disabled = false;
  $('#composer .send').disabled = !!S.busy;
  if (scroll) log.scrollTop = log.scrollHeight;
}
$('#chatLog').addEventListener('click', e => {
  const a = e.target.closest('[data-ask]');
  if (a) { send(a.dataset.ask); return; }
  const ap = e.target.closest('[data-apply]');
  const rt = e.target.closest('[data-retry]');
  if (rt) { const m = S.chat[+rt.dataset.retry]; if (m) m.cut = false; send(L('Ditt förra svar bröts av mitt i. Skriv hela svaret igen.', 'Your last answer was cut off. Write the whole answer again.'), null, { display: L('↻ Försök igen', '↻ Try again') }); return; }
  if (ap) { const m = S.chat[+ap.dataset.apply]; if (m) { m.applied = true; } send(L('Ja, uppdatera receptet enligt ditt senaste svar. Skicka HELA det ändrade receptet i "recipe" (alla ingredienser och alla steg).', 'Yes, update the recipe according to your last answer. Send the WHOLE changed recipe in "recipe" (all ingredients and all steps).'), null, { display: L('✓ Uppdatera receptet', '✓ Update recipe') }); return; }
  const na = e.target.closest('[data-noapply]');
  if (na) { const m = S.chat[+na.dataset.noapply]; if (m) m.applied = true; saveChat(); renderChat(); }
});

/* ============ Vyer ============ */
// Liggande läge (mobil/platta/dator): ingredienser och steg sida vid sida, som ICA:s laga-läge
const landscapeMQ = matchMedia('(orientation: landscape)');
function updateSplit() {
  const st = $('#stage');
  const on = st.classList.contains('recipe-view') && landscapeMQ.matches && st.clientWidth >= 600;
  if (st.classList.contains('split') !== on) st.classList.toggle('split', on);
}
new ResizeObserver(() => updateSplit()).observe(document.getElementById('stage'));
landscapeMQ.addEventListener?.('change', updateSplit);
function renderStage() {
  const st = $('#stage');
  const v = S.route.view;
  st.classList.toggle('recipe-view', v === 'recipe' && !!S.current.recipe);
  updateSplit();
  if (v === 'home') st.innerHTML = viewHome();
  else if (v === 'suggestions') st.innerHTML = viewSuggestions();
  else if (v === 'recipe') st.innerHTML = viewRecipe();
  else if (v === 'book') st.innerHTML = viewBook();
  else if (v === 'settings') st.innerHTML = viewSettings();
  else if (v === 'welcome') st.innerHTML = viewWelcome();
  else if (v === 'login' && window.Cloud) st.innerHTML = Cloud.viewLogin();
  else if (v === 'family' && window.Cloud) st.innerHTML = Cloud.viewFamily();
  document.getElementById('app').classList.toggle('onboarding', ['welcome', 'login', 'family'].includes(v));
  bindStage();
}

function viewHome() {
  const d = dayInfo();
  const P = S.data.prefs;
  const t = todayTime();
  const hist = (S.data.history || []).slice(0, 5);
  if (S.busy === 'flow') {
    return `<section class="home"><div class="loading-stage">${potSvg()}<span id="stageStatus">${L('Souschefen tänker…', 'The sous-chef is thinking…')}</span></div></section>`;
  }
  return `<section class="home">
    ${movedNote()}
    ${sessionBanner()}
    <h1>${L(`Vad lagar vi idag?`, `What's for dinner?`)}</h1>
    <form class="asker" id="homeAsk">
      <textarea id="homeInput" placeholder="${L('Vad har ni hemma och vad är ni sugna på? Eller klistra in en receptlänk.', 'What do you have and what do you fancy? Or paste a recipe link.')}" aria-label="${L('Beskriv vad ni har och vad ni vill ha', 'Describe what you have and what you want')}"></textarea>
      <div class="attach-preview" id="homeAttach" ${S.homeAttach ? '' : 'hidden'}>${S.homeAttach ? `<img src="${S.homeAttach.url}" alt=""><span>${L('Foto bifogat', 'Photo attached')}</span>` : ''}</div>
      <div class="asker-row">
        <label class="ghost" title="${L('Fota kylen eller skafferiet', 'Take a photo of the fridge or pantry')}">
          <input type="file" accept="image/*" capture="environment" id="homeFile" hidden>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="13" r="3.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>
          ${L('Foto', 'Photo')}
        </label>
        <span class="ask-hint" id="askHint" hidden></span>
        <button class="btn" type="submit" id="askBtn">${L('Ge oss förslag', 'Give us suggestions')}</button>
      </div>
    </form>
    ${hist.length || S.current.suggestions ? `<div class="recent-strip">
      ${syncNote()}
      <div class="strip-head"><h2>${L(`Senaste recept`, `Recent recipes`)}</h2>${hist.length ? `<button class="linkish" data-showhist>${L('Visa alla', 'Show all')} (${(S.data.history || []).length})</button>` : ''}</div>
      <div class="book-list home-list">
        ${S.current.suggestions ? `<button class="book-row" data-go="suggestions"><h3>${L('Senaste förslagen', 'Latest suggestions')}</h3><span class="sub">${S.current.suggestions.length} ${L('rätter', 'dishes')}</span></button>` : ''}
        ${hist.map(histRow).join('')}
      </div></div>` : ''}
  </section>`;
}
function potSvg() {
  return `<svg class="pot" viewBox="0 0 48 48" aria-hidden="true"><path class="steam" d="M17 6c2 3-2 4 0 8" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round"/><path class="steam" d="M24 4c2 3-2 4 0 8" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round"/><path class="steam" d="M31 6c2 3-2 4 0 8" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M6 22h36v4a14 14 0 0 1-14 14h-8A14 14 0 0 1 6 26z" fill="currentColor"/><path d="M2 24h4M42 24h4" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>`;
}

function viewSuggestions() {
  if (S.busy === 'flow') return `<section class="home"><div class="loading-stage">${potSvg()}<span id="stageStatus">${L('Souschefen tänker…', 'The sous-chef is thinking…')}</span></div></section>`;
  const list = S.current.suggestions || [];
  if (!list.length) return `<div class="empty"><h2>${L('Inga förslag än', 'No suggestions yet')}</h2><p>${L('Berätta vad ni har så föreslår souschefen rätter.', 'Tell the sous-chef what you have and get dish ideas.')}</p><button class="btn" data-go="home">${L('Till start', 'To start')}</button></div>`;
  return `<section>
    <div class="sugg-head"><h1>${L(`${list.length} förslag till ${dayInfo().name}`, `${list.length} suggestions for ${dayName()}`)}</h1></div>
    ${S.current.suggIntro ? `<div class="sugg-intro">${md(S.current.suggIntro)}</div>` : ''}
    <div class="sugg-grid">${list.map((s, i) => `
      <article class="sugg ${s.healthier ? 'healthier' : ''}">
        <div class="tags">
          <span class="tag ${String(s.tag).toLowerCase() === 'helg' ? 'helg' : 'vardag'}">${String(s.tag).toLowerCase() === 'helg' ? L('Helg', 'Weekend') : L('Vardag', 'Weekday')}</span>
          ${s.healthier ? `<span class="tag healthy">${esc(healthLabel())}</span>` : ''}
          ${s.vegetarian ? `<span class="tag veg">${L('Vegetarisk', 'Vegetarian')}</span>` : ''}
        </div>
        <h3>${esc(s.name)}</h3>
        ${s.origin || s.countries ? `<div class="origin">${flags(s)}<span>${esc(s.origin || '')}</span></div>` : ''}
        ${s.why ? `<p class="why">${esc(s.why)}</p>` : ''}
        <dl>
          ${s.time || s.difficulty ? `<dt>${L('Tid', 'Time')}</dt><dd>${esc([s.time, s.difficulty].filter(Boolean).join(', '))}</dd>` : ''}
          ${s.keyIngredients?.length ? `<dt>${L('Handla', 'Shop for')}</dt><dd>${esc(s.keyIngredients.join(', '))}</dd>` : ''}
          ${s.equipment ? `<dt>${L('Utrustning', 'Equipment')}</dt><dd>${esc(s.equipment)}</dd>` : ''}
        </dl>
        <button class="btn" data-pick="${i}">${L('Ge mig receptet', 'Give me the recipe')}</button>
      </article>`).join('')}
    </div>
    <div class="sugg-foot row" style="margin-top:20px"><button class="ghost" data-more>${L('Fler förslag', 'More suggestions')}</button></div>
  </section>`;
}

function viewRecipe() {
  const r = S.current.recipe;
  if (!r) return `<div class="empty"><h2>${L('Inget recept öppet', 'No recipe open')}</h2><p>${L('Välj ett förslag eller öppna en rätt i kokboken.', 'Pick a suggestion or open a dish in the cookbook.')}</p><button class="btn" data-go="home">${L('Till start', 'To start')}</button></div>`;
  const saved = S.current.recipeSavedId ? S.data.recipes.find(x => x.id === S.current.recipeSavedId) : null;
  const n = portionsFor(r), f = n / (r.servings || 4);
  const groups = [];
  r.ingredients.forEach(ing => {
    let g = groups.find(x => x.name === (ing.group || ''));
    if (!g) groups.push(g = { name: ing.group || '', items: [] });
    g.items.push(ing);
  });
  const checkedCount = r.ingredients.filter(i => S.checked[i.id]).length;
  const doneCount = r.steps.filter((_, k) => S.doneSteps[k]).length;
  const isHelg = String(r.tag).toLowerCase() === 'helg';
  const back = S.current.recipeSavedId ? 'book' : S.current.suggestions ? 'suggestions' : 'home';
  const stepper = `<div class="stepper portions" role="group" aria-label="${L('Portioner', 'Servings')}"><button type="button" data-rport="-1" aria-label="${L('Färre portioner', 'Fewer servings')}">−</button><output>${n} ${L('portioner', 'servings')}</output><button type="button" data-rport="1" aria-label="${L('Fler portioner', 'More servings')}">+</button></div>`;
  return `<article class="recipe">
  <header class="r-head">
    <button class="icon-btn r-close" data-go="${back}" aria-label="${L('Stäng receptet', 'Close the recipe')}" title="${L('Stäng', 'Close')}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></button>
    ${r.origin || r.countries ? `<div class="r-origin origin">${flags(r)}<span>${esc(r.origin || '')}</span></div>` : ''}
    <h1>${esc(r.title)}</h1>
    <div class="r-meta">
      ${r.source ? `<a class="r-source" href="${esc(r.source)}" target="_blank" rel="noopener">${L('Källa', 'Source')}: ${esc((() => { try { return new URL(r.source).hostname.replace(/^www\./, ''); } catch { return L('länk', 'link'); } })())}</a>` : ''}
      ${r.tag ? `<span class="tag ${isHelg ? 'helg' : 'vardag'}">${isHelg ? L('Helg', 'Weekend') : L('Vardag', 'Weekday')}</span>` : ''}
      ${r.time ? `<span>${esc(r.time)}</span>` : ''}
      ${saved?.rating ? `<span style="color:var(--kunyit)">${'★'.repeat(saved.rating)}</span>` : ''}
      <span class="r-actions">
        ${!saved ? `<button class="btn small" data-save>${L('Spara i kokboken', 'Save to cookbook')}</button>`
          : S.current.dirty ? `<button class="btn small" data-save>${L('Spara ändringarna', 'Save changes')}</button>`
          : `<button class="ghost small" data-cooked>${L('Vi lagade den idag', 'We cooked it today')}</button>`}
      </span>
    </div>
    ${r.intro ? `<p class="r-intro">${esc(r.intro)}</p>` : ''}
  </header>

  <nav class="r-jump" aria-label="${L('Hoppa till', 'Jump to')}">
    <button data-jump="r-ing" class="on">${L('Ingredienser', 'Ingredients')} <span>${checkedCount}/${r.ingredients.length}</span></button>
    <button data-jump="r-steps">${L('Gör så här', 'Method')} <span>${doneCount}/${r.steps.length}</span></button>
  </nav>

  <div class="r-split">
  <section class="r-sec ingredients" id="r-ing" aria-label="${L('Ingredienser', 'Ingredients')}">
    <div class="sec-head"><h2>${L('Ingredienser', 'Ingredients')}</h2>${stepper}</div>
    ${groups.map(g => `<div class="ing-group">${g.name ? `<h3 class="group-label">${esc(g.name)}</h3>` : ''}
      ${g.items.map(i => `<label class="ing ${S.checked[i.id] ? 'checked' : ''}" data-ing="${esc(i.id)}">
        <input type="checkbox" ${S.checked[i.id] ? 'checked' : ''} data-check="${esc(i.id)}">
        <span class="amt">${esc(scaleAmount(i.amount, f))}</span>
        <span><span class="name">${esc(i.name)}</span>${i.note ? ` <span class="note">${esc(i.note)}</span>` : ''}</span>
      </label>`).join('')}</div>`).join('')}
    <button class="btn start-cook" data-startcook>${L('Allt är framme – börja laga', 'Everything is out – start cooking')}</button>
  </section>

  <section class="r-sec steps" id="r-steps" aria-label="${L('Gör så här', 'Method')}">
    <div class="sec-head"><h2>${L('Gör så här', 'Method')}</h2><span class="muted step-hint">${L('Tryck på ett steg för att markera var du är', 'Tap a step to mark where you are')}</span>${stepper}</div>
    <ol>${r.steps.map((s, k) => `
      <li class="step ${S.activeStep === k ? 'active' : ''} ${S.doneSteps[k] ? 'done' : ''}" data-step="${k}">
        <div class="step-text">${highlightAmounts(scaleStepText(s.text, f))}</div>
        <div class="step-tools">
          ${s.minutes ? `<button class="ghost" data-timer="${k}">⏱ ${fmtMin(s.minutes)}</button>` : ''}
          <button class="ghost" data-done="${k}">${S.doneSteps[k] ? L('Ångra', 'Undo') : L('Klar', 'Done')}</button>
        </div>
      </li>`).join('')}</ol>
    ${r.health || r.tips?.length ? `<div class="extras">
      ${r.health ? `<div class="health"><h3>${esc(healthLabel())}</h3>${r.health.summary ? `<div>${md(r.health.summary)}</div>` : ''}
        ${r.health.tips?.length ? `<ul>${r.health.tips.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}</div>` : ''}
      ${r.tips?.length ? `<div class="tips"><h3>${L(`Souschefens tips`, `Sous-chef's tips`)}</h3><ul>${r.tips.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>` : ''}
    </div>` : ''}
    ${saved ? `<div class="notes-wrap">${notesBox(saved)}</div>` : ''}
  </section>
  </div>
  </article>`;
}
const fmtMin = m => m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ''}` : `${m} min`;
function notesBox(saved) {
  return `<div class="notes-box">
    <h3>${L(`Våra anteckningar`, `Our notes`)}</h3>
    <div class="row" style="margin-bottom:8px"><span class="muted">${L('Betyg', 'Rating')}</span><span class="stars" role="radiogroup" aria-label="${L('Betyg', 'Rating')}">${[1, 2, 3, 4, 5].map(n => `<button role="radio" aria-checked="${saved.rating === n}" aria-label="${L(`${n} av 5`, `${n} of 5`)}" class="${saved.rating >= n ? 'on' : ''}" data-rate="${n}">★</button>`).join('')}</span></div>
    <textarea id="notes" placeholder="${L('Vad blev bra, vad gör vi annorlunda nästa gång? Souschefen läser det här.', 'What went well, what would you change next time? The sous-chef reads this.')}">${esc(saved.notes || '')}</textarea>
    ${saved.cooked?.length ? `<div class="cooked-log">${L(`Lagad ${saved.cooked.length} ${saved.cooked.length === 1 ? 'gång' : 'gånger'}, senast`, `Cooked ${saved.cooked.length} ${saved.cooked.length === 1 ? 'time' : 'times'}, last on`)} ${new Date(saved.cooked[saved.cooked.length - 1]).toLocaleDateString(LOCALE())}</div>` : ''}
    <div class="row" style="margin-top:12px"><button class="ghost small danger" data-delete>${L('Ta bort ur kokboken', 'Remove from cookbook')}</button></div>
  </div>`;
}

const FLAG_WORDS = [
  [/svensk|sverige|swed|nordi|skandinav|scandinav/i, 'SE'], [/fransk|frankrike|french|france|proven/i, 'FR'], [/italien|ital/i, 'IT'], [/spansk|spanien|spanish|spain|katalan|catalan/i, 'ES'],
  [/grek|greek|greece/i, 'GR'], [/liban|leban|levant/i, 'LB'], [/turk/i, 'TR'], [/indisk|indien|indian|india/i, 'IN'], [/thai/i, 'TH'], [/malays|nyonya|peranakan/i, 'MY'],
  [/singapor/i, 'SG'], [/vietnam/i, 'VN'], [/kines|kina|chinese|china|sichuan|kanton|canton/i, 'CN'], [/korea/i, 'KR'], [/japan/i, 'JP'],
  [/amerikan|american|usa|texas|cajun|southern/i, 'US'], [/mexik|mexic|tex-mex/i, 'MX'], [/peru/i, 'PE'], [/argentin/i, 'AR'], [/brasil|brazil/i, 'BR'],
  [/marock|morocc|nordafrik|north afric/i, 'MA'], [/britt|brit|engelsk|english|england/i, 'GB'], [/tysk|german/i, 'DE'], [/indones/i, 'ID'], [/filippin|filipin|philippin/i, 'PH'],
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
  return who ? L(`${who}s val`, `${who}'s choice`) : L('Nyttigare', 'Healthier');
}
function bookRow(r) {
  return `<button class="book-row" data-open="${esc(r.id)}">
    <h3><span class="origin">${flags(r)}</span>${esc(r.title)}</h3>
    <span class="rt" aria-label="${r.rating ? r.rating + L(' av 5', ' of 5') : L('Inget betyg', 'No rating')}">${r.rating ? '★'.repeat(r.rating) : ''}</span>
    <span class="sub">${esc([r.origin, r.time, r.cooked?.length ? L(`lagad ${r.cooked.length} ggr`, `cooked ${r.cooked.length}×`) : L('inte lagad än', 'not cooked yet')].filter(Boolean).join(', '))}</span>
    ${r.notes ? `<span class="note-snip">${esc(r.notes.slice(0, 140))}${r.notes.length > 140 ? '…' : ''}</span>` : ''}
  </button>`;
}
function syncNote() {
  if (window.Cloud?.configured()) return '';  // familjekontot synkar allt
  if (!S.settings.ghToken) return `<div class="sync-note">${L('Historiken finns bara på den här enheten.', 'The history is only on this device.')} <button class="linkish" data-go="settings">${L('Slå på delning', 'Turn on sharing')}</button> ${L('för att fortsätta på en annan enhet.', 'to continue on another device.')}</div>`;
  if (/misslyckades|Fel token/.test(S.sync.state || '')) return `<div class="sync-note err">${L('Delningen fungerar inte just nu', 'Sharing is not working right now')} (${esc(tv(S.sync.state))}${$('#sync')?.title ? ': ' + esc($('#sync').title) : ''}). <button class="linkish" data-go="settings">${L('Kontrollera kopplingen', 'Check the connection')}</button></div>`;
  return '';
}
function histDate(h) { return new Date(h.viewedAt).toLocaleDateString(LOCALE(), { weekday: 'short', day: 'numeric', month: 'short' }); }
function histSaved(h) { return h.savedId && S.data.recipes.some(x => x.id === h.savedId); }
function histRow(h) {
  return `<button class="book-row" data-hist="${h.id}">
    <h3><span class="origin">${flags(h.recipe)}</span>${esc(h.recipe.title)}</h3>
    <span class="rt">${histSaved(h) ? `<span class="saved-badge">${L('I kokboken', 'In cookbook')}</span>` : ''}</span>
    <span class="sub">${esc([histDate(h), h.recipe.origin, h.recipe.time].filter(Boolean).join(' · '))}${h.recipe.source ? ' · ' + esc((() => { try { return new URL(h.recipe.source).hostname.replace(/^www\./, ''); } catch { return ''; } })()) : ''}</span>
  </button>`;
}
function viewBook() {
  const tab = S.bookTab || 'saved';
  const hist = S.data.history || [];
  const tabs = `<div class="book-tabs" role="tablist">
    <button role="tab" aria-selected="${tab === 'saved'}" data-booktab="saved">${L('Sparade', 'Saved')} <span>${S.data.recipes.length}</span></button>
    <button role="tab" aria-selected="${tab === 'hist'}" data-booktab="hist">${L('Senaste', 'Recent')} <span>${hist.length}</span></button></div>`;
  if (tab === 'hist') {
    const q = S.bookQuery.toLowerCase();
    const list = q ? hist.filter(h => [h.recipe.title, h.recipe.origin, ...(h.recipe.ingredients || []).map(i => i.name)].join(' ').toLowerCase().includes(q)) : hist;
    return `<section>
    <div class="book-head"><h1>${L('Kokboken', 'Cookbook')}</h1>
      <input class="search" id="bookSearch" type="search" placeholder="${L('Sök bland senaste recepten', 'Search recent recipes')}" value="${esc(S.bookQuery)}" aria-label="${L('Sök bland senaste recepten', 'Search recent recipes')}"></div>
    ${tabs}
    <p class="muted" style="margin:0 0 12px">${L(`Alla recept ni tittat på de senaste veckorna, även de som inte är sparade.`, `All recipes you have viewed in the last few weeks, including unsaved ones.`)}</p>
    ${syncNote()}
    ${hist.length === 0 ? `<div class="empty"><h2>${L('Ingen historik än', 'No history yet')}</h2><p>${L('Recept ni öppnar hamnar här automatiskt.', 'Recipes you open end up here automatically.')}</p><button class="btn" data-go="home">${L('Till start', 'To start')}</button></div>`
      : list.length ? `<div class="book-list">${list.map(histRow).join('')}</div>` : `<p class="muted">${L('Inget matchar.', 'No matches.')}</p>`}
  </section>`;
  }
  const q = S.bookQuery.toLowerCase();
  let list = S.data.recipes.slice();
  if (S.bookFilter === 'favoriter') list = list.filter(r => (r.rating || 0) >= 4);
  if (S.bookFilter === 'vardag') list = list.filter(r => String(r.tag).toLowerCase() !== 'helg');
  if (S.bookFilter === 'helg') list = list.filter(r => String(r.tag).toLowerCase() === 'helg');
  if (q) list = list.filter(r => [r.title, r.origin, r.notes, ...(r.ingredients || []).map(i => i.name)].join(' ').toLowerCase().includes(q));
  list.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  const f = (k, l) => `<button class="chip" aria-pressed="${S.bookFilter === k}" data-filter="${k}">${l}</button>`;
  return `<section>
    <div class="book-head"><h1>${L('Kokboken', 'Cookbook')}</h1>
      <input class="search" id="bookSearch" type="search" placeholder="${L('Sök rätt, råvara eller anteckning', 'Search dish, ingredient or note')}" value="${esc(S.bookQuery)}" aria-label="${L('Sök i kokboken', 'Search the cookbook')}"></div>
    ${tabs}
    <div class="filters">${f('alla', L('Alla', 'All'))}${f('favoriter', L('Favoriter', 'Favourites'))}${f('vardag', L('Vardag', 'Weekday'))}${f('helg', L('Helg', 'Weekend'))}</div>
    ${S.data.recipes.length === 0
      ? `<div class="empty"><h2>${L('Kokboken är tom', 'The cookbook is empty')}</h2><p>${L('Be souschefen om ett recept och tryck på <strong>Spara i kokboken</strong>. Betyg och anteckningar hjälper souschefen att lära sig vad ni gillar.', 'Ask the sous-chef for a recipe and tap <strong>Save to cookbook</strong>. Ratings and notes help the sous-chef learn what you like.')}</p><button class="btn" data-go="home">${L('Till start', 'To start')}</button></div>`
      : list.length ? `<div class="book-list">${list.map(bookRow).join('')}</div>` : `<p class="muted">${L('Inget i kokboken matchar.', 'Nothing in the cookbook matches.')}</p>`}
  </section>`;
}

/* Inställningarna: en lista med hopfällda sektioner. Varje rad visar vad som är valt. */
function secSummary(key) {
  const P = S.data.prefs, s = S.settings;
  const list = (a, none) => a.length ? a.map(tv).join(', ') : none;
  const lab = (opts, k) => k ? tv((opts.find(x => x[0] === k) || [, ''])[1]) : '';
  switch (key) {
    case 'household': return L(`${P.portions} portioner`, `${P.portions} servings`) + (P.bigEaters ? L(', rejäla', ', generous') : '') + (P.allergies.trim() ? `. ${L('Allergier', 'Allergies')}: ${P.allergies.trim()}` : '');
    case 'days': return `${L('Vardag', 'Weekday')} ${timeLabel(P.weekdayTime)}, ${L('helg', 'weekend')} ${timeLabel(P.weekendTime)}`;
    case 'health': return P.healthNote.trim() ? (P.healthWho.trim() ? `${P.healthWho.trim()}: ` : '') + P.healthNote.trim() : L('Inget mål', 'No goal');
    case 'cuisines': return list(P.cuisines, L('Alla kök', 'All cuisines'));
    case 'equipment': return list([...P.equipment, ...P.customEquipment], L('Vanligt kök', 'Regular kitchen'));
    case 'bread': { const b = [...P.breadLeaven.map(tv), lab(BREAD_OPT.proof, P.breadProof), lab(BREAD_OPT.knead, P.breadKnead), lab(BREAD_OPT.hydration, P.breadHydration), ...P.breadFlour.map(tv), ...P.breadBake.map(tv)].filter(Boolean);
      return b.length ? b.join(', ') : L('Efter receptet', 'Follow the recipe'); }
    case 'memory': { const n = S.data.memory.filter(m => !m.deleted).length;
      return n ? L(`${n} ${n === 1 ? 'sak' : 'saker'}`, `${n} ${n === 1 ? 'thing' : 'things'}`) : L('Inget ännu', 'Nothing yet'); }
    case 'account': {
      if (window.Cloud?.configured()) { const u = Cloud.state.user, k = Cloud.geminiKey(); return (u?.email || L('Inte inloggad', 'Not signed in')) + (k ? '' : L('. Ingen nyckel ännu', '. No key yet')); }
      return s[s.provider === 'claude' ? 'claudeKey' : 'geminiKey'] ? L('Nyckel sparad', 'Key saved') : L('Ingen nyckel ännu', 'No key yet'); }
    case 'advanced': return `${s.provider === 'claude' ? 'Claude' : 'Gemini'}, ${L('tema', 'theme')} ${({ auto: L('som enheten', 'match device'), light: L('ljust', 'light'), dark: L('mörkt', 'dark') })[s.theme] || ''}`;
  }
  return '';
}
function refreshSummaries() { document.querySelectorAll('[data-sum]').forEach(el => { el.textContent = secSummary(el.dataset.sum); }); }
function sec(key, title, body) {
  const open = (S.openSecs ||= new Set()).has(key);
  return `<details class="set-sec" data-sec="${key}"${open ? ' open' : ''}>
      <summary><span class="ss-title">${title}</span><span class="ss-sum" data-sum="${key}">${esc(secSummary(key))}</span></summary>
      <div class="ss-body">${body}</div></details>`;
}
function prefsSections() {
  const P = S.data.prefs;
  const chip = (key, val, label = tv(val)) => `<button type="button" class="chip opt" data-ptoggle="${key}" data-val="${esc(val)}" aria-pressed="${P[key].includes(val)}">${esc(label)}</button>`;
  const seg = (key, opts) => `<div class="seg" role="group">${opts.map(([k, l]) => `<button type="button" data-pset="${key}" data-val="${k}" aria-pressed="${P[key] === k}">${k === 'lang' ? L('Eftermiddag', 'Afternoon') : tv(l)}</button>`).join('')}</div>`;
  const sel = (key, label, opts) => `<div class="field"><label for="${key}">${label}</label><select id="${key}" data-psel="${key}">${opts.map(([k, l]) => `<option value="${k}"${P[key] === k ? ' selected' : ''}>${esc(tv(l))}</option>`).join('')}</select></div>`;
  const groups = (gs, render) => gs.map(([g, list]) => `<div class="opt-group"><h3>${esc(tv(g))}</h3><div class="chips">${list.map(render).join('')}</div></div>`).join('');
  return [
    sec('household', L('Hushållet', 'Household'), `
      <div class="field"><label>${L('Portioner', 'Servings')}</label>
        <div class="row"><div class="stepper"><button type="button" data-portions="-1" aria-label="${L('Färre portioner', 'Fewer servings')}">−</button><output>${P.portions}</output><button type="button" data-portions="1" aria-label="${L('Fler portioner', 'More servings')}">+</button></div>
        <button type="button" class="chip opt" data-pbool="bigEaters" aria-pressed="${P.bigEaters}">${L('Vi äter mycket', 'We eat a lot')}</button></div></div>
      <div class="field"><label for="allergies">${L('Allergier och äter inte', 'Allergies and foods to avoid')}</label><input id="allergies" data-ptext="allergies" value="${esc(P.allergies)}" placeholder="${L('T.ex. nötter, koriander', 'E.g. nuts, coriander')}"><span class="hint">${L('Souschefen bryter aldrig mot det här.', 'The sous-chef never breaks this.')}</span></div>
      <div class="field"><label for="profile">${L('Om familjen', 'About the family')}</label><textarea id="profile" data-ptext="profile" rows="3" class="short">${esc(S.data.profile)}</textarea></div>`),
    sec('days', L('Vardag och helg', 'Weekdays and weekends'), `
      <div class="day-grid">
        <div><h3>${L('Vardag', 'Weekday')} <span class="muted">${L('mån–tor', 'Mon–Thu')}</span></h3>
          <div class="field"><label>${L('Tidsram', 'Time frame')}</label>${seg('weekdayTime', TIMES.slice(0, 3))}</div>
          <div class="field"><label for="dinnerWeekday">${L('Middag serveras', 'Dinner is served')}</label><input type="time" id="dinnerWeekday" data-ptext="dinnerWeekday" value="${esc(P.dinnerWeekday)}"></div></div>
        <div><h3>${L('Helg', 'Weekend')} <span class="muted">${L('fre–sön', 'Fri–Sun')}</span></h3>
          <div class="field"><label>${L('Tidsram', 'Time frame')}</label>${seg('weekendTime', TIMES.slice(3))}</div>
          <div class="field"><label for="dinnerWeekend">${L('Middag serveras', 'Dinner is served')}</label><input type="time" id="dinnerWeekend" data-ptext="dinnerWeekend" value="${esc(P.dinnerWeekend)}"></div>
          <button type="button" class="chip opt" data-pbool="weekendGear" aria-pressed="${P.weekendGear}">${L('Använd specialutrustning', 'Use special equipment')}</button></div>
      </div>`),
    sec('health', L('Hälsomål', 'Health goal'), `
      <div class="field"><label for="healthWho">${L('Gäller', 'Applies to')}</label><input id="healthWho" data-ptext="healthWho" value="${esc(P.healthWho)}" placeholder="${L('T.ex. Pappa, alla', 'E.g. Dad, everyone')}"></div>
      <div class="field"><label for="healthNote">${L('Målet med egna ord', 'The goal in your own words')}</label><textarea id="healthNote" data-ptext="healthNote" rows="3" class="short">${esc(P.healthNote)}</textarea></div>
      <button type="button" class="chip opt" data-pbool="healthyAlt" aria-pressed="${P.healthyAlt}">${L('Avsluta receptet med ett lättare alternativ', 'End the recipe with a lighter option')}</button>`),
    sec('cuisines', L('Favoritländer', 'Favourite countries'), groups(OPT.cuisines, ([cc, name]) => `<button type="button" class="chip opt flagchip" data-ptoggle="cuisines" data-val="${esc(name)}" aria-pressed="${P.cuisines.includes(name)}">${flags({ countries: [cc] })}${esc(tv(name))}</button>`)),
    sec('equipment', L('Specialutrustning', 'Special equipment'), `
      <p class="hint ss-lead">${L('Utöver spis, ugn, stekpannor, kastruller och stavmixer.', 'Beyond hob, oven, pans, saucepans and a stick blender.')}</p>
      ${groups(OPT.equipment, v => chip('equipment', v))}
      ${P.customEquipment.length ? `<div class="chips">${P.customEquipment.map(v => `<button type="button" class="chip opt" data-premove="${esc(v)}" aria-pressed="true" title="${L('Tryck för att ta bort', 'Tap to remove')}">${esc(v)} ×</button>`).join('')}</div>` : ''}
      <div class="add-row"><input id="equipNew" placeholder="${L('Lägg till egen, t.ex. Plancha', 'Add your own, e.g. Plancha')}" aria-label="${L('Egen utrustning', 'Your own equipment')}"><button class="ghost" data-equipadd>${L('Lägg till', 'Add')}</button></div>`),
    sec('bread', L('Bakning av bröd', 'Bread baking'), `
      <p class="hint ss-lead">${L('Det ni lämnar tomt väljer souschefen efter receptet.', 'Whatever you leave empty, the sous-chef picks to suit the recipe.')}</p>
      <div class="opt-group"><h3>${L('Jäsmedel', 'Leavening')}</h3><div class="chips">${BREAD_OPT.leaven.map(v => chip('breadLeaven', v)).join('')}<button type="button" class="chip opt" data-pbool="breadStarter" aria-pressed="${P.breadStarter}">${L('Levande surdegsgrund', 'Live sourdough starter')}</button></div></div>
      <div class="sel-grid">${sel('breadProof', L('Jäsning', 'Proofing'), BREAD_OPT.proof)}${sel('breadKnead', L('Knådning', 'Kneading'), BREAD_OPT.knead)}${sel('breadHydration', L('Degens fuktighet', 'Dough hydration'), BREAD_OPT.hydration)}</div>
      <div class="opt-group"><h3>${L('Mjöl vi gillar', 'Flours we like')}</h3><div class="chips">${BREAD_OPT.flour.map(v => chip('breadFlour', v)).join('')}</div></div>
      <div class="opt-group"><h3>${L('Gräddning', 'Baking')}</h3><div class="chips">${BREAD_OPT.bake.map(v => chip('breadBake', v)).join('')}</div></div>
      <div class="field"><label for="breadNote">${L('Övrigt om bakning', 'More about baking')}</label><textarea id="breadNote" data-ptext="breadNote" rows="2" class="short" placeholder="${L('T.ex. gärna frön, ljus skorpa', 'E.g. seeds welcome, light crust')}">${esc(P.breadNote)}</textarea></div>`),
  ].join('');
}

/* ============ Introduktion för nya familjer ============ */
const W_STEPS = ['Välkommen', 'Nyckel', 'Hushållet', 'Vardag och helg', 'Smak', 'Hälsa', 'Utrustning', 'Klart'];
function viewWelcome() {
  const k = S.wStep || 0, P = S.data.prefs, s = S.settings;
  const seg = (key, opts) => `<div class="seg wrap" role="group">${opts.map(([v, l]) => `<button type="button" data-pset="${key}" data-val="${v}" aria-pressed="${P[key] === v}">${tv(l)}</button>`).join('')}</div>`;
  const chip = (key, val, label = tv(val)) => `<button type="button" class="chip opt" data-ptoggle="${key}" data-val="${esc(val)}" aria-pressed="${P[key].includes(val)}">${label}</button>`;
  let body = '';
  if (k === 0) body = `
    <h1>${L(`Välkommen till Souschefen`, `Welcome to Souschefen`)}</h1>
    <p class="w-lead">${L(`Berätta vad ni har hemma, eller fota kylen, så föreslår souschefen middagar och skriver receptet efter er familj. Under matlagningen kan ni ställa frågor, och era favoriter sparas i kokboken.`, `Tell the sous-chef what you have at home, or take a photo of the fridge, and get dinner ideas with recipes written for your family. Ask questions while you cook, and keep your favourites in the cookbook.`)}</p>
    <p>${L('Det tar ungefär fem minuter att komma igång. Allt kan ändras senare under Inställningar.', 'Getting started takes about five minutes. You can change everything later under Settings.')}</p>
    <div class="field"><label>Språk / Language</label>${langPicker()}</div>
    ${window.Cloud?.configured() ? '' : `<p class="hint">${L('Har ni redan Souschefen på en annan enhet? Öppna i stället länken från <em>Inställningar → Koppling → Kopiera länk till annan enhet</em> där.', 'Already have Souschefen on another device? Open the link from <em>Settings → Connection → Copy link to another device</em> there instead.')}</p>`}`;
  else if (k === 1) body = `
    <h1>${L(`Koppla souschefen`, `Connect the sous-chef`)}</h1>
    <p class="w-lead">${L(`Souschefen använder Googles AI Gemini. Ni behöver en egen gratis nyckel, och det kostar inget.`, `The sous-chef uses Google's AI, Gemini. You need your own free key, and it costs nothing.`)}</p>
    <ol class="w-steps"><li>${L('Öppna', 'Open')} <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">aistudio.google.com/apikey</a> ${L('och logga in med ert Google-konto.', 'and sign in with your Google account.')}</li><li>${L('Tryck på <strong>Create API key</strong> och kopiera nyckeln.', 'Tap <strong>Create API key</strong> and copy the key.')}</li><li>${L('Klistra in den här:', 'Paste it here:')}</li></ol>
    <div class="field"><input id="geminiKey" type="password" autocomplete="off" value="${esc(s.geminiKey || (window.Cloud?.geminiKey() || ''))}" placeholder="${L('Klistra in nyckeln', 'Paste the key')}"></div>
    <div class="row"><button class="ghost" data-wtest>${L('Testa nyckeln', 'Test the key')}</button>${S.aiStatus ? `<strong class="status-line" style="display:inline">${esc(S.aiStatus)}</strong>` : ''}</div>
    <p class="hint">${window.Cloud?.active() ? L('Nyckeln sparas i familjens konto och gäller alla era enheter.', 'The key is saved in the family account and works on all your devices.') : L('Nyckeln sparas bara på den här enheten.', 'The key is saved only on this device.')} ${L('På gratisnivån får Google använda frågorna för att förbättra sina tjänster.', 'On the free tier, Google may use your questions to improve its services.')}</p>`;
  else if (k === 2) body = `
    <h1>${L('Hushållet', 'Household')}</h1>
    <div class="field"><label>${L(`Hur många portioner lagar ni oftast?`, `How many servings do you usually cook?`)}</label>
      <div class="row"><div class="stepper"><button type="button" data-portions="-1" aria-label="${L('Färre', 'Fewer')}">−</button><output>${P.portions}</output><button type="button" data-portions="1" aria-label="${L('Fler', 'More')}">+</button></div>
      <button type="button" class="chip opt" data-pbool="bigEaters" aria-pressed="${P.bigEaters}">${L('Vi äter mycket – räkna rejält', 'We eat a lot – be generous')}</button></div></div>
    <div class="field"><label for="profile">${L(`Berätta kort om er`, `Tell us briefly about yourselves`)}</label><textarea id="profile" data-ptext="profile" rows="3" placeholder="${L('T.ex. två vuxna och två tonåringar. Vana i köket, gillar starkt. Handlar på ICA.', 'E.g. two adults and two teenagers. Experienced cooks, like it spicy. Shop at ICA.')}">${esc(S.data.profile)}</textarea></div>
    <div class="field"><label for="allergies">${L(`Allergier och sådant någon inte äter`, `Allergies and foods someone avoids`)}</label><input id="allergies" data-ptext="allergies" value="${esc(P.allergies)}" placeholder="${L('T.ex. nötter, koriander, inga svampar', 'E.g. nuts, coriander, no mushrooms')}"><span class="hint">${L(`Souschefen bryter aldrig mot det här.`, `The sous-chef never breaks this.`)}</span></div>`;
  else if (k === 3) body = `
    <h1>${L('Vardag och helg', 'Weekdays and weekends')}</h1>
    <p class="w-lead">${L(`Hur mycket tid har ni för matlagningen? Appen väljer vardag eller helg efter veckodagen, och ni kan ändra det för stunden uppe till höger.`, `How much time do you have for cooking? The app picks weekday or weekend by the day of the week, and you can change it for now at the top right.`)}</p>
    <div class="day-cols">
      <div class="day-col"><h3>${L('Vardag', 'Weekday')} <span class="muted">${L('mån–tor', 'Mon–Thu')}</span></h3>${seg('weekdayTime', TIMES.slice(0, 3))}<div style="margin-top:10px"><div class="field"><label for="dinnerWeekday">${L(`Middag serveras`, `Dinner is served`)}</label><input type="time" id="dinnerWeekday" data-ptext="dinnerWeekday" value="${esc(P.dinnerWeekday)}" class="time-input"></div></div></div>
      <div class="day-col"><h3>${L('Helg', 'Weekend')} <span class="muted">${L('fre–sön', 'Fri–Sun')}</span></h3>${seg('weekendTime', TIMES.slice(3))}<div style="margin-top:10px"><div class="field"><label for="dinnerWeekend">${L(`Middag serveras`, `Dinner is served`)}</label><input type="time" id="dinnerWeekend" data-ptext="dinnerWeekend" value="${esc(P.dinnerWeekend)}" class="time-input"></div></div>
        <div style="margin-top:10px"><button type="button" class="chip opt" data-pbool="weekendGear" aria-pressed="${P.weekendGear}">${L(`Använd gärna specialutrustning på helgen`, `Feel free to use special equipment at weekends`)}</button></div></div>
    </div>`;
  else if (k === 4) body = `
    <h1>${L(`Vilken mat gillar ni?`, `What food do you like?`)}</h1>
    <p class="w-lead">${L(`Välj de länders kök ni tycker om. Förslagen sprids över dem.`, `Choose the countries whose cuisines you like. Suggestions are spread across them.`)}</p>
    ${OPT.cuisines.map(([reg, list]) => `<div class="opt-group"><h3>${esc(tv(reg))}</h3><div class="chips">${list.map(([cc, name]) => `<button type="button" class="chip opt flagchip" data-ptoggle="cuisines" data-val="${esc(name)}" aria-pressed="${P.cuisines.includes(name)}">${flags({ countries: [cc] })}${esc(tv(name))}</button>`).join('')}</div></div>`).join('')}`;
  else if (k === 5) body = `
    <h1>${L('Hälsa', 'Health')} <span class="muted" style="font-size:.5em">${L('valfritt', 'optional')}</span></h1>
    <p class="w-lead">${L(`Har någon i familjen ett mål med maten? Då anpassar souschefen recepten och föreslår ett lättare alternativ.`, `Does someone in the family have a food goal? The sous-chef will then adapt recipes and suggest a lighter option.`)}</p>
    <div class="field"><label for="healthWho">${L('Gäller', 'Applies to')}</label><input id="healthWho" data-ptext="healthWho" value="${esc(P.healthWho)}" placeholder="${L('T.ex. Pappa, alla – lämna tomt om inget', 'E.g. Dad, everyone – leave empty if none')}"></div>
    <div class="field"><label for="healthNote">${L(`Målet med egna ord`, `The goal in your own words`)}</label><textarea id="healthNote" data-ptext="healthNote" rows="3" placeholder="${L('T.ex. mer protein, mindre socker, gå ner lite i vikt men maten ska vara god', 'E.g. more protein, less sugar, lose a little weight but the food must taste good')}">${esc(P.healthNote)}</textarea></div>
    <button type="button" class="chip opt" data-pbool="healthyAlt" aria-pressed="${P.healthyAlt}">${L(`Avsluta alltid receptet med ett lättare alternativ`, `Always end the recipe with a lighter option`)}</button>`;
  else if (k === 6) body = `
    <h1>${L('Specialutrustning', 'Special equipment')}</h1>
    <p class="w-lead">${L(`Bocka i det ni har utöver ett vanligt kök. Spis, ugn, stekpannor, kastruller och stavmixer räknas alltid med.`, `Tick what you have beyond a regular kitchen. Hob, oven, frying pans, saucepans and a stick blender are always included.`)}</p>
    ${OPT.equipment.map(([grp, list]) => `<div class="opt-group"><h3>${esc(tv(grp))}</h3><div class="chips">${list.map(v => chip('equipment', v)).join('')}</div></div>`).join('')}`;
  else body = `
    <h1>${L('Klart!', 'All set!')}</h1>
    <p class="w-lead">${L(`Souschefen är redo. Skriv vad ni har hemma, fota kylen eller välj ett av snabbvalen på startsidan.`, `The sous-chef is ready. Write what you have at home, take a photo of the fridge or pick one of the quick options on the home page.`)}</p>
    <ul class="w-tips"><li>${L('<strong>Fråga souschefen</strong> finns i kanten. Där kan ni ställa frågor medan ni lagar och be om ändringar i receptet.', '<strong>Ask the sous-chef</strong> sits at the edge of the screen. Ask questions while you cook and request changes to the recipe.')}</li>
    <li>${L('Spara favoriter i <strong>Kokboken</strong> och ge dem betyg. Souschefen lär sig vad ni gillar.', 'Save favourites in the <strong>Cookbook</strong> and rate them. The sous-chef learns what you like.')}</li>
    <li>${L('Lägg appen på hemskärmen via webbläsarens meny.', 'Add the app to your home screen from the browser menu.')}</li>
    <li>${L('Vill flera i familjen dela kokboken mellan mobiler: se <em>Inställningar → Koppling</em>.', 'To share the cookbook between phones in the family, see <em>Settings → Connection</em>.')}</li></ul>`;
  const last = W_STEPS.length - 1;
  return `<section class="welcome">
    <div class="w-progress" aria-label="${L(`Steg ${k + 1} av ${W_STEPS.length}`, `Step ${k + 1} of ${W_STEPS.length}`)}">${W_STEPS.map((n, i) => `<span class="${i < k ? 'done' : i === k ? 'on' : ''}" title="${tv(n)}"></span>`).join('')}</div>
    <div class="w-card">${body}</div>
    <div class="w-nav">
      ${k > 0 ? `<button class="ghost" data-wnav="-1">${L('Tillbaka', 'Back')}</button>` : '<span></span>'}
      ${k === 0 ? `<button class="linkish" data-wskip>${L('Hoppa över', 'Skip')}</button>` : ''}
      <button class="btn" data-wnav="1">${k === 0 ? L('Kom igång', 'Get started') : k === last ? L('Börja laga mat', 'Start cooking') : k === 1 && !s.geminiKey ? L('Gör senare', 'Do it later') : L('Nästa', 'Next')}</button>
    </div>
  </section>`;
}
function finishWelcome() {
  S.settings.onboarded = true; saveSettings(); S.wStep = 0;
  S.data.textUpdatedAt = now(); saveData();
  go('home');
}

function viewSettings() {
  const s = S.settings, p = s.provider;
  const mem = S.data.memory.filter(m => !m.deleted);
  const keyField = p === 'claude' ? 'claudeKey' : 'geminiKey';
  const ai = S.aiStatus || (s[keyField] ? '' : L('Ingen nyckel ännu', 'No key yet'));
  const sync = !s.ghToken ? L('Av – kokboken finns bara på den här enheten', 'Off – the cookbook is only on this device') : (S.sync.state === 'Synkad' ? `✓ ${L('På', 'On')} – ${$('#sync').title || tv('Synkad').toLowerCase()}` : tv(S.sync.state) || L('Kopplar…', 'Connecting…'));
  const connection = `
      <p class="hint ss-lead">${L('Görs en gång per enhet. Nycklarna sparas bara i webbläsaren.', 'Done once per device. Keys are saved only in the browser.')}</p>
      <div class="field"><label for="${keyField}">${p === 'claude' ? L('Claude-nyckel', 'Claude key') : L('Gemini-nyckel (gratis)', 'Gemini key (free)')}</label>
        <input id="${keyField}" type="password" autocomplete="off" value="${esc(s[keyField])}" placeholder="${L('Klistra in nyckeln', 'Paste the key')}">
        <span class="hint">${p === 'claude' ? L('Från', 'From') + ' <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener">console.anthropic.com</a>.' : L('Hämtas på', 'Get it at') + ' <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">aistudio.google.com/apikey</a>.'}${ai ? ` <strong class="status-line">${esc(ai)}</strong>` : ''}</span></div>
      <div class="field"><label for="ghToken">${L('GitHub-token för att dela kokboken', 'GitHub token to share the cookbook')} <span class="muted">(${L('valfritt', 'optional')})</span></label>
        <input id="ghToken" type="password" autocomplete="off" value="${esc(s.ghToken)}" placeholder="ghp_…">
        <span class="hint"><a href="https://github.com/settings/tokens/new?scopes=gist&description=Souschefen" target="_blank" rel="noopener">${L('Skapa token', 'Create token')}</a> (${L('bara behörigheten', 'only the permission')} "gist"). <strong class="status-line">${esc(sync)}</strong></span></div>
      <div class="row"><button class="btn" data-connect>${L('Spara och testa', 'Save and test')}</button>
        ${s[keyField] ? `<button class="ghost" data-sharelink>${L('Kopiera länk till annan enhet', 'Copy link to another device')}</button>` : ''}</div>
      ${s[keyField] ? `<p class="hint" style="margin:10px 0 0">${L('Länken innehåller nycklarna. Skicka den bara till er själva.', 'The link contains your keys. Only send it to yourselves.')}</p>` : ''}`;
  const advanced = `
      <div class="field"><label>${L('Tema', 'Theme')}</label><div class="seg" role="group">${[['auto', L('Som enheten', 'Match device')], ['light', L('Ljust', 'Light')], ['dark', L('Mörkt', 'Dark')]].map(([k, l]) => `<button type="button" data-theme="${k}" aria-pressed="${s.theme === k}">${l}</button>`).join('')}</div></div>
      <div class="field"><label>${L('AI-tjänst', 'AI service')}</label>
        <div class="seg" role="group"><button type="button" data-prov="gemini" aria-pressed="${p === 'gemini'}">Google Gemini</button><button type="button" data-prov="claude" aria-pressed="${p === 'claude'}">Anthropic Claude</button></div></div>
      <div class="field"><label for="${p === 'claude' ? 'claudeModel' : 'geminiModel'}">${L('Modell', 'Model')}</label><input id="${p === 'claude' ? 'claudeModel' : 'geminiModel'}" value="${esc(p === 'claude' ? s.claudeModel : s.geminiModel)}">
        <span class="hint">${L('Standard', 'Default')}: ${DEFAULT_MODELS[p]}.${p === 'gemini' ? L(' Är modellen upptagen provar appen andra gratismodeller automatiskt.', ' If the model is busy, the app tries other free models automatically.') : ''}</span></div>
      <div class="field"><label for="gistId">${L('Gist-id för delad kokbok', 'Gist ID for shared cookbook')}</label><input id="gistId" value="${esc(s.gistId)}" placeholder="${L('Hittas eller skapas automatiskt', 'Found or created automatically')}"></div>
      <div class="row" style="margin-bottom:18px"><button class="ghost" data-savekeys>${L('Spara', 'Save')}</button>${s.gistId ? `<button class="ghost" data-syncnow>${L('Synka nu', 'Sync now')}</button>` : ''}</div>
      <div class="row"><button class="ghost" data-showwelcome>${L('Visa introduktionen igen', 'Show the introduction again')}</button>
        <button class="ghost" data-export>${L('Ladda ner säkerhetskopia', 'Download backup')}</button>
        <label class="ghost">${L('Läs in säkerhetskopia', 'Restore backup')}<input type="file" accept="application/json" id="importFile" hidden></label></div>`;
  return `<section class="settings">
    <h1>${L('Inställningar', 'Settings')}</h1>
    <h2 class="set-group">${L('Matlagning', 'Cooking')}</h2>
    <div class="set-list">
      ${prefsSections()}
      ${sec('memory', L('Smakminne', 'Taste memory'), `
      <p class="hint ss-lead">${L('Det souschefen lärt sig av era samtal.', 'What the sous-chef has learned from your conversations.')}</p>
      ${mem.length ? `<ul class="memory-list">${mem.map(m => `<li><span>${esc(m.text)}</span><button class="ghost small" data-forget="${m.id}">${L('Ta bort', 'Remove')}</button></li>`).join('')}</ul>` : ''}
      <div class="add-row"><input id="memNew" placeholder="${L('T.ex. Vi älskar sambal', 'E.g. We love sambal')}" aria-label="${L('Ny sak att minnas', 'New thing to remember')}"><button class="ghost" data-memadd>${L('Lägg till', 'Add')}</button></div>`)}
    </div>
    <h2 class="set-group">${L('App och konto', 'App and account')}</h2>
    <div class="set-list">
      <div class="set-row"><span class="ss-title">Språk / Language</span>${langPicker()}</div>
      ${sec('account', window.Cloud?.configured() ? L('Konto och familj', 'Account and family') : L('Koppling', 'Connection'), window.Cloud?.configured() ? Cloud.accountCard() : connection)}
      ${sec('advanced', L('Avancerat', 'Advanced'), advanced)}
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
      let q = (v || '').trim();
      const link = (q.match(/https?:\/\/[^\s]+/) || [])[0];
      if (link) q = L(`Renskriv receptet från länken: ${link}`, `Clean up the recipe from this link: ${link}`) + (q.replace(link, '').trim() ? L(`\nÖnskemål: `, `\nRequests: `) + q.replace(link, '').trim() : '');
      else if (q.length > 250 && q.split('\n').length > 4) q = L(`Renskriv det här receptet:\n${q}`, `Clean up this recipe:\n${q}`);
      send(q || (img ? L('Det här har vi hemma. Ge förslag.', 'This is what we have at home. Give suggestions.') : ''), img, { flow: true });
    };
    const updAsk = () => {
      const v = $('#homeInput').value, isLink = /https?:\/\/\S+/.test(v), isPaste = v.length > 250 && v.split('\n').length > 4;
      $('#askBtn').textContent = isLink || isPaste ? L('Renskriv receptet', 'Clean up the recipe') : L('Ge oss förslag', 'Give us suggestions');
      const lh = isLink ? (() => { try { return new URL(v.match(/https?:\/\/\S+/)[0]).hostname.replace(/^www\./, ''); } catch { return L('webben', 'the web'); } })() : '';
      $('#askHint').hidden = !(isLink || isPaste);
      $('#askHint').textContent = isLink ? L(`🔗 Länk från ${lh} – receptet renskrivs troget med era portioner`, `🔗 Link from ${lh} – the recipe is cleaned up faithfully with your servings`) : isPaste ? L('📋 Recepttext – renskrivs med era portioner', '📋 Recipe text – cleaned up with your servings') : L('🔗 Klistra in en receptlänk så renskrivs receptet med era portioner', '🔗 Paste a recipe link to have it cleaned up with your servings');
    };
    $('#homeInput').addEventListener('input', updAsk);
    $('#homeInput').onkeydown = e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) homeAsk.requestSubmit(); };
    $('#homeFile').onchange = async e => {
      const f = e.target.files[0]; if (!f) return;
      S.homeAttach = await fileToImage(f);
      const el = $('#homeAttach'); el.hidden = false; el.innerHTML = `<img src="${S.homeAttach.url}" alt=""><span>${L('Foto bifogat', 'Photo attached')}</span>`;
    };
  }
  const search = $('#bookSearch', st);
  if (search) search.oninput = e => { S.bookQuery = e.target.value; const pos = e.target.selectionStart; renderStage(); const n = $('#bookSearch'); n.focus(); n.setSelectionRange(pos, pos); };
  const notes = $('#notes', st);
  if (notes) notes.oninput = debounce(e => { const r = savedRecipe(); if (r) { r.notes = e.target.value; touch(r); saveData(); } }, 600);
  st.querySelectorAll('[data-ptext]').forEach(el => {
    el.oninput = debounce(() => { const k = el.dataset.ptext; if (k === 'profile') S.data.profile = el.value; else S.data.prefs[k] = el.value; prefsChanged(true); }, 500);
  });
  st.querySelectorAll('[data-psel]').forEach(el => { el.onchange = () => { S.data.prefs[el.dataset.psel] = el.value; prefsChanged(); }; });
  const imp = $('#importFile', st);
  if (imp) imp.onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    try { const d = JSON.parse(await f.text()); mergeData(d); saveData(); toast(L('Säkerhetskopian är inläst', 'The backup is restored')); renderStage(); }
    catch { toast(L('Filen kunde inte läsas som en kokbok', 'The file could not be read as a cookbook')); }
  };
}
$('#stage').addEventListener('toggle', e => {
  const d = e.target;
  if (d.matches && d.matches('details[data-sec]')) { (S.openSecs ||= new Set())[d.open ? 'add' : 'delete'](d.dataset.sec); }
}, true);
const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
const savedRecipe = () => S.current.recipeSavedId && S.data.recipes.find(x => x.id === S.current.recipeSavedId);
const touch = r => { r.updatedAt = now(); };

$('#stage').addEventListener('click', async e => {
  const t = e.target;
  const lg = t.closest('[data-lang]');
  if (lg) { setLang(lg.dataset.lang); return; }
  const q = t.closest('[data-quick]');
  if (q) { send(q.dataset.quick, null, { flow: true }); return; }
  const pick = t.closest('[data-pick]');
  if (pick) { const s = S.current.suggestions[+pick.dataset.pick]; send(L(`Ge mig det kompletta receptet på ${s.name}.`, `Give me the complete recipe for ${s.name}.`), null, { flow: true }); return; }
  if (t.closest('[data-more]')) { send(L('Ge mig fler förslag, gärna åt ett annat håll.', 'Give me more suggestions, ideally in a different direction.'), null, { flow: true }); return; }

  // Recept
  const chk = t.closest('[data-check]');
  if (chk) { S.checked[chk.dataset.check] = chk.checked; const row = chk.closest('.ing'); row.classList.toggle('checked', chk.checked); updateCount(); saveSession(); return; }
  const wn = t.closest('[data-wnav]');
  if (wn) {
    if ((S.wStep || 0) === 1) { const el = document.getElementById('geminiKey'); if (el) { S.settings.geminiKey = el.value.trim(); saveSettings(); if (window.Cloud?.active() && S.settings.geminiKey) Cloud.saveKey(S.settings.geminiKey); } }
    const next = (S.wStep || 0) + +wn.dataset.wnav;
    if (next >= W_STEPS.length) { finishWelcome(); return; }
    S.wStep = Math.max(0, next); renderStage(); $('#stage').scrollTop = 0; return;
  }
  if (t.closest('[data-wskip]')) { finishWelcome(); return; }
  if (t.closest('[data-wtest]')) { const el = document.getElementById('geminiKey'); S.settings.geminiKey = el.value.trim(); saveSettings(); if (window.Cloud?.active() && S.settings.geminiKey) Cloud.saveKey(S.settings.geminiKey); S.aiStatus = L('Testar…', 'Testing…'); renderStage(); testAI().then(r => { S.aiStatus = r; if (S.route.view === 'welcome') renderStage(); }); return; }
  if (t.closest('[data-showwelcome]')) { S.wStep = 0; go('welcome'); return; }
  const rp = t.closest('[data-rport]');
  if (rp) { const r = S.current.recipe; const n = Math.max(1, Math.min(24, portionsFor(r) + +rp.dataset.rport)); S.portions = { title: r.title, n }; keepScroll(renderStage); saveSession(); return; }
  if (t.closest('[data-resume]')) { const ss = otherSession(); if (ss) { applySession(ss); go('recipe'); renderChat(true); saveSession(); } return; }
  if (t.closest('[data-endsession]')) { if (S.data.session) { S.data.session.ended = true; S.data.session.updatedAt = now(); saveData(); } renderStage(); return; }
  const oh = t.closest('[data-hist]');
  if (oh) { const h = (S.data.history || []).find(x => x.id === oh.dataset.hist); if (h) { const saved = h.savedId && S.data.recipes.find(x => x.id === h.savedId); S.current.recipe = JSON.parse(JSON.stringify(saved || h.recipe)); S.current.recipeSavedId = saved ? saved.id : null; S.current.dirty = false; S.checked = {}; S.doneSteps = {}; S.activeStep = null; S.portions = null; if (joinIfActive(S.current.recipe)) { go('recipe'); renderChat(true); return; } newSession(); S.chat = []; saveChat(); saveCurrent(); go('recipe'); addHistory(S.current.recipe, S.current.recipeSavedId); saveSession(); } return; }
  const jump = t.closest('[data-jump]');
  if (jump) { scrollToSec(jump.dataset.jump); return; }
  if (t.closest('[data-startcook]')) { if (S.activeStep == null) S.activeStep = 0; if (!S.cookStart) S.cookStart = Date.now(); refreshSteps(); scrollToSec('r-steps'); saveSession(); return; }
  const tm = t.closest('[data-timer]');
  if (tm) { const s = S.current.recipe.steps[+tm.dataset.timer]; startTimer(L(`Steg ${+tm.dataset.timer + 1}`, `Step ${+tm.dataset.timer + 1}`), s.minutes); return; }
  const dn = t.closest('[data-done]');
  if (dn) { const n = +dn.dataset.done; S.doneSteps[n] = !S.doneSteps[n]; if (S.doneSteps[n] && S.activeStep === n) S.activeStep = n + 1 < S.current.recipe.steps.length ? n + 1 : null; refreshSteps(); saveSession(); return; }
  const step = t.closest('[data-step]');
  if (step && !t.closest('button')) { const n = +step.dataset.step; S.activeStep = S.activeStep === n ? null : n; if (!S.cookStart) S.cookStart = Date.now(); refreshSteps(); saveSession(); return; }
  if (t.closest('[data-save]')) { saveRecipe(); return; }
  if (t.closest('[data-cooked]')) { const r = savedRecipe(); r.cooked = [...(r.cooked || []), now()]; touch(r); saveData(); toast(L('Antecknat! Sätt gärna betyg och skriv vad som blev bra.', 'Noted! Add a rating and write what went well.')); renderStage(); const n = $('#notes'); if (n) n.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
  const rate = t.closest('[data-rate]');
  if (rate) { const r = savedRecipe(); r.rating = r.rating === +rate.dataset.rate ? 0 : +rate.dataset.rate; touch(r); saveData(); const sc = $('#stage').scrollTop; renderStage(); $('#stage').scrollTop = sc; return; }
  if (t.closest('[data-delete]')) {
    const r = savedRecipe();
    if (r && confirm(L(`Ta bort "${r.title}" ur kokboken?`, `Remove "${r.title}" from the cookbook?`))) {
      S.data.recipes = S.data.recipes.filter(x => x.id !== r.id); S.data.deleted[r.id] = now();
      S.current.recipeSavedId = null; saveData(); saveCurrent(); toast(L('Borttagen ur kokboken', 'Removed from the cookbook')); go('book');
    }
    return;
  }

  // Kokboken
  const op = t.closest('[data-open]');
  if (op) {
    const r = S.data.recipes.find(x => x.id === op.dataset.open);
    if (r) { S.current.recipe = JSON.parse(JSON.stringify(r)); S.current.recipeSavedId = r.id; S.current.dirty = false; S.checked = {}; S.doneSteps = {}; S.activeStep = null; if (joinIfActive(r)) { S.current.recipeSavedId = r.id; go('recipe'); renderChat(true); return; } newSession(); saveCurrent(); go('recipe'); addHistory(r, r.id); saveSession(); }
    return;
  }
  const fl = t.closest('[data-filter]');
  if (fl) { S.bookFilter = fl.dataset.filter; renderStage(); return; }
  const bt = t.closest('[data-booktab]');
  if (bt) { S.bookTab = bt.dataset.booktab; renderStage(); return; }
  if (t.closest('[data-showhist]')) { S.bookTab = 'hist'; S.bookQuery = ''; go('book'); return; }

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
  if (t.closest('[data-status]')) { e.stopPropagation(); toggleStatusPop(true); return; }

  // Inställningar
  const prov = t.closest('[data-prov]');
  if (prov) { readKeyFields(); S.settings.provider = prov.dataset.prov; saveSettings(); renderStage(); return; }
  if (t.closest('[data-savekeys]')) { readKeyFields(); saveSettings(); toast(L('Sparat', 'Saved')); return; }
  if (t.closest('[data-connect]')) { readKeyFields(); readSyncFields(); saveSettings(); connectAll(); return; }
  if (t.closest('[data-testai]')) { readKeyFields(); saveSettings(); openChat(true); send(L('Snabbtest: svara med en mening om vad du kan hjälpa oss med ikväll.', 'Quick test: reply with one sentence about what you can help us with tonight.')); return; }
  if (t.closest('[data-savesync]')) { readSyncFields(); saveSettings(); toast(L('Sparat', 'Saved')); if (S.settings.gistId) syncNow(); return; }
  if (t.closest('[data-gistcreate]')) { readSyncFields(); saveSettings(); createGist(); return; }
  if (t.closest('[data-syncnow]')) { readSyncFields(); saveSettings(); syncNow(true); return; }
  if (t.closest('[data-sharelink]')) { readKeyFields(); readSyncFields(); saveSettings(); copyShareLink(); return; }
  if (t.closest('[data-saveinstr]')) { S.data.instructions = $('#instructions').value; S.data.textUpdatedAt = now(); saveData(); toast(L('Instruktionerna är sparade', 'The instructions are saved')); return; }
  if (t.closest('[data-resetinstr]')) { if (confirm(L('Återställ kockens instruktioner till originalet?', 'Reset the chef\'s instructions to the original?'))) { S.data.instructions = DEFAULT_INSTRUCTIONS; S.data.textUpdatedAt = now(); saveData(); renderStage(); toast(L('Återställt', 'Reset')); } return; }
  const fg = t.closest('[data-forget]');
  if (fg) { const m = S.data.memory.find(x => x.id === fg.dataset.forget); if (m) { m.deleted = true; m.updatedAt = now(); saveData(); renderStage(); } return; }
  if (t.closest('[data-memadd]')) { const v = $('#memNew').value.trim(); if (v) { S.data.memory.push({ id: uid(), text: v, at: now(), updatedAt: now() }); saveData(); renderStage(); } return; }
  const th = t.closest('[data-theme]');
  if (th) { S.settings.theme = th.dataset.theme; saveSettings(); applyTheme(); renderStage(); return; }
  if (t.closest('[data-export]')) {
    const blob = new Blob([JSON.stringify(S.data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `souschefen-kokbok-${new Date().toISOString().slice(0, 10)}.json`; a.click();
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
function keepScroll(fn) {
  const els = ['#stage', '#r-ing', '#r-steps'].map(q => [q, $(q)?.scrollTop || 0]);
  fn();
  els.forEach(([q, top]) => { const el = $(q); if (el) el.scrollTop = top; });
}
function scrollToSec(id) {
  const el = document.getElementById(id), st = $('#stage'), nav = $('.r-jump');
  if (!el) return;
  if (st.classList.contains('split')) { if (id === 'r-steps') { const a = el.querySelector('.step.active'); if (a) a.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } return; }
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
    const b = li.querySelector('[data-done]'); if (b) b.textContent = S.doneSteps[n] ? L('Ångra', 'Undo') : L('Klar', 'Done');
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
    toast(L('Ändringarna är sparade i kokboken', 'The changes are saved in the cookbook'));
  } else {
    const rec = { ...stripRecipe(r), id: uid(), savedAt: now(), updatedAt: now(), notes: '', rating: 0, cooked: [] };
    S.data.recipes.push(rec); S.current.recipeSavedId = rec.id;
    toast(L('Sparad i kokboken', 'Saved to the cookbook'));
  }
  S.current.dirty = false; saveData(); saveCurrent(); renderStage();
}

function prefsChanged(quiet) {
  S.data.textUpdatedAt = now(); saveData(); renderStatus();
  if (S.route.view === 'settings') refreshSummaries();
  if (!quiet) { clearTimeout(prefsChanged._t); prefsChanged._t = setTimeout(() => toast(L('Sparat', 'Saved')), 400); }
}

/* ============ Statusrad / snabbval ============ */
function statusLabel() {
  const d = dayInfo(), P = S.data.prefs, t = todayTime();
  const day = d.weekend ? L('Helg', 'Weekend') : L('Vardag', 'Weekday');
  return { short: `${day} · ${t.label}`, long: `${day}${d.manual ? '' : ' (auto)'} · ${t.label} · ${P.portions} ${L('port', 'serv')}` };
}
function renderStatus() {
  const b = $('#statusBtn'); if (!b) return;
  const l = statusLabel();
  b.innerHTML = `<span class="long">${esc(l.long)}</span><span class="short">${esc(l.short)}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>`;
  const pop = $('#statusPop');
  if (!pop.hidden) pop.innerHTML = statusPopHtml();
}
function statusPopHtml() {
  const P = S.data.prefs, m = dayMode(), d = dayInfo(), t = todayTime();
  return `<div class="field"><label>${L('Idag är det', 'Today is')}</label><div class="seg" role="group">${[['auto', `Auto (${dayName().slice(0, 3)})`], ['vardag', L('Vardag', 'Weekday')], ['helg', L('Helg', 'Weekend')]].map(([k, l]) => `<button type="button" data-day="${k}" aria-pressed="${m === k}">${l}</button>`).join('')}</div></div>
    <div class="field"><label>${L('Tid idag', 'Time today')}</label><div class="chips">${TIMES.map(([k, l]) => `<button type="button" class="chip opt" data-time="${k}" aria-pressed="${t.key === k}">${tv(l)}${k === t.def ? ' ·&nbsp;' + L('standard', 'default') : ''}</button>`).join('')}</div>
      <span class="hint">${L(`${d.weekend ? 'Helg' : 'Vardag'}ens standard är ${timeLabel(t.def)}. Ändras under Inställningar.`, `The ${d.weekend ? 'weekend' : 'weekday'} default is ${timeLabel(t.def)}. Change it under Settings.`)}</span></div>
    <div class="field"><label>${L('Portioner', 'Servings')}</label><div class="stepper"><button type="button" data-portions="-1" aria-label="${L('Färre portioner', 'Fewer servings')}">−</button><output>${P.portions}</output><button type="button" data-portions="1" aria-label="${L('Fler portioner', 'More servings')}">+</button></div></div>
    <p class="hint" style="margin:0 0 10px">${L(`Dag och tid gäller resten av dagen, sedan automatiskt igen. Portioner sparas tills du ändrar.`, `Day and time apply for the rest of the day, then return to automatic. Servings stay until you change them.`)}</p>
    <button class="ghost small" data-go="settings">${L('Alla inställningar', 'All settings')}</button>`;
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
  if (dd) { S.settings.dayMode = { mode: dd.dataset.day, date: new Date().toDateString() }; S.settings.timeOverride = null; saveSettings(); renderStatus(); if (['home', 'settings'].includes(S.route.view)) renderStage(); return; }
  const tm = t.closest('[data-time]');
  if (tm) { const v = tm.dataset.time; S.settings.timeOverride = v === todayTime().def ? null : { val: v, date: new Date().toDateString() }; saveSettings(); renderStatus(); if (S.route.view === 'home') renderStage(); return; }
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
  toast(L(`Timer startad: ${fmtMin(minutes)}`, `Timer started: ${fmtMin(minutes)}`));
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
    if (left === 0 && !t.done) { t.done = true; beep(); toast(L(`${t.label}: tiden är ute!`, `${t.label}: time's up!`), 5000); }
    if (t.done && Date.now() % 4000 < 1000) beep();
    const mm = Math.floor(left / 60), ss = String(left % 60).padStart(2, '0');
    return `<button class="timer-chip ${t.done ? 'done' : ''}" data-tid="${t.id}" title="${L('Tryck för att stänga', 'Tap to close')}">${esc(t.label)} ${t.done ? L('klar!', 'done!') : `${mm}:${ss}`}</button>`;
  }).join('');
}
setInterval(() => { if (S.timers.length) tickTimers(); }, 1000);
let pollTick = 0;
setInterval(() => {
  if (document.visibilityState !== 'visible') return;
  pollTick++;
  const fast = $('#app').dataset.chat === 'open' || S.route.view === 'recipe';
  if (fast ? pollTick % 2 === 0 : pollTick % 4 === 0) syncNow();
}, 5000);
$('#timers').addEventListener('click', e => {
  const b = e.target.closest('[data-tid]'); if (!b) return;
  const t = S.timers.find(x => x.id === b.dataset.tid);
  if (t && (t.done || confirm(L(`Stoppa timern "${t.label}"?`, `Stop the timer "${t.label}"?`)))) { S.timers = S.timers.filter(x => x !== t); tickTimers(); }
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
function setSync(state, title = '') { S.sync.state = state; const el = $('#sync'); el.textContent = tv(state); el.title = title; }
function scheduleSync() {
  if (window.Cloud?.active()) { Cloud.queueWrite(); return; }
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
  if (!S.settings[p === 'claude' ? 'claudeKey' : 'geminiKey'] && !(p === 'gemini' && window.Cloud?.geminiKey())) return L('Ingen nyckel ännu', 'No key yet');
  const sysBackup = S.chat; S.chat = [{ role: 'user', text: 'Test: svara bara med reply "OK".' }];
  try { await callModel(); return L('✓ Souschefen svarar', '✓ The sous-chef is responding'); }
  catch (e) { return '✗ ' + (e.message === 'NOKEY' ? L('Ingen nyckel', 'No key') : e.message); }
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
  S.aiStatus = L('Testar…', 'Testing…'); renderStage();
  const jobs = [testAI().then(r => { S.aiStatus = r; })];
  if (S.settings.ghToken) jobs.push(S.settings.gistId ? syncNow() : findOrCreateGist());
  else setSync('');
  await Promise.all(jobs);
  if (S.route.view === 'settings') renderStage();
  toast(S.aiStatus.startsWith('✓') ? L('Allt är kopplat', 'Everything is connected') : L('Kolla kopplingen', 'Check the connection'));
}
async function createGist() {
  if (!S.settings.ghToken) { toast(L('Lägg in en GitHub-token först', 'Add a GitHub token first')); return; }
  setSync('Skapar…');
  const res = await gh('/gists', { method: 'POST', body: JSON.stringify({ description: 'Souschefen – kokbok', public: false, files: { [DATA_FILE]: { content: JSON.stringify(S.data, null, 1) } } }) });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) { setSync('Synk misslyckades', j.message || ''); toast(L('Kunde inte skapa: ', 'Could not create: ') + (j.message || res.status)); return; }
  S.settings.gistId = j.id; saveSettings(); setSync('Synkad'); toast(L('Delad kokbok skapad', 'Shared cookbook created')); renderStage();
}
let syncing = false;
function afterMerge() {
  renderStatus();
  const ss = S.data.session;
  if (S.route.view === 'recipe' && ss && ss.id === S.current.sessionId && ss.device !== S.settings.deviceId) {
    // Samma matlagning pågår på annan enhet: ta in bockar, steg och chatt
    applySession(ss); keepScroll(renderStage); renderChat(true);
  } else if (['book', 'home', 'settings'].includes(S.route.view)) {
    const ae = document.activeElement;
    if (!(ae && ae.matches && ae.matches('input, textarea') && $('#stage').contains(ae))) renderStage();
  }
  if (applyRemoteChat()) { renderChat(true); if ($('#app').dataset.chat !== 'open') $('#chatDot').hidden = false; }
}
async function syncNow(manual) {
  if (window.Cloud?.active()) return;
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
    setSync('Synkad', L('Senast ', 'Last ') + new Date().toLocaleTimeString(LOCALE()));
    if (before !== merged) afterMerge();
    if (manual) toast(L('Kokboken är synkad', 'The cookbook is synced'));
  } catch (e) {
    setSync('Synk misslyckades', String(e.message || e));
    if (manual) toast(L('Synk misslyckades: ', 'Sync failed: ') + (e.message || e));
  } finally { syncing = false; }
}
function canon(d) {
  const recipes = (d.recipes || []).slice().sort((a, b) => a.id.localeCompare(b.id)).map(r => r.id + '|' + (r.updatedAt || ''));
  const memory = (d.memory || []).map(m => m.id + '|' + (m.updatedAt || '')).sort();
  return JSON.stringify([d.textUpdatedAt, recipes, memory, Object.keys(d.deleted || {}).sort(), d.session?.updatedAt || '', d.chatSync?.updatedAt || '', (d.history || []).map(h => h.id + '|' + h.viewedAt)]);
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
  if (R.prefs && ((R.textUpdatedAt || '') > (L.textUpdatedAt || '') || (String(L.textUpdatedAt || '').startsWith('1970') && !String(R.textUpdatedAt || '').startsWith('1970')) || (String(L.textUpdatedAt || '').startsWith('1970') && String(R.textUpdatedAt || '').startsWith('1970') && !HAD_DATA))) { L.instructions = R.instructions; L.profile = R.profile; if (R.prefs) L.prefs = Object.assign(JSON.parse(JSON.stringify(DEFAULT_PREFS)), L.prefs || {}, R.prefs); L.textUpdatedAt = R.textUpdatedAt; }
  L.deleted = deleted;
  if (R.session && (!L.session || (R.session.updatedAt || '') > (L.session.updatedAt || ''))) L.session = R.session;
  if (R.chatSync && (!L.chatSync || (R.chatSync.updatedAt || '') > (L.chatSync.updatedAt || ''))) L.chatSync = R.chatSync;
  const hm = new Map();
  [...(R.history || []), ...(L.history || [])].forEach(h => { const k = recipeKey(h.recipe); const e = hm.get(k); if (!e || (h.viewedAt || '') > (e.viewedAt || '')) hm.set(k, h); });
  L.history = [...hm.values()].sort((a, b) => (b.viewedAt || '').localeCompare(a.viewedAt || '')).slice(0, 30);
  migrateData();
}
async function copyShareLink() {
  const payload = { geminiKey: S.settings.geminiKey, claudeKey: S.settings.claudeKey, provider: S.settings.provider, ghToken: S.settings.ghToken, gistId: S.settings.gistId };
  const link = location.origin + location.pathname + '#koppla=' + btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  try { await navigator.clipboard.writeText(link); toast(L('Länken är kopierad', 'The link is copied')); }
  catch { prompt(L('Kopiera länken:', 'Copy the link:'), link); }
}
function readShareLink() {
  const m = location.hash.match(/#koppla=([^&]+)/);
  if (!m) return;
  try {
    const p = JSON.parse(decodeURIComponent(escape(atob(m[1]))));
    Object.keys(p).forEach(k => { if (p[k]) S.settings[k] = p[k]; });
    saveSettings(); toast(L('Enheten är kopplad till Souschefen', 'This device is connected to Souschefen'));
  } catch { toast(L('Kopplingslänken gick inte att läsa', 'The connection link could not be read')); }
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
applyStaticLang();
applyTheme();
renderStatus();
if (HAD_DATA && !S.settings.onboarded) { S.settings.onboarded = true; saveSettings(); }
if (S.settings.geminiKey && !S.settings.onboarded) { S.settings.onboarded = true; saveSettings(); }
// Appen har flyttat till Cloudflare Pages. Skicka vidare från den gamla adressen –
// men bara när inget osparat ligger kvar lokalt (annars: be om inloggning först så att datan följer med).
const NEW_HOME = 'https://souschefen.pages.dev/';
const OLD_HOST = !!NEW_HOME && location.hostname === 'carlhedin-droid.github.io';
if (OLD_HOST) {
  let hasLocal = false, inCloud = false;
  try { hasLocal = !!localStorage.getItem('fk.data'); inCloud = localStorage.getItem('fk.cloudSynced') === '1'; } catch { }
  if (!hasLocal || inCloud) location.replace(NEW_HOME + location.search + location.hash);
}
function movedNote() {
  return OLD_HOST ? `<div class="sync-note err"><strong>${L('Souschefen har flyttat till', 'Souschefen has moved to')} <a href="${NEW_HOME}">souschefen.pages.dev</a>.</strong> ${L('Logga in här först och skapa eller gå med i er familj, så följer kokboken och historiken på den här enheten med. Sedan skickas du vidare automatiskt.', 'Sign in here first and create or join your family, so the cookbook and history on this device come along. You will then be redirected automatically.')}</div>` : '';
}
function startView() { return !S.settings.onboarded ? 'welcome' : S.current.recipe && LS.get('fk.lastView', '') === 'recipe' ? 'recipe' : 'home'; }
if (window.Cloud?.configured()) { Cloud.init(); go(Cloud.signedInHint() ? startView() : 'login'); }
else go(startView());
renderChat(true);
syncNow();
