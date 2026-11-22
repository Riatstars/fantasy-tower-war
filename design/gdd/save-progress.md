# Save & Progress

> **Status**: In Review (revised 2026-11-22, pending re-review)
> **Author**: user + Claude
> **Last Updated**: 2026-11-22
> **Last Verified**: 2026-11-22
> **Creative Director Review (CD-GDD-ALIGN)**: skipped — Lean mode
> **Implements Pillar**: none (no game-pillars.md yet)

## Summary

Save & Progress keeps one profile per device holding everything the player has earned outside a match (levels beaten, stars, conquered regions, later currencies and cards) and writes it to the device at the end of the frame of every change (one flush), safely through a temporary file with one backup. Settings live in a separate file so deleting progress keeps them. It exists so the player never presses Save and never loses a result to the phone closing the app; matches themselves are not saved.

> **Quick reference** — Layer: `Foundation` · Priority: `MVP` · Key deps: `Campaign Level Data (soft, validation only)`

## Overview

Save & Progress is the game's memory between sessions. It keeps one profile per device holding
everything the player has earned or chosen outside a match: which levels are unlocked and
beaten, the stars on each, the regions conquered, and later the currencies, unit cards, races
and god powers. It writes that profile to the device at the end of the frame of every change (a level won,
stars awarded, a setting changed) and reads it back when the app starts, so the player never
presses Save and never loses a result to the phone closing the app. A match in progress is not
part of it: matches are short and restart from their level data, as Screen Flow & Scene Manager
already decides.

The system owns the profile's shape, where it lives, how it is written safely and how an old or
damaged file is handled. It does not decide what counts as progress: World Map & Regions decides
when a level unlocks, Stars & Rewards decides how many stars a win is worth, and those systems hand
the result to Save & Progress to keep. Without it, every launch would start the campaign from its
first level.

## Detailed Design

### Core Rules

`systems-designer`, `gameplay-programmer` and `engine-programmer` not consulted — Lean mode. Review manually before production.

1. **One profile per device.** There is exactly one progress profile; no profile picker exists. A second player on the same phone shares it.
2. **Two stores, written separately:** the **progress file** (everything earned in the campaign) and the **settings file** (everything the player chose about the app: volume, mute, vibration, language if added). Deleting progress never touches settings.
3. **What the progress file holds in MVP:** a schema version; for each level id, its best result (`beaten` yes or no, best stars 0–3, best time in seconds, times played, counting wins and losses but not quits); the set of conquered region ids; the level the world map last showed, so the map opens where the player left it; `first_run_done` for the tutorial (false in a fresh profile); and the save's last-written time. Later tiers add currencies (gold, diamonds), owned and upgraded unit cards, unlocked races, the selected race and unlocked god powers. Each of those is added as its own named block by the GDD that owns it, with a schema version bump.
4. **What it never holds:** a match in progress, the current screen, the rival's state, or anything derivable from level data (which levels exist, their layouts, their star thresholds). A level is "unlocked" because the one before it is beaten; that is derived by World Map & Regions, not stored.
5. **Progress only ever grows.** Writes merge: a worse result never replaces a better one (stars, time), `beaten` never goes back to no, a conquered region stays conquered. The only way to lower anything is the explicit "Delete progress" action.
6. **Who writes:** every owning system reports its change (`record_level_result`, `record_region_conquered`, `set_map_position`, later `add_currency` and the rest); Save & Progress merges it into the in-memory profile and returns at once. **`flush()`** writes every pending change in one synchronous write and returns success or failure; it runs at the end of every frame that has pending changes, and any caller may call it at once. Writes never overlap. Level State calls `flush()` after recording a result and before asking Screen Flow for the result overlay, so a crash during the overlay loses nothing. Screen Flow never writes (its GDD, Interactions).
7. **Write safely.** Every write goes to a temporary file first, is checked to have been fully written (the engine's write calls return success since 4.4), and only then replaces the live file; the previous live file becomes the single backup. A write that fails leaves the live file and the backup untouched and is reported by `flush()` and the log; the in-memory profile keeps the change and the next flush retries it.
8. **Read on launch, once.** The profile is loaded before the Title shows and kept in memory for the session. If the live file is missing, a fresh profile is created (a new install). If it is present but unreadable or fails validation, the backup is tried; if the backup loads, the game tells the player once that progress was restored from a backup. If both fail, the damaged files are kept under a `.corrupt` name for support, a fresh profile starts, and the player is told once that progress could not be read.
9. **Schema versions.** The file carries a version number. A file older than the current version is migrated step by step on load (each step is a function from version N to N+1 written by the GDD that changed the schema) and written back. A file newer than the game understands (a downgrade) is not loaded: it is kept, a fresh profile starts in memory, writes are refused for the session, and the player is told that progress this session will not be saved (the player's decision, 2026-11-22).
10. **Validation on load:** every value must be in range (stars 0–3, times ≥ 0, level ids and region ids known to Campaign Level Data). An unknown level or region id (content removed in an update) is kept in the file but ignored, so an update that reorders content never destroys results. An out-of-range value is clamped and logged; a file that cannot be parsed at all is treated as damaged (rule 8).
11. **Delete progress** is a Settings action, offered only when Settings is opened over the Title or the World Map, never during a match (the player's decision, 2026-11-22). It needs Screen Flow's confirmation box, deletes the progress file and its backup, and starts a fresh profile at once; the settings file is kept and the app goes to the Title. There is no undo.
14. **Messages are events.** The one-time messages (restored from backup, could not be read, newer version, could not be saved) are raised as events; Screen Flow shows each as a message box (its Core Rule 12), over the Title at launch.
12. **Export and import** are not in scope. Progress lives on the device only; there is no account and no cloud copy (brief: Out of scope).
13. **Portability guard.** Nothing in the profile depends on the device (no absolute paths, no screen size), so a future cloud copy could carry the same bytes.

### States and Transitions

| State | Meaning | Leaves when |
|-------|---------|-------------|
| Not loaded | App starting; no profile in memory | Load succeeds → Loaded; live and backup both fail or the file is newer than the game → Fresh (with a one-time message) |
| Fresh | A new profile in memory, nothing on disk yet | First write → Loaded (the file now exists) |
| Loaded | Profile in memory matches the live file | A change is reported → Dirty |
| Dirty | Memory has a change the file does not | `flush()` succeeds → Loaded; fails → Dirty (retry on the next flush, and on app-to-background) |
| Migrating | An older file is being upgraded step by step | Last step done and written back → Loaded; a step fails → the file is treated as damaged (rule 8) |

Deleting progress goes from any state to Fresh. The settings file has the same states, kept separately.

### Interactions with Other Systems

**Direction rule.** Save & Progress never calls another system. Owning systems call it to record a change and to read the profile; it answers with the merged profile and a write result. That keeps it a foundation with no upstream dependency.

| System | Direction | Data | Interface owner |
|--------|-----------|------|-----------------|
| World Map & Regions | both | In: `record_region_conquered(region)`, `set_map_position(level)`. Out: per-level results and conquered regions, from which it derives unlocks | World Map & Regions owns the unlock rule; Save & Progress owns the stored shape |
| Level State & Match Flow | in | `record_level_result(level, stars, time)` on a win (it counts the play) or `record_level_played(level)` on a loss, then `flush()`, before it asks Screen Flow for the result overlay. A quit records nothing | Level State decides what a result is; Save & Progress merges it |
| Stars & Rewards (Vertical Slice) | in | The star count for a win; later gold and diamonds through `add_currency` | Stars & Rewards |
| Tutorial & Onboarding | both | In: `set_first_run_done()`. Out: `first_run_done` | Tutorial |
| Settings (Vertical Slice) | both | In: every setting change. Out: the settings on launch. Also the "Delete progress" action | Settings owns the values; Save & Progress owns the file |
| Currencies & Economy, Unit Cards & Upgrades, Faction Collection & Unlocks (later) | both | Each adds its own named block and a schema migration step | Each owning GDD |
| Screen Flow & Scene Manager | out | The one-time message events, which Screen Flow shows as message boxes; it reads and writes nothing here; the confirmation box for Delete progress is its UI | Save & Progress raises; Screen Flow shows |
| Mobile Platform Integration | in | App-to-background event: if the profile is Dirty from a failed write, retry once | Mobile Platform Integration reports; Save & Progress retries |
| Menus & Screens | out | Draws the message boxes Screen Flow opens for the one-time messages | Menus & Screens draws |

## Formulas

None. This system defines no numeric rule a balance pass would tune. Its numbers are structural: the schema version (an integer that only rises), one backup copy, and the ranges it validates (stars 0–3, times ≥ 0), which are owned by Stars & Rewards and Level State. The merge rule in Core Rule 5 is a comparison (keep the better of two results), not a formula.

## Edge Cases

`systems-designer` not consulted — Lean mode. Review manually before production.

**Writing**
- **If the device is out of space or the write fails for any reason**: the live file and backup are untouched; the change stays in memory (Dirty); the caller is told the write failed; the failure is logged. The next reported change retries, and the app-to-background event retries once. The player sees no error unless the retry on background also fails, when the one-time message "Progress could not be saved" is raised and Screen Flow shows it over the next screen.
- **If the app is killed between the temporary write and the replace**: the live file is still the previous good one; the temporary file is deleted on the next launch. At most the last reported change is lost, never the file.
- **If two changes are reported on the same frame** (a level result and a region conquered): both are merged in memory, then the end-of-frame flush writes once with both.
- **If a change is reported after a flush in the same frame**: it is merged and written by the next flush (the end of that frame); flushes are synchronous, so writes never overlap.
- **If a worse result is reported** (fewer stars, a slower time, `beaten` false after true): the stored result stays; `times played` still rises; the write still happens.
- **If the same result is reported again**: only `times played` rises, and that change is written. A report that changes nothing at all causes no write.
- **If a quit ends the match**: nothing is reported and nothing is written.

**Reading**
- **If the live file is missing and the backup exists** (an interrupted first replace): the backup is loaded, no message is shown, and the next write creates a live file again.
- **If the live file loads but the backup is missing or damaged**: normal play; the next write creates a fresh backup.
- **If both files are damaged**: both are renamed with a `.corrupt` suffix and the time (at most the 3 newest pairs are kept; older ones are deleted), a fresh profile starts, and the message "Your progress could not be read and has been reset" shows once.
- **If the file is from a newer version** (the game was downgraded): not loaded, kept as is, a fresh profile starts in memory, and the message "This save is from a newer version of the game. Progress this session will not be saved." shows once. Every write is refused for the session, so the newer file is never overwritten.
- **If a migration step fails halfway**: the original file is untouched (migration works on a copy); the file is treated as damaged (backup, then fresh).
- **If the file contains a level or region id the game no longer has**: the entry is kept untouched and ignored by validation; it is written back unchanged.
- **If a value is out of range** (stars 5, time negative): clamped to the nearest valid value and logged; not treated as damage.
- **If the file is larger than expected** (a tampered or bloated file over `save_size_warning_kb`, 1,024 in the data file): loaded if it parses, since size alone is not damage; the limit is a log warning only.

**Delete and reset**
- **If Settings is opened from Pause**: Delete progress is not offered (Rule 11), so progress can never be deleted during a match.
- **If Delete progress is confirmed and the file cannot be deleted** (locked): the in-memory profile is still reset and an overwrite is attempted on the next write; if that fails, the player sees the write-failure message.
- **If the app is uninstalled**: the operating system removes the files; there is no cloud copy. The brief lists cloud save as out of scope.

**Open, owned by other GDDs** (not decided here):
- What a "best time" means when the level was won with a revive or power (Stars & Rewards).
- Whether settings sync between devices (no, until accounts exist).

## Dependencies

Screen Flow & Scene Manager's GDD exists and agrees with this one (it shows the message boxes and the Delete confirmation, writes nothing here; matches are not saved). Every other system below has no GDD yet, so its contract is provisional until it is written and the two sides are checked.

### Depends on (upstream)

None. The level and region ids used for validation come from Campaign Level Data at load time, through a lookup it registers; Save & Progress does not read that system's files.

| System | Kind | What this system needs | Status |
|--------|------|------------------------|--------|
| Campaign Level Data | Soft | The set of known level ids and region ids, for validation only. Without it, validation of ids is skipped and all ids are kept | Provisional |

### Depended on by (downstream)

| System | Kind | What it takes from this system |
|--------|------|-------------------------------|
| World Map & Regions | Hard | Per-level results and conquered regions, to derive unlocks; `set_map_position` |
| Level State & Match Flow | Hard | `record_level_result` (win), `record_level_played` (loss) and `flush()` before the result overlay |
| Screen Flow & Scene Manager | Soft | The one-time message events |
| Stars & Rewards (Vertical Slice) | Hard | Star storage; later `add_currency` |
| Settings (Vertical Slice) | Hard | The settings file and the Delete progress action |
| Tutorial & Onboarding (Vertical Slice) | Soft | `first_run_done` |
| Mobile Platform Integration (Vertical Slice) | Soft | The retry on app-to-background |
| Currencies & Economy, Unit Cards & Upgrades, Faction Collection & Unlocks (Alpha) | Hard | Their own blocks and migration steps |
| Menus & Screens | Soft | Draws the message boxes |

### Consistency to fix

- `systems-index.md` lists World Map & Regions, Currencies & Economy, Mobile Platform Integration, Unit Cards & Upgrades and Faction Collection & Unlocks as depending on Save & Progress. It does not yet list Level State & Match Flow, Stars & Rewards, Settings, Tutorial & Onboarding or Menus & Screens; add them when those GDDs are written.
- Level State & Match Flow's GDD must record the result here and call `flush()` **before** asking Screen Flow for the overlay (Core Rule 6), call `record_level_played` on a loss only, record nothing on `match_quit`, and define what the result record holds so this GDD's stored shape matches it.
- Screen Flow's GDD says "Progress is written by Level State and Stars & Rewards before the result overlay opens": consistent with Core Rule 6.

## Visual/Audio Requirements

A short note only, since this is a Persistence system with no visible feedback of its own.

- No "Saving…" spinner and no save icon: writes are immediate and small, and showing one would suggest the player could lose something by acting too soon.
- The one-time messages (restored from a backup; could not be read; newer version; could not be saved) are Screen Flow's message boxes, drawn by Menus & Screens, each with one Continue button. No sound of their own.

## Game Feel

The player should never think about saving. The feel targets are absence targets:

- A write never delays the result overlay or a screen change by a visible amount (AC22: under 50 ms).
- No menu item named Save or Load exists anywhere.
- Coming back after days, the World Map opens on the last level the player looked at, with every star where they left it.

## UI Requirements

- **Delete progress**: one entry in Settings, followed by Screen Flow's confirmation box with the text "Delete all progress? Stars and conquered regions will be lost. Settings are kept." Yes deletes at once and the app goes to the Title; No is the default and matches Back. Not offered when Settings is opened from Pause.
- **Three launch messages**, each Screen Flow's message box with one Continue button, shown over the Title one at a time: "Your progress was restored from a backup." / "Your progress could not be read and has been reset." / "This save is from a newer version of the game. Progress this session will not be saved."
- **Write-failure message**, shown once per session over the next screen if the retry on background also failed: "Progress could not be saved. Check free space on your device."

> **UX Flag — Save & Progress**: This system has UI requirements. In Pre-Production, run `/ux-design` for the Settings entry, the confirmation box and the message boxes before writing epics. Stories that reference UI should cite `design/ux/[screen].md`, not this GDD directly.

## Cross-References

Screen Flow & Scene Manager's GDD exists and is checked against this one; every other referenced GDD is still to be written and its entry is provisional.

| This GDD uses | Owned by | Item |
|---------------|----------|------|
| Matches are not saved; the current screen is not saved; Screen Flow writes nothing | Screen Flow & Scene Manager | Its Core Rules 7 and 9 and Interactions; this GDD's Rule 4 agrees |
| The confirmation box; the message box; `match_quit` | Screen Flow & Scene Manager | Delete progress (Rule 11); messages (Rule 14); quits record nothing |
| The result record (stars, time) and the moment it is recorded | Level State & Match Flow | Rule 6, AC20 |
| Star counts and their range 0–3 | Stars & Rewards | Validation (Rule 10) |
| Unlock rule (beaten → next unlocked) and map position | World Map & Regions | Rule 4, AC21 |
| Known level and region ids | Campaign Level Data | Validation (Rule 10) |
| Setting values; the Delete progress entry | Settings | Rules 2, 11 |
| First-run flag | Tutorial & Onboarding | Rule 3 |
| App-to-background event | Mobile Platform Integration | Retry (Interactions) |
| Message boxes | Menus & Screens | UI Requirements |
| `FileAccess.store_*` return `bool` since 4.4 | `docs/engine-reference/godot/breaking-changes.md` | Rule 7 (check every write) |

## Acceptance Criteria

Section D defines no formulas, so the criteria come from Sections C and E alone. Tags: **[Logic]** automated unit test with an in-memory or temporary-folder file system; **[Integration]** automated test with the named system; **[Device]** checked on the target phone; **[Visual]** screenshot or playtest.

**Core rules**

- **AC1 [Logic] (Rule 1, 8)**: GIVEN a fresh install (no files), WHEN the app launches, THEN a fresh profile is in memory with no level beaten, no region conquered and `first_run_done` false, and no message is raised.
- **AC2 [Logic] (Rules 3, 6)**: GIVEN a fresh profile, WHEN Level State records level 3 won with 2 stars in 95 s and calls `flush()`, THEN `flush()` returns success and the live file exists and contains level 3 as beaten with 2 stars, 95 s and 1 play.
- **AC3 [Logic] (Rule 5)**: GIVEN level 3 stored with 3 stars and 80 s, WHEN a win with 1 star and 120 s is recorded, THEN the file still holds 3 stars and 80 s, and plays is 2.
- **AC4 [Logic] (Rule 5)**: GIVEN region 1 conquered, WHEN any later change is recorded, THEN region 1 is still conquered; there is no call that un-conquers a region.
- **AC5 [Logic] (Rule 2, 11)**: GIVEN progress and a volume setting of 30%, WHEN Delete progress is confirmed, THEN the progress file and backup are gone, a fresh profile is in memory, the volume is still 30%, and the app goes to the Title. GIVEN Settings opened from Pause, THEN Delete progress is not offered.
- **AC6 [Logic] (Rule 4)**: GIVEN a profile after a won level, THEN the file contains no match state, no screen name and no level layout; a schema listing confirms only the blocks in Rule 3.
- **AC7 [Logic] (Rule 7)**: GIVEN a live file with result A, WHEN result B is written, THEN the live file holds B and the backup holds A; WHEN C is written, THEN live holds C and backup holds B (exactly one backup).
- **AC8 [Logic] (Rule 7)**: GIVEN the file system refuses writes, WHEN a result is recorded and flushed, THEN the live file and backup are unchanged, `flush()` reports failure, the profile is Dirty, and WHEN writes are allowed again and any change is recorded, THEN the file holds both changes.
- **AC9 [Logic] (Rule 8)**: GIVEN a live file with unreadable bytes and a valid backup, WHEN the app launches, THEN the backup's profile is loaded and the "restored from a backup" message is raised exactly once.
- **AC10 [Logic] (Rule 8)**: GIVEN both files unreadable, WHEN the app launches, THEN both are renamed with a `.corrupt` suffix, a fresh profile starts, and the "could not be read" message is raised once.
- **AC11 [Logic] (Rule 9)**: GIVEN a file at schema version 1 and a game at version 3, WHEN it loads, THEN migration steps 1→2 and 2→3 run in order, the profile is valid, and the file is written back at version 3 with the version 1 file kept as the backup.
- **AC12 [Logic] (Rule 9)**: GIVEN a file at version 4 and a game at version 3, WHEN it loads, THEN the file is untouched, a fresh profile starts in memory, the "newer version … will not be saved" message is raised once, and no flush in that session writes any file.
- **AC13 [Logic] (Rule 10)**: GIVEN a file with stars 5 on one level and a level id the game does not know, WHEN it loads, THEN the stars read 3, a log line names the clamp, and the unknown level entry (and an unknown region id) is still present after the next write.
- **AC14 [Logic] (Rule 13)**: GIVEN the file bytes from one device, WHEN loaded on another with a different screen size and install path, THEN the profile is identical.

**Edge cases**

- **AC15 [Logic]**: GIVEN a level result and a region conquered reported on the same frame, THEN exactly one write happens (the end-of-frame flush) and the file holds both.
- **AC16 [Logic]**: GIVEN a change recorded after an explicit `flush()` in the same frame, THEN it is written by the end-of-frame flush, the file ends holding both, and no two writes overlap.
- **AC17 [Logic]**: GIVEN the live file missing and a valid backup, WHEN the app launches, THEN the backup loads with no message and the next write recreates the live file.
- **AC18 [Logic]**: GIVEN a migration step that throws, THEN the original file is unchanged and the load follows the damaged-file path (AC9 or AC10).
- **AC19 [Logic]**: GIVEN the same result recorded twice, THEN the second call raises plays to 2 and writes once more; no other field changes.
- **AC25 [Logic] (Rule 3; plays)**: GIVEN level 2 at 1 play, WHEN a loss is recorded (`record_level_played`), THEN plays is 2 and `beaten` is unchanged; WHEN a match is quit, THEN nothing is recorded and no write happens.

**Cross-system, device and feel**

- **AC20 [Integration: Level State & Match Flow]**: GIVEN a won match, THEN `record_level_result` and `flush()` complete before Screen Flow's result overlay opens, and killing the app during the overlay loses no result.
- **AC21 [Integration: World Map & Regions]**: GIVEN level 3 beaten in the file, WHEN the World Map opens, THEN level 4 is unlocked and the map is centred on the stored map position.
- **AC22 [Integration: Mobile Platform Integration] [Device]**: GIVEN a Dirty profile from a failed write, WHEN the app goes to the background, THEN one retry happens; on the target phone, a write of a full MVP profile completes in under 50 ms (target to confirm).
- **AC23 [Device]**: On the target Android and iOS devices, progress survives closing the app from the recent-apps list, a reboot, and an update of the app to a build with the same schema version.
- **AC24 [Visual]**: Retained screenshots in `production/qa/evidence/` show each of the four one-time messages (as message boxes) and the Delete progress confirmation.

**Coverage check:** every core rule (1–14) has at least one criterion (Rule 14 through AC9, AC10, AC12 and Screen Flow's AC23); each edge case that could ship broken has its own; no formula exists to cover. Cross-system: AC20, AC21, AC22.

## Open Questions

| # | Question | Owner | Resolve by |
|---|----------|-------|------------|
| 1 | File format and location (JSON under `user://`, ConfigFile, or a Resource) and whether to obfuscate the file against casual editing. An architecture decision, not a design one | technical-director | Technical Setup: `/architecture-decision` |
| 2 | The engine reference has no Core module: `user://` behaviour on Android and iOS, atomic rename, and write cost on a phone are unverified on 4.7 | technical-director | Before the first phone build |
| 3 | Closed (2026-11-22): "times played" counts wins and losses; quits are not counted (the player's decision) | — | — |
| 4 | Is a single backup enough, or keep the last three? One is chosen for simplicity | gameplay-programmer | After the first mobile playtest |
| 5 | Cloud save and accounts are out of scope. Rule 13 keeps the file portable so they can be added without a migration | producer | When the brief changes |
| 6 | Whether unknown level ids kept in the file should be pruned after N versions, to stop the file growing across content updates | gameplay-programmer | Alpha |
