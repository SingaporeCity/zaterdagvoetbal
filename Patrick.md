# Zaterdagvoetbal

Nederlands amateurvoetbal-managerspel. Begin in de 6e Klasse en werk je omhoog naar de top.

**Live**: https://singaporecity.github.io/zaterdagvoetbal/

## Spel

Je beheert een amateurvoetbalclub. Elke dag kun je een wedstrijd spelen (timer telt af naar middernacht). Een seizoen duurt 14 wedstrijden. Na afloop promoveer of degradeer je op basis van je eindstand.

### Wat kun je doen
- **Dashboard** - Overzicht: volgende wedstrijd, stand, topscorers, meldingen
- **Selectie** - Spelers bekijken, verkopen, contracten verlengen
- **Tactiek** - Opstelling kiezen, formatie instellen, speelstijl aanpassen
- **Training** - Spelers trainen om hun stats te verbeteren
- **Scout** - Nieuwe spelers zoeken en aantrekken
- **Transfers** - Spelers kopen en verkopen op de markt
- **Jeugd** - Jeugdspelers ontwikkelen en doorschuiven
- **Stadion** - Upgrades kopen (veld, tribunes, faciliteiten)
- **Sponsors** - Sponsordeals sluiten voor extra inkomsten
- **Financien** - Budget en inkomsten/uitgaven beheren
- **Kantine** - Extra activiteiten en evenementen

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
  styles.css          - Dark sporty theme (CSS custom properties)
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
Dark sporty thema (ESPN/FIFA-stijl):
- Achtergrond: donkerblauw-zwart (`#0a0e17`)
- Accenten: neon groen (`#00e676`) + oranje (`#ff6d00`)
- Cards: donkere panelen met subtiele borders
- Fonts: Bebas Neue (headers) + DM Sans (body)
- Responsive: hamburger menu op mobiel (<=768px)

### Belangrijke functies in app.js
| Functie | Regel | Wat het doet |
|---------|-------|-------------|
| `initGame()` | ~5621 | Start het spel, laadt save, rendert UI |
| `navigateToPage()` | ~3537 | Wisselt tussen pagina's |
| `initNavigation()` | ~3569 | Click handlers voor menu + hamburger |
| `playMatch()` | ~6158 | Speelt een wedstrijd, update stand |
| `showMatchResultModal()` | ~6337 | Toont wedstrijdresultaat met timeline |
| `setNextMatch()` | ~6294 | Plant volgende wedstrijd (middernacht) |
| `updateMatchTimer()` | ~3381 | Countdown timer op dashboard |
| `renderStandings()` | - | Rendert competitietabel |
| `renderPlayerCards()` | - | Rendert spelersoverzicht |
