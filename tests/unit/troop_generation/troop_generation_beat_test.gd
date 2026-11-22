extends GdUnitTestSuite
## Unit tests for Troop Generation F1 (generation beat) and F2 (generation rate).
## Design: design/gdd/troop-generation.md, Formulas F1-F2, AC2, AC4, AC13, AC22.

## Baseline data from the GDD's Acceptance Criteria preamble (the values under test).
const BASELINE := {
	"gen_amount": {1: 1, 2: 2, 3: 3},
	"gen_interval": 2.5,
	"troop_cap": 60,
}


func _beat(troops: int, level: int, troop_cap: int = BASELINE.troop_cap) -> int:
	return TroopGenerationFormulas.generation_beat(troops, BASELINE.gen_amount[level], troop_cap)


# AC2: one beat at levels 1, 2, 3 from 20 troops gives 21, 22, 23.
func test_beat_at_each_level_adds_that_levels_amount() -> void:
	# Arrange
	var start := 20

	# Act
	var results := [_beat(start, 1), _beat(start, 2), _beat(start, 3)]

	# Assert
	assert_array(results).is_equal([21, 22, 23])


# AC4: a level 2 keep at 59 beats to 60 (clamped), then stays at 60.
func test_beat_near_cap_clamps_then_holds_at_cap() -> void:
	# Arrange
	var troops := 59

	# Act
	var first := _beat(troops, 2)
	var second := _beat(first, 2)

	# Assert
	assert_int(first).is_equal(60)
	assert_int(second).is_equal(60)


# AC22 / F1 output range: above a lowered cap the beat neither adds nor removes troops.
func test_beat_above_lowered_cap_leaves_troops_unchanged() -> void:
	# Arrange
	var troops := 60
	var lowered_cap := 50

	# Act
	var after := _beat(troops, 1, lowered_cap)

	# Assert
	assert_int(after).is_equal(60)


# F1 output range: an owned keep at 0 troops still gains normally.
func test_beat_at_zero_troops_gains_normally() -> void:
	# Arrange
	var troops := 0

	# Act
	var after := _beat(troops, 1)

	# Assert
	assert_int(after).is_equal(1)


# AC13: baseline R_gen is 0.4, 0.8, 1.2 troops per second at levels 1, 2, 3.
func test_generation_rate_at_baseline_returns_expected_per_level() -> void:
	# Arrange
	var interval: float = BASELINE.gen_interval

	# Act
	var r1 := TroopGenerationFormulas.generation_rate(BASELINE.gen_amount[1], interval)
	var r2 := TroopGenerationFormulas.generation_rate(BASELINE.gen_amount[2], interval)
	var r3 := TroopGenerationFormulas.generation_rate(BASELINE.gen_amount[3], interval)

	# Assert
	assert_float(r1).is_equal_approx(0.4, 0.0001)
	assert_float(r2).is_equal_approx(0.8, 0.0001)
	assert_float(r3).is_equal_approx(1.2, 0.0001)
