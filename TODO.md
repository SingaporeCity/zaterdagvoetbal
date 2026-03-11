# Multiplayer Bugs — Status

## CRITICAL — GEFIXT

### 1. `startLeague()` race condition ✅
**Fix:** `start_league` RPC met `FOR UPDATE` lock (migration 013)

### 2. Double-click guard op `playMultiplayerMatch()` ✅
**Fix:** Guard variable `multiplayerMatchInProgress` + `btn.disabled`

---

## MAJOR — GEFIXT

### 3. End-of-season handling ✅
**Fix:** `process_season_end` RPC (migration 013)

### 4. `onLeagueUpdate` realtime race ✅
**Fix:** Captured `week`/`season` aan begin van `playMultiplayerMatch()`

### 5. Concurrent saves ✅
**Fix:** `forceSyncToSupabase()` gaat door dezelfde `savingInProgress` lock

### 6. Stats/XP/groei in multiplayer ✅
**Fix:** Volledige post-match effecten (zelfde als singleplayer)

### 7. Lineup→players sync ✅
**Fix:** `syncFields` loop na `applyMatchResults`

### 8. `joinLeague()` max_players overflow ✅
**Fix:** `join_league` RPC met lock (migration 013)

### 9. `setNextMatch()` na multiplayer wedstrijd ✅
**Fix:** `setNextMatch()` call toegevoegd na match processing

---

## MEDIUM — GEFIXT

### 10. RLS te permissief — cheating vector ✅
**Fix:** Migration 014 — `standings_update` beperkt tot eigen club, `schedule_update` geblokkeerd (alleen via RPC). INSERT policies ongewijzigd (league members).

### 11. localStorage merge resurrects verwijderde data ✅
**Fix:** Merge beperkt tot safe fields: `youthPlayers`, `formationDrives`, `scoutTips`, `scoutHistory`, `sponsorMarket`. Rest = Supabase is source of truth.

### 12. generatePlayersForClub TOCTOU ✅
**Automatisch opgelost** door `start_league` RPC (alles server-side).

### 13. RPC partial crash ✅
**Automatisch opgelost** — RPCs zijn transacties, falen atomair.

---

## LOW — GEFIXT

### 14. Stale currentClubId bij league-switch ✅
**Fix:** `setStorageMode()` stopt auto-save timer voor mode switch. Auto-save wordt opnieuw gestart via `startAutoSave()` bij `initMultiplayerGame()`.
