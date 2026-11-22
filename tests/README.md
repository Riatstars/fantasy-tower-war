# Test Infrastructure

**Engine**: Godot 4.7 (installed 4.7.2 stable)
**Test Framework**: GdUnit4 (6.2.2, in `addons/gdUnit4/`)
**CI**: `.github/workflows/tests.yml`
**Setup date**: 2026-11-22

## Directory Layout

```
tests/
  unit/           # Isolated unit tests (formulas, state machines, logic)
  integration/    # Cross-system and save/load tests
  smoke/          # Critical path test list for /smoke-check gate
```

```
production/qa/
  evidence/       # Screenshot logs and manual test sign-off records
```

> **Manual evidence lives under `production/qa/evidence/`, not `tests/`** — that
> is where every consumer reads it.

## Running Tests

From the project root (the editor is not on PATH; `commands.test` in
`project.yaml` carries the full console-exe path):

```bash
godot --headless --path . --import
godot --headless -s -d --remote-debug tcp://127.0.0.1:0 res://addons/gdUnit4/bin/GdUnitCmdTool.gd -a res://tests --ignoreHeadlessMode -c
```

`-c` (`--continue`) runs every test. Without it gdUnit4 stops at the first
failure, so a run reports only one failing test (the exit code is the same).

Run the import first: a fresh clone has no `.godot/` class cache, and the test
run then exits 1 (`GdUnitCmdTool.gd` did not load, no test ran).

Exit codes:

| Code | Meaning |
|---|---|
| 0 | Every test passed — **unless** the output says `No test cases found`, which means nothing ran (not a pass) |
| 100 | At least one test failed |
| 101 | Every test passed, but a test leaked nodes (warning) |
| 103, 104 | gdUnit4 could not run (headless refused, Godot older than 4.3) |
| 105 | A test script does not parse |
| 1 | The runner script did not load (run the import first) |

`--remote-debug tcp://127.0.0.1:0` keeps a script error from opening the
interactive debugger; it makes every run print two `ERROR:` lines about the
remote port. Those are expected.

## Installing GdUnit4

GdUnit4 is committed in `addons/gdUnit4/` (capital U). To reinstall or upgrade:

1. Open Godot → Asset Store → search "GdUnit4" → install it
   (or extract a release from https://github.com/godot-gdunit-labs/gdUnit4/releases into `addons/gdUnit4/`)
2. Enable the plugin: Project → Project Settings → Plugins → GdUnit4 ✓
3. Restart the editor
4. Verify: `res://addons/gdUnit4/bin/GdUnitCmdTool.gd` exists (capital U)

CI uses `version: installed`, so it runs the copy committed here.

## Test Naming

Names follow the engine's language (`.claude/rules/test-standards.md`):
- **Godot**: file `[system]_[feature]_test.gd`, function `test_[scenario]_[expected]`
  — `troop_generation_rate_test.gd` → `test_level_1_keep_returns_expected_rate()`

## Story Type → Test Evidence

| Story Type | Required Evidence | Location |
|---|---|---|
| Logic | Automated unit test — must pass | `tests/unit/[system]/` |
| Integration | Integration test OR playtest doc | `tests/integration/[system]/` |
| Visual/Feel | Screenshot + lead sign-off | `production/qa/evidence/` |
| UI | Retained screenshot of each screen touched | `production/qa/evidence/` |
| Config/Data | Smoke check pass | `production/qa/smoke-*.md` |

## CI

Tests run automatically on every push to `main` and on every pull request.
A failed test suite blocks merging. If you protect `main`, require the
`Run GdUnit4 Tests` job check, not `test-results` (that check run concludes
success even when a test fails).
