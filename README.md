# Familjens kockbok

Familjens egen kockcoach som en webbapp. Den fungerar på dator, mobil och surfplatta och bygger på prompten från vår Gemini-gem.

- **Kocken:** Beskriv vad ni har (eller fota kylen), så får ni förslag med en förklaring till varför de passar er. Välj ett förslag och få hela receptet.
- **Receptvyn:** Ingredienserna och stegen visas sida vid sida och scrollar var för sig. Ingredienserna går att bocka av. Varje steg har mängderna utskrivna, och när du trycker på en ingrediens i ett steg markeras den i listan. Stegen har timers, och skärmen hålls tänd medan ett recept är öppet.
- **Fråga kocken:** Fliken i kanten öppnar chatten som en egen panel, så att receptet syns kvar. Kocken vet vilket recept som visas. Be den till exempel att byta en råvara, så uppdateras receptet direkt.
- **Kockboken:** Spara recept och ge dem betyg. Tryck på "Vi lagade den idag" och skriv anteckningar. Kocken läser kockboken och smakminnet varje gång, så den lär sig vad ni gillar.

## Kom igång

1. Öppna appen och gå till **Inställningar**.
2. **Kockens AI:** Klistra in en gratis Gemini-nyckel från https://aistudio.google.com/apikey. Claude går också att välja.
3. **Dela kockboken** (för att mamma och pappa ska se samma kockbok på alla enheter):
   - Skapa en GitHub-token med bara behörigheten `gist`.
   - Klistra in den och tryck på **Skapa delad kockbok**.
   - Tryck på **Kopiera länk för annan enhet** och öppna länken på mobilen och plattan. Då kopplas de automatiskt.
4. Lägg till appen på hemskärmen. I Chrome görs det via menyn: Lägg till på startskärmen.

Nycklarna sparas bara lokalt i webbläsaren och följer aldrig med i koden.

## Teknik

Appen är statisk HTML/CSS/JS utan byggsteg och publiceras med GitHub Pages. Datan sparas i `localStorage` och synkas till en privat Gist (`familjens-kockbok.json`).
