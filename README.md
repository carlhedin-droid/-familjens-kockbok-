# Souschefen

Adress: https://souschefen.pages.dev/

Familjens souschef och kokbok som webbapp. Fungerar på dator, mobil och platta och använder Google Gemini (gratis).

- **Laga mat:** Beskriv vad ni har (eller fota kylen) och få 5–8 förslag med förklaring. Välj ett och få hela receptet.
- **Receptet:** Översikt, tid i förväg, ingredienser med byten och steg (valfria steg och "Visa hur" på YouTube). Längst ner: om det går fel, servera med, dryck till maten (helg: typ av dryck och varför, 2–3 alternativ med länkar till Systembolagets sortiment filtrerat på typ, smakstil, land och druva) samt förvaring och rester. Stående skärm: ingredienserna först, sedan stegen. Liggande skärm: steg och ingredienser sida vid sida. Portioner med − och +, timers, och skärmen hålls tänd.
- **Fråga souschefen:** Chatt bredvid receptet för frågor under matlagningen. Ber du om en ändring uppdateras receptet.
- **Snabbval (uppe till höger):** Vardag eller helg, tid idag och portioner.
- **Inställningar:** Språk (svenska eller engelska), hushåll och allergier, tidsramar för vardag och helg, hälsomål, favoritländer, specialutrustning och bakning av bröd samt dryck (prisklass och alkoholfritt alternativ).
- **Kokboken:** Spara recept, ge betyg och skriv anteckningar. Souschefen läser kokboken och smakminnet varje gång.

## Kom igång

1. Öppna appen, gå till **Inställningar → Koppling** och klistra in en gratis Gemini-nyckel från https://aistudio.google.com/apikey.
2. Valfritt: lägg till en GitHub-token (bara behörigheten `gist`) för att dela kokboken mellan enheter.
3. Tryck **Kopiera länk till annan enhet** och öppna länken på mobilen och plattan.
4. Lägg appen på hemskärmen via webbläsarens meny.

Nycklarna sparas bara i webbläsaren och följer aldrig med i koden.

## Teknik

Statisk HTML/CSS/JS utan byggsteg, publicerad med GitHub Pages. Datan sparas i `localStorage` och kan synkas till en privat Gist.

## Inköpslistan

Egen app på `/lista/` (t.ex. souschefen.pages.dev/lista/) med egen hemskärmsikon, samma Google-inloggning och familj som Souschefen.

- **Från receptet:** "Till inköpslistan" under ingredienserna. Det som finns i skafferiet hamnar under "Har ni troligen hemma" (inte förbockat). Mängder följer valda portioner och dubbletter slås ihop.
- **Listor:** flera listor (Mat, Bygghandel, Apotek …), snabbinmatning ("mjölk, ägg, 2 avokado"), bocka av i realtid för hela familjen, "I korgen" och Rensa.
- **Skafferiet:** sparas i Souschefens inställningar. Souschefen kan föreslå basvaror utifrån favoritländerna, märker skafferivaror i recepten, och i inköpslistan fyller man på det som är slut.
- **Utan täckning:** appen och listan öppnas offline; ändringar skickas när nätet är tillbaka.
- **Data:** `families/{fid}/lists` och `families/{fid}/items` i Firestore (täcks av befintliga regler).

