# Multiplayer Bugs — Fix Plan

## CRITICAL

### 1. `startLeague()` race condition
**Bestand:** `multiplayer.js:813-897`
**Bug:** Twee spelers klikken "Start competitie" tegelijk → beiden lezen `status === 'lobby'`, beiden maken AI teams, spelers, standings. Resultaat: 10-12 clubs i.p.v. 8.
**Fix:** Atomaire `start_league` RPC met `FOR UPDATE` lock op league row. Check `status = 'lobby'` in de transactie. Alleen de winnende call maakt AI teams + standings + schedule.

### 2. Geen double-click guard op `playMultiplayerMatch()`
**Bestand:** `app.js:10735`
**Bug:** Speler tikt 2x snel → `applyMatchResults` 2x toegepast. Dubbele goals, energy drain, morale, matchHistory, finances.
**Fix:** Guard variable `multiplayerMatchInProgress` + button disable aan begin, re-enable in finally block.

---

## MAJOR

### 3. Geen end-of-season handling in multiplayer
**Bestand:** `app.js:10891-10907`
**Bug:** Na week 14: geen `isSeasonComplete()` check, game stuck. Bestaande `startNewSeason()` is puur lokaal.
**Fix:** Na match: check `isSeasonComplete()`. Voeg `process_season_end` RPC toe die atomair seizoen reset (nieuwe standings, week=1, season++). Lokaal: spelers verouderen, goals/assists reset, division update.

### 4. `onLeagueUpdate` realtime race met `playMultiplayerMatch`
**Bestand:** `app.js:16744-16750` + `app.js:10796-10816`
**Bug:** RPC advanced week → realtime bumpt `gameState.week` terwijl match processing nog loopt → schorsingen/blessures off-by-one.
**Fix:** Capture `const matchWeek = gameState.week` aan begin van `playMultiplayerMatch()`, gebruik die voor alle week-gerelateerde logica in de functie. Pas `gameState.week` pas aan het eind aan.

### 5. `saveGame()` + `forceSyncToSupabase()` concurrent saves
**Bestand:** `app.js:10906-10907`, `storage.js:675-678`
**Bug:** `forceSyncToSupabase()` bypassed `savingInProgress` lock → twee saves tegelijk.
**Fix:** Laat `forceSyncToSupabase()` door dezelfde lock gaan, of verwijder de dubbele call (saveGame doet het al).

### 6. Stats/XP/groei ontbreekt in multiplayer
**Bestand:** `app.js:10819-10825` vs `app.js:10357-10560`
**Bug:** Singleplayer tracked ~30 stats, multiplayer alleen wins/draws/losses.
**Fix:** Extract shared post-match logic naar `applyPostMatchEffects()` functie, aangeroepen door zowel single- als multiplayer flow.

### 7. `applyMatchResults` wijzigt lineup, niet `gameState.players`
**Bestand:** `matchEngine.js:850-908`, `storage.js:316-342`
**Bug:** Lineup en players zijn aparte objecten. Schorsingen/blessures/goals op lineup → niet gepersisteerd.
**Fix:** Na `applyMatchResults`: sync lineup wijzigingen terug naar `gameState.players` array.

### 8. `joinLeague()` max_players overflow
**Bestand:** `multiplayer.js:352-363`
**Bug:** Read-then-write: concurrent joins overschrijden max_players.
**Fix:** Voeg `max_players` check toe aan de `clubs` INSERT via een database constraint of een `join_league` RPC met lock.

### 9. Geen `setNextMatch()` na multiplayer wedstrijd
**Bestand:** `app.js:10891-10907`
**Bug:** Dashboard toont vorige tegenstander tot refresh.
**Fix:** Voeg `setNextMatch()` call toe na match processing.
