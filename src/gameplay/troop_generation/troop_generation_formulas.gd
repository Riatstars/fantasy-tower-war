class_name TroopGenerationFormulas
extends RefCounted
## Pure formulas for Troop Generation (design/gdd/troop-generation.md, F1-F2).
## Every gameplay value is passed in by the caller from the data file; none live here.


## F1. Troops after one generation beat. At or above [param troop_cap] the
## count is returned unchanged (a beat never removes troops, AC22).
static func generation_beat(troops: int, gen_amount: int, troop_cap: int) -> int:
	if troops >= troop_cap:
		return troops
	return mini(troop_cap, troops + gen_amount)


## F2. Troops gained per second at one level: [param gen_amount] / [param gen_interval].
static func generation_rate(gen_amount: int, gen_interval: float) -> float:
	return gen_amount / gen_interval
