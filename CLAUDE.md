# Zaterdagvoetbal — Claude Code Context

## Wat is dit?
Nederlandse amateurvoetbal-managergame. Je bent speler én manager van een zaterdagclub. Vite + vanilla JS frontend, Supabase (Postgres) backend voor multiplayer. Gehost op GitHub Pages.

## ALLEEN MULTIPLAYER — singleplayer code is verwijderd
Er is geen singleplayer meer. De volgende functies/concepten bestaan NIET meer:
- `initGame()` — verwijderd, multiplayer start via `initMultiplayerGame()`
- `playMatch()` — is nu een simpele redirect naar `playMultiplayerMatch()`
- `handleEndOfSeason()` — verwijderd, season-end stats zitten nu in `playMultiplayerMatch()`
- `onStartGame()` — verwijderd, `DOMContentLoaded` roept direct `initMultiplayerUI()` + `checkAuthAndRoute()` aan
- `loadGameSync()` / `deleteSave()` — verwijderd uit storage.js
- `generateFakeMatchHistory()` — verwijderd
- Mode-selectie scherm (`#mode-screen`) — verwijderd uit HTML en JS
- `initMultiplayerUI()`, `startLeague()`, `checkAuthAndRoute()` accepteren geen `onStartGame` parameter meer

Bij elke wijziging: check of het correct synct met Supabase, of `saveGame()` wordt aangeroepen, en of nieuwe spelers via `insertPlayerToSupabase()` een UUID krijgen.

## Deploy workflow — ALTIJD BEIDE BRANCHES
```bash
npm run build
cd dist && git add -A && git commit -m "beschrijving" && git push origin gh-pages
cd /Users/patrickjeeninga/Coding/zaterdagvoetbal && git add <files> && git commit -m "beschrijving" && git push origin main
```
- `dist/` is een **aparte git repo** op de `gh-pages` branch (= live site)
- Source staat op `main`
- Als je alleen `main` pusht verandert er **niets** op de live site
- Draai git commands voor main ALTIJD vanuit de root, niet vanuit `dist/`

## Tech stack
- **Build**: Vite 7.x, vanilla JS (geen framework), ES modules
- **Backend**: Supabase (auth, Postgres, realtime, RPC)
- **Hosting**: GitHub Pages (`gh-pages` branch)
- **Repo**: https://github.com/SingaporeCity/zaterdagvoetbal

## Projectstructuur

### JS bestanden (~24k regels totaal)
| Bestand | Regels | Wat |
|---------|--------|-----|
| `app.js` | ~16k | Alles: UI rendering, game logic, stadion, sponsors, tactiek, match display, achievements UI. Zoek op `function renderXxxPage()` voor specifieke pagina's. `playMatch()` redirected naar `playMultiplayerMatch()`. |
| `achievements.js` | ~2.4k | `ACHIEVEMENTS` object met 200+ achievements, `checkAchievements()`, `initAchievements()` |
| `multiplayer.js` | ~1.6k | Lobby, league creation/joining, `startLeague()`, `generateSchedule()`, `simulateWeek()`, AI teams met tier systeem |
| `matchEngine.js` | ~930 | `simulateMatch()`, `calculateTeamStrength()`, `generateOpponent()` |
| `progression.js` | ~710 | XP/leveling systeem, `awardPlayerXP()`, `awardXP()`, `getSPPerLevel()`, dagelijkse beloningen |
| `constants.js` | ~680 | `POSITIONS`, `FORMATIONS`, `TACTICS`, `NATIONALITIES`, `STAFF_TYPES`, `MANAGER_LEVELS` |
| `storage.js` | ~650 | `saveGame()`, `loadGame()`, `gameStateToClubRecord()`, `clubRecordToGameState()`, Supabase sync. Geen `loadGameSync()`/`deleteSave()` meer. |
| `state.js` | ~330 | `gameState` singleton, `getGameState()`, `replaceGameState()` |
| `realtime.js` | ~270 | Supabase realtime subscriptions, `subscribeToLeague()`, `fetchStandings()` |
| `events.js` | ~750 | Match events, `generateMatchEvents()` |
| `auth.js` | ~115 | `showAuthScreen()`, login/signup UI |
| `supabase.js` | ~36 | Supabase client init |
| `utils.js` | ~70 | `formatCurrency()`, helpers |

### Andere bestanden
- `index.html` — Alle pagina HTML (single page app, pagina's via `.page.active`)
- `styles.css` — ~15k regels CSS
- `supabase/migrations/` — 14 SQL migraties (001-014)

## Architectuur

### State management
- `gameState` is een singleton object in `state.js`
- Bevat alles: club, spelers, lineup, tactiek, stadion, stats, achievements, etc.
- `replaceGameState()` doet **shallow merge** — nested objects worden gespreid, arrays vervangen
- `getGameState()` geeft referentie terug (geen kopie)

### Opslag / sync
- **Primary**: Supabase `clubs` tabel met `client_state` JSONB kolom
- **Backup**: `localStorage` via `saveLocal()` (wordt altijd mee-opgeslagen als backup)
- `gameStateToClubRecord()` serialiseert gameState → Supabase record
- `clubRecordToGameState()` deserialiseert terug
- `saveGame()` heeft debounce + `pendingSave` flag tegen dropped saves
- `startAutoSave()` gebruikt `getGameState()` (geen parameter) om stale closures te voorkomen

### Multiplayer flow
1. Host maakt league (status: 'lobby'), krijgt invite code
2. Andere spelers joinen met code
3. Host klikt "Start competitie" → AI teams aanmaken (8 - humans), schedule genereren
4. Schedule: round-robin, 14 weken (8 teams). **Human-vs-human wedstrijden worden vroeg ingepland**
5. Eerste speler die "Speel wedstrijd" klikt simuleert ALLE wedstrijden van die week
6. Tweede speler haalt gecachte resultaten op uit `match_results`
7. Beide spelers zien exact hetzelfde wedstrijdverslag, maar vanuit eigen perspectief
8. Realtime updates via Supabase channels (standings, results, league week)

### Late join (league al actief)
- `replace_ai_club()` RPC: neemt een AI-team over
- Erft het bestaande schema van dat AI-team

### Speler data in Supabase
- `clubs` tabel: naam, division, is_ai, tactics, stadium, client_state (JSONB)
- `players` tabel: per club, met attributes, stars, age, nationality, injured_until, etc.
- `standings` tabel: per league/season/club
- `schedule` tabel: alle wedstrijden
- `match_results` tabel: gesimuleerde resultaten met match_data JSONB

## UI/UX workflow
Gebruik ALTIJD de `/frontend-design` skill bij het ontwerpen of aanpassen van pagina's, componenten of UI-elementen. Dit geldt voor nieuwe pagina's, redesigns, en significante visuele wijzigingen.

## Belangrijke patronen

### Achievement toevoegen
1. Voeg entry toe aan `ACHIEVEMENTS` in `achievements.js`:
```js
mijnAchievement: {
    id: 'mijnAchievement',
    name: 'Naam',
    description: 'Beschrijving',
    category: CATEGORIES.SPECIAL,
    icon: '🎯',
    hidden: true, // optioneel
    reward: { managerXP: 15 }, // of playerXP
    check: (state) => state.stats?.mijnFlag === true
}
```
2. Zet de stat op de juiste plek in `app.js`:
```js
gameState.stats.mijnFlag = true;
triggerAchievementCheck();
```
**BELANGRIJK**: Altijd `triggerAchievementCheck()` aanroepen direct na het zetten van de stat, anders verschijnt het achievement pas later (of nooit).

### Pagina rendering
Elke pagina heeft een `renderXxxPage()` functie in `app.js`. Navigatie via `navigateToPage('pagename')`. Pagina's worden geactiveerd met CSS class `.page.active`.

### Tactiek systeem
`TACTICS` in `constants.js` definieert categorieën (mentaliteit, offensief, speltempo, veldbreedte, dekking) met opties. Waarden worden opgeslagen in `gameState.tactics.categorie = optie.id`.

### Stadion SVG kaart
`renderStadiumMap()` in `app.js` genereert een volledige SVG met gebouwen, velden, wegen, bomen. Elk gebouw is klikbaar (`selectStadiumCategory()`). Level badges gebruiken `levelColors` array — index 0-1 zijn blauwgrijs (#90a4ae/#b0bec5) voor contrast op groen.

## Bekende valkuilen (geleerde lessen)

### Double-click/tap bugs
Alle knoppen die state muteren moeten `btn.disabled = true` krijgen aan het begin van de handler. Dit geldt voor:
- Claim-knoppen (XP, achievements, level-up)
- "Start competitie" knop
- Sponsor selectie
- Bug submit

### initNavigation() idempotency
`initNavigation()` kan meerdere keren aangeroepen worden (multiplayer). Heeft een `navigationInitialized` guard flag.

### Falsy-zero bugs
`if (!gameState.myPlayer.stars)` vangt ook `0` af. Gebruik `=== undefined || === null` checks, of zet altijd een default in `initMyPlayer()`.

### gameState.stats vs club.stats
`gameState.stats` = match/achievement statistieken (wins, goals, flags).
`gameState.club.stats` = club metadata (founded, titles, highestDivision).
In Supabase worden club.stats opgeslagen als `client_state.clubStats` om collision te voorkomen met de `stats` kolom.

### Player nationality
Supabase slaat nationality op als string code ("NL"). Bij laden moet dit omgezet worden naar een object met `NATIONALITIES` lookup: `{ code, flag, name }`. Vergelijk nationaliteiten ALTIJD op `.code` strings, niet op object references.

### Spelerscijfers (match ratings)
- Gehele getallen, range 2-9 (geen decimalen)
- Base rating: `3.5 + quality * 1.5 + performanceRoll * 2.5` (quality = overall/100, performanceRoll = gemiddelde van 2 randoms)
- Doelpunt: +1.5, assist: +1.0, gele kaart: -0.5, rode kaart: -2.0
- In multiplayer: away-team ratings worden apart geïnitialiseerd in `simulateWeek()` — moeten `position` bevatten
- Compact ratings filteren op `lineupIds` — alleen eigen team opslaan, niet de tegenstander

### Signup flow
- Account aanmaken: alleen email + wachtwoord (geen managernaam)
- `display_name` wordt tijdelijk ingevuld met deel vóór @
- Spelernaam wordt gevraagd tijdens onboarding (stap 2)

### Onboarding kleurpresets
- Kleurswatches tonen diagonale split: `linear-gradient(135deg, primary 50%, secondary 50%)` met accent border
- 6 presets: Groen-Wit, Rood-Wit, Blauw-Wit, Zwart-Geel, Oranje-Zwart, Paars-Wit

### Nationaliteitsvlaggen in opstelling
- Pitch-cirkels: `.lp-flag` badge rechtsboven op het speler-cirkel (CSS al aanwezig)
- Spelerslijst: `.ap-flag` emoji tussen positie-badge en naam (vervangt leeftijd)

### replaceGameState shallow merge
Nested objects worden gespreid maar niet deep-merged. Nieuwe keys in geneste objecten overleven, maar verwijderde keys ook. Arrays worden volledig vervangen.

## Taal
Het spel is volledig in het **Nederlands**. UI teksten, achievement namen, voorzitter quotes — alles Nederlands. Code (variabelen, functies) is Engels.

## Supabase
- Project URL en anon key staan in `js/supabase.js`
- RLS policies zijn actief
- RPC functies: `generate_invite_code`, `find_league_by_invite_code`, `replace_ai_club`, `process_week_results`, `start_league`, `join_league`, `process_season_end`
- Migraties in `supabase/migrations/` (001-014)
- **Migraties t/m 013 zijn uitgevoerd in Supabase**
- **Migratie 014 moet nog uitgevoerd worden** — tighten RLS (standings UPDATE eigen club only, schedule UPDATE geblokkeerd)

### RLS policies (014)
- `standings_update`: beperkt tot eigen club (`club_id IN (SELECT id FROM clubs WHERE owner_id = auth.uid())`)
- `schedule_update`: geblokkeerd (`USING (false)`) — alleen via SECURITY DEFINER RPCs
- `standings_insert` / `schedule_insert`: league members (ongewijzigd)

### AI team tier systeem
- AI teams krijgen gevarieerde kracht via `assignAiTiers()`: ~30% weak, ~40% average, ~30% strong
- **Weak** (overall 2-4): degradatiekandidaten
- **Average** (overall 3-6): normaal kelderklasse
- **Strong** (overall 5-8): klassefavorieten
- **Human** (overall 3-7): start iets boven gemiddeld, moet managen voor de titel
- AI teams krijgen automatisch een 4-4-2 lineup via `generatePlayersForClub()`
- `buildTeamFromClub()` heeft een fallback auto-lineup voor bestaande leagues zonder lineup_position

### Buitenlandse spelers
- **Team generatie** (`generatePlayersForClub()`): 3-5 buitenlanders per team met passende namen per nationaliteit (BE/DE/BR/ES/GB/FR/GH/MA/TR/PL). Keepers zijn altijd Nederlands.
- **Transfermarkt** (`generateNationality()`): ~50% Nederlands, ~50% buitenlands. Gewicht NL=71, rest=71 totaal.
- **Nationaliteit opslag**: Supabase slaat op als lowercase string code ("nl", "de"). Bij laden omgezet naar object via `NATIONALITIES` lookup.

### myPlayer in lineup (multiplayer)
- `myPlayer` zit NIET in de `players` tabel — alleen in `client_state`
- Lineup-positie van myPlayer wordt apart opgeslagen als `client_state.myPlayerLineupPos`
- Bij laden: `restoreMyPlayerInLineup()` zet myPlayer terug op de opgeslagen positie
- Zonder dit verdwijnt myPlayer uit de opstelling bij elke refresh

### localStorage merge (multiplayer)
- Bij laden in multiplayer worden alleen "safe" velden gemerged vanuit localStorage: `formationDrives`, `scoutTips`, `scoutHistory`, `sponsorMarket`
- `youthPlayers` uitgesloten: kan bewust geleegd worden bij academy-afbraak
- Stadium merge: alleen `construction` sub-object, niet het hele stadium (voorkomt downgrading)
- Alle andere velden: Supabase is source of truth (voorkomt dat verwijderde data terugkomt)

### Auto-save bij league switch
- `setStorageMode()` stopt de auto-save timer + cleart `pendingSave` voor mode/club switch
- `saveMultiplayer()` captured `currentClubId` als lokale var bij start → voorkomt race als club wisselt tijdens async save

### Multiplayer concurrency architectuur
- **`process_week_results`** (012): Atomaire week-simulatie. `FOR UPDATE` lock op league row, `ON CONFLICT DO NOTHING` op match_results, atomaire `SET played = played + 1` op standings. Client simuleert lokaal, stuurt alles in 1 RPC call.
- **`start_league`** (013): Atomaire league start. Lockt league, checkt `status = 'lobby'`, maakt AI clubs + standings. Voorkomt dubbele AI teams bij gelijktijdig klikken.
- **`join_league`** (013): Atomaire join. Telt humans onder lock, weigert bij `>= max_players`. Voorkomt overflow.
- **`process_season_end`** (013): Atomaire seizoenstransitie. Maakt nieuwe standings, advanced season, reset week/goals/assists.
- **UNIQUE constraint** op `match_results(league_id, season, week, home_club_id, away_club_id)` (012)
- **`leagues` tabel** toegevoegd aan `supabase_realtime` publication (012)

### App startup flow
1. `DOMContentLoaded` → `initMultiplayerUI()` + `checkAuthAndRoute()`
2. Geen `onStartGame` callback meer — auth route toont direct lobby
3. Als Supabase niet bereikbaar: foutmelding (geen singleplayer fallback)
4. Na league selectie: `multiplayer-start` event → `initMultiplayerGame()`

### Multiplayer match flow
1. `playMatch()` → `playMultiplayerMatch()` (directe redirect, geen singleplayer branch)
2. `playMultiplayerMatch()` heeft double-click guard (`multiplayerMatchInProgress` + `btn.disabled`)
3. Captured `week`/`season` aan begin → gebruikt die i.p.v. `gameState.week` voor alle match-gerelateerde logica
4. `simulateWeek()` simuleert lokaal, stuurt alles naar `process_week_results` RPC
5. Na match: volledige post-match effecten (stats, XP, player growth, energy, fans, achievements)
6. `applyMatchResults` wijzigt lineup objecten → synct terug naar `gameState.players` voor persistence
7. `forceSyncToSupabase()` gaat door dezelfde `savingInProgress` lock als `saveGame()`
8. Season-end: `isSeasonComplete()` check → `process_season_end` RPC → lokale effecten → nieuwe schedule

### Season-end stats (in playMultiplayerMatch)
Bij seizoenseinde worden de volgende stats bijgewerkt in de multiplayer flow:
- `showManagerXPPopup` voor promotie (500 XP) en kampioen (1000 XP)
- Promotie bonus: +0.5 ster voor spelers die minstens helft seizoen speelden
- `topHalfFinish`, `runnerUp`, `lastPlace` positie-stats
- `perfectSeason` (alle 14+ wedstrijden gewonnen)
- `budgetPositive` (positief budget aan einde seizoen)
- `yoyoClub` (gepromoveerd vorig seizoen, gedegradeerd dit seizoen)
- `comebackPromotion` (gepromoveerd na vorige degradatie)
- `seasonSpending` reset naar 0
