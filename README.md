# Souschefen

Familjens souschef och kokbok som webbapp. Fungerar på dator, mobil och platta och använder Google Gemini (gratis).

- **Laga mat:** Beskriv vad ni har (eller fota kylen) och få 5–8 förslag med förklaring. Välj ett och få hela receptet.
- **Receptet:** Ingredienser och steg. Stående skärm: ingredienserna först, sedan stegen. Liggande skärm: steg och ingredienser sida vid sida. Portioner med − och +, timers, och skärmen hålls tänd.
- **Fråga souschefen:** Chatt bredvid receptet för frågor under matlagningen. Ber du om en ändring uppdateras receptet.
- **Snabbval (uppe till höger):** Vardag eller helg, tid idag och portioner.
- **Inställningar:** Hushåll och allergier, tidsramar för vardag och helg, hälsomål, favoritländer och specialutrustning.
- **Kokboken:** Spara recept, ge betyg och skriv anteckningar. Souschefen läser kokboken och smakminnet varje gång.

## Kom igång

1. Öppna appen, gå till **Inställningar → Koppling** och klistra in en gratis Gemini-nyckel från https://aistudio.google.com/apikey.
2. Valfritt: lägg till en GitHub-token (bara behörigheten `gist`) för att dela kokboken mellan enheter.
3. Tryck **Kopiera länk till annan enhet** och öppna länken på mobilen och plattan.
4. Lägg appen på hemskärmen via webbläsarens meny.

Nycklarna sparas bara i webbläsaren och följer aldrig med i koden.

## Teknik

Statisk HTML/CSS/JS utan byggsteg, publicerad med GitHub Pages. Datan sparas i `localStorage` och kan synkas till en privat Gist.
