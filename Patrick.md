# Zaterdagvoetbal

Nederlands amateurvoetbal-managerspel. Begin in de 6e Klasse en werk je omhoog naar de top.

**Live**: https://singaporecity.github.io/zaterdagvoetbal/

## Spel

Je beheert een amateurvoetbalclub. Elke dag kun je een wedstrijd spelen (timer telt af naar middernacht). Een seizoen duurt 14 wedstrijden. Na afloop promoveer of degradeer je op basis van je eindstand.

### Pagina's
- **Dashboard** - Overzicht: volgende wedstrijd, stand, topscorers, meldingen
- **Mijn Speler** - Je eigen voetballer-avatar met stats (SNE/FYS/TEC/VER) en afgeleide waarden (Aanval/Verdediging/Gemiddeld)
- **Mijn Club** - Clubnaam en kleuren aanpassen
- **Selectie** - Spelers bekijken (alleen energie-bar, geen conditie)
- **Tactiek** - 5 tabs: Opstelling, Tactiek, Specialisten, Wedstrijdvoorbereiding, Activiteiten
- **Training** - Positietraining per groep (keeper/verdediging/middenveld/aanval)
- **Scout** - Nieuwe spelers zoeken en aantrekken
- **Jeugd** - Jeugdspelers ontwikkelen en doorschuiven
- **Stadion** - Upgrades kopen (veld, tribunes, faciliteiten)
- **Transfers** - Spelers kopen en verkopen op de markt
- **Sponsors** - Shirtsponsor kiezen + sponsormarkt met bord-/mouw-/broeksponsors
- **Financien** - Budget en inkomsten/uitgaven beheren
- **Stafcentrum** - Trainers en medisch personeel

### Seizoenscyclus
1. Speel 14 wedstrijden (1 per dag)
2. AI-teams spelen ook hun wedstrijden
3. Na 14 wedstrijden: seizoen einde
4. Top 2 promoveert, onderste 2 degradeert
5. Nieuw seizoen start met verse competitie

## Technisch

### Stack
- Vanilla JavaScript (ES modules)
- Vite 7 (build tool)
- Geen frameworks of runtime dependencies
- CSS custom properties voor theming
- localStorage voor savegames

### Projectstructuur
```
zaterdagvoetbal/
  index.html          - Volledige HTML structuur (alle pagina's)
  styles.css          - Voetbalkantine theme (CSS custom properties)
  vite.config.js      - Vite configuratie
  package.json        - Project config
  dist/               - Production build (GitHub Pages)
  js/
    main.js           - Entry point
    app.js            - Hoofdlogica: UI rendering, navigatie, match systeem
    matchEngine.js    - Wedstrijdsimulatie (goals, events, statistieken)
    progression.js    - Seizoensysteem, promotie/degradatie, XP, daily rewards
    constants.js      - Speldata: divisies, namen, posities, tactieken
    events.js         - Random events en achievements triggers
    achievements.js   - Achievement definities en tracking
    state.js          - GameState object en initialisatie
    storage.js        - localStorage save/load met auto-save
    utils.js          - Hulpfuncties (random, format, tijd)
```

### Ontwikkelen
```bash
npm install
npm run dev          # Start dev server op localhost:5173
npm run build        # Build naar dist/
npm run preview      # Preview production build
```

### Deployen naar GitHub Pages
```bash
npm run build
cd dist
git add -A
git commit -m "Deploy"
git push origin gh-pages
```
De `dist/` folder heeft een eigen git repo op de `gh-pages` branch.

### Design
Voetbalkantine thema — professioneel met karakter:
- Achtergrond: donker bosgroen (`#0c1a0a`)
- Accenten: warm amber (`#ffb300`) + klassiek grasgroen (`#4caf50`)
- Cards: warm groen (`#182a14`) met amber hover-glow
- Persoonlijkheidstouches: tape-hoekjes, licht gekantelde kaarten, krijtlijnen op wedstrijdveld
- Fonts: Bebas Neue (headers) + DM Sans (body)
- Responsive: hamburger menu op mobiel (<=768px)
- Geen popups bij laden (welkom-terug/dagelijkse beloning/random events uitgeschakeld)
- Dashboard: zwarte card-headers, voetbalkantine prikbord-feel
- Sponsors: shirtsponsor (3 opties) bovenaan, wekelijkse sponsormarkt daaronder met bord/mouw/broek-slots

### Belangrijke functies in app.js
| Functie | Wat het doet |
|---------|-------------|
| `initGame()` | Start het spel, laadt save, rendert UI |
| `navigateToPage()` | Wisselt tussen pagina's |
| `initNavigation()` | Click handlers voor menu + hamburger |
| `renderMijnSpelerPage()` | Rendert Mijn Speler dashboard |
| `renderPlayerCards()` | Rendert selectie-overzicht |
| `renderTacticsPage()` | Rendert tactiek (incl. wedstrijdvoorbereiding) |
| `playMatch()` | Speelt een wedstrijd, update stand |
| `showMatchResultModal()` | Toont wedstrijdresultaat met timeline |
| `renderStandings()` | Rendert competitietabel |
| `renderSponsorsPage()` | Rendert sponsorpagina (shirt + markt + overzicht) |
| `generateSponsorMarket()` | Genereert wekelijkse sponsoraanbiedingen |
| `selectMarketSponsor()` | Plaatst markt-sponsor in slot |
| `clearSponsorSlot()` | Verwijdert sponsor uit slot |
| `renderDashboardFinances()` | Financieel overzicht op dashboard |
| `calculateDailyFinances()` | Berekent dagelijkse inkomsten/uitgaven |
