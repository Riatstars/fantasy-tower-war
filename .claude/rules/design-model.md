---
paths:
  - ".claude/skills/**"
  - ".claude/agents/**"
  - ".claude/docs/director-gates/**"
  - "studio-tests/**"
---

# Design Work Runs on Fable

**Every design skill and design agent runs on Fable** (decided by the user,
2026-11-22). Write it as the alias `model: fable`, never as a model ID: the alias
resolves to the current Fable model, Fable 5.2 today
(`.claude/docs/model-tiers.md`, the Fable row).

## The design set

Design here means creative design of every kind: game systems, levels, economy,
live ops, UX, narrative, world, writing, art and audio direction.

| Kind | Members |
|---|---|
| Agents (13) | `game-designer`, `systems-designer`, `level-designer`, `economy-designer`, `live-ops-designer`, `ux-designer`, `creative-director`, `narrative-director`, `world-builder`, `writer`, `art-director`, `audio-director`, `sound-designer` |
| Skills (19) | `/brainstorm`, `/map-systems`, `/design-system`, `/quick-design`, `/design-review`, `/review-all-gdds`, `/consistency-check`, `/balance-check`, `/propagate-design-change`, `/ux-design`, `/ux-review`, `/art-bible`, `/asset-spec`, `/reverse-document`, `/team-combat`, `/team-level`, `/team-narrative`, `/team-audio`, `/team-ui` |

The list is not derived from anything; it is kept by hand. "Design" has no
mechanical marker in a skill or agent file: a name test such as "contains
`design`" catches `/design-review` but misses `/brainstorm` and `writer`, and
it would catch `/ux-design` and `/vertical-slice`'s design steps
inconsistently. So **adding a design skill or agent obliges you to add it
here, in `model-tiers.md` and in its test spec**, in the same change.

## Rules

- **Frontmatter.** Every member of the design set declares `model: fable`. A
  new design skill or agent is created with it. No other tier is allowed for a
  member, `inherit` and `opus` included.
- **Agents are enforced; skills are not always.** An agent's `model:` always
  applies (it is the second step of the subagent model order). A skill's
  `model:` applies only when the user types `/skill-name` in Manual mode, or
  when the skill has `context: fork`. When Claude starts a design skill through
  the Skill tool, the session model runs it (`model-tiers.md`, the table at the
  top). To keep the rule in that case:
  - delegate design drafting and review inside the skill to a design-set agent,
    which is pinned to Fable; or
  - pass `model: "fable"` on any other `Agent` call that does design work.
  Never tell the user a design skill "ran on Fable" when Claude started it
  through the Skill tool and did the work itself.
- **Director gates.** A gate file for a design-set agent (`cd-*`, `ad-*`,
  `nd-*` in `.claude/docs/director-gates/`) states `Model tier: Fable`.
- **Test specs.** The agent spec for each design-set agent in
  `studio-tests/agents/` asserts `Model tier is \`fable\``, so `/skill-test`
  fails on drift. A spec that still asserts the old tier is a FAIL, not a
  PARTIAL.
- **Overrides.** `CLAUDE_CODE_SUBAGENT_MODEL_FORCE=1` in
  `.claude/settings.local.json` runs every subagent on the session's model and
  so suspends this rule for agents. Setting it is the user's choice; say so
  when it is set.
- **If Fable is unavailable** (an account or gateway that does not serve it):
  say so by name and stop before running design work on another model. Do not
  silently fall back.

## What this rule does not cover

Implementation, QA, production, release and engine agents and skills keep
their tiers in `model-tiers.md`. `/gate-check` and `/architecture-review`
stay `opus`: they are phase gates and architecture, not design.
