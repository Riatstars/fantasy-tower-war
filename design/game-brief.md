# Game Brief: Tower War

## In your words
make a tower war where each tower generate troops and sending them to other tower to conquer them

1. Sending: about sending troop, its a mobile game so you drag on the screen connecting two tower to send troop, troop will generate periodically and tower will level up, have more connection when they have more troop, max is level 3

After play: Cần làm rõ những điểm sau, 
After play: 1, tôi muốn lượng troop được gửi đi và không làm giảm giá trị của tower, tower chỉ giảm giá trị khi bị tấn công, 
After play: 2, đối thủ chơi đang hơi nhanh, gây cảm giác bị áp đảo,
After play: 3, cho phép hai tower đang gửi quân đấu tranh với nhau, quân sẽ đụng độ và giết nhau khi gặp nhau ở giữa đường đi
After play: thêm 1 chỉnh sửa nhỏ, bản máy tính thì phải dùng chuột trái để cắt liên kiết
After play: tôi đã nhầm, khi cắt phải bấm chuột phải, khi nối bấm chuột trái và làm cho bấm box của tower to hơn để dễ thao tác
After play: để tránh việc không thể kết thúc ván, cần add thêm 2 chức năng sau
After play: 1, không giới hạn độ dài của các connection, 
After play: 2, khi giá trị của các tower đã đầy, tầm 60 điểm là max, khi tower nhận thêm lính đồng mình thì sẽ chuyển tiếp các lính đồng minh đó sang các connection tiếp theo, chứ không để những lính đến khi giá trị max bị biến mất
After play: cần không để cho 2 keep đồng minh có thể nối ngược vào nhau
After play: tốc độ generate của keep đang nhanh quá, làm cho lượng troop đối phương vào rất nhiều nhưng không làm giảm giá trị của keep được
After play: vui lòng hoàn thiện game-brief.md theo những tiêu chí sau:
After play: 1, game theo định dạng app, để sau deploy lên appstore, ch play, có in app purchase và ad 
After play: 2, game thiết kế theo phong cách pixel art anime, lấy inspiration từ rpg fantasy như lính, quái vật, thú cưỡi, triệu hồi sư, các thần, nữ thần và bảo hộ, tower/keep theo dạng barracks, castle
After play: 3, game chơi theo màn màn được sắp xếp theo một map giống trong các game fantasy và mình sẽ đi conquer từng vùng đất

**Pitch:** Rope your barracks and castles together, march soldiers, mounted knights and summoned monsters down the lines, and conquer a fantasy world region by region, level by level.

**Genre:** tower-war / real-time conquest (like Galcon, Mushroom Wars) with a level-based campaign on a world map *(inferred (strong))*

**Controls:** a mobile app, touch first: drag from your keep to another to connect them; troops then flow along the link. Swipe across a link to cut it *(guessed)*. On a computer: left mouse drags to tie; right-click on a rope, or right-drag across it, cuts it. Keeps have a large touch area. On the world map, tap a level node to play it.

**Question:** Is building and rerouting links, as keeps grow 1→3, a fun tug-of-war for a 2–3 minute level, and does the world map make you want "one more region"?

**Hooks:** links are persistent supply lines; a keep's level (1–3) is how many links it can hold, and level comes from how many troops it holds. Each level is one territory on a fantasy world map, and each region ends at a guardian's castle.

**Intent:** payoff builds *(provisional)*: the world map fills with your banners region by region.

## Look and references
- Look: anime pixel art in an RPG fantasy world. Mood: bright, heroic, a little cute. Crisp pixel sprites with anime faces and big readable silhouettes. Keeps grow by level: level 1 a wooden barracks, level 2 a stone keep with a stable, level 3 a castle with towers and a summoning circle *(provisional)*. Troops: foot soldiers from barracks, mounted knights on horses, wolves or griffins from keeps, monsters conjured by a summoner on the castle wall *(provisional)*. Neutral keeps are held by monsters (slimes, goblins, orcs). Each region's last level is a guardian's castle (a dragon, a golem, a sea serpent). Gods and goddesses appear as big pixel portraits when their power is cast. Palette: player royal blue and gold, rival crimson and black, neutral monster green; grass, forest, snow and lava tiles per region; accent gold for level-ups. Signature: links drawn as glowing rune ropes between keeps that snap and fade when cut. Every figure drawn, no emoji, no plain circles.
- References: Galcon, Mushroom Wars 2 (the send-and-conquer loop and campaign); Tentacle Wars (persistent links); Kingdom Rush (a world map of level nodes, region by region); Fire Emblem on the Game Boy Advance (anime pixel sprites and portraits).
- View: 2D · Camera: fixed top-down, portrait phone layout, the whole level in view; the world map scrolls vertically.

## First minute
The app opens on a pixel world map with the first region, the Green Vale, lit and the rest under fog. You tap the first node. You start with one blue barracks, its soldier count ticking up; slime-held neutral keeps sit nearby. A pulsing hint shows a drag to the nearest one; you drag, a rune rope snaps between them, and soldiers march. The garrison counts down, hits zero, and flips blue with a banner pop. Your barracks grows into a keep, mounted knights ride out, and it can hold a second rope. You win, earn three stars, and back on the map the next node lights up.

## Challenge
Level 1 is a gentle race for neutrals. From level 2 the rival attacks your thinnest keep, and you must cut and reroute ropes to defend. A loss costs only a retry (a rewarded ad or gems can revive once, *(provisional)*). Each region adds more keeps, a stronger and faster rival, and new terrain; its last level is a guardian's castle with a huge garrison that strikes back *(provisional)*.

## Core loop
- Keeps generate troops over time; more troops raise the level (barracks → keep → castle, max 3), which allows more outgoing links and faster generation.
- Drag to link one of your keeps to another; troops march along it without emptying the sender (a keep only loses troops when attacked), draining an enemy or neutral garrison, or reinforcing your own.
- A garrison at zero flips to the attacker; take every keep to win the level.
- A win gives stars and gold and unlocks the next node; finishing a region conquers it on the world map, opens the next region and unlocks a god or goddess power *(provisional)*.

## Goal & fail state
- Win: own every keep in a level; conquer every region on the world map *(provisional: 5 regions of 10 levels)*.
- Lose: you own no keeps (and no troops marching); the level restarts, the map progress stays.

## Features
- [x] Drag to link two keeps; swipe to cut a link
- [x] Troops generate periodically; keeps level 1→3 by troop count; level sets max links (1/2/3) and generation speed
- [x] Sending is free: pawns march along links and the sender keeps its troops; hitting an enemy keep reduces its garrison and takes it at zero; hitting your own reinforces
- [x] Two keeps roping each other: their ropes run side by side and the marches clash and kill each other where they meet; the rival ropes back at a keep that ropes it
- [x] Neutral keeps hold a garrison and don't generate *(guessed)*
- [x] One AI rival that expands, attacks weak keeps and defends, at a calmer pace (thinks 1.8x slower; on map 1 the level clock starts at your first rope: until then no keep generates troops and the rival does nothing, decided 2026-11-22)
- [x] Ropes have no length limit: any keep can rope any keep on the map
- [x] Two allied keeps can't rope each other both ways (a rope back to an ally that already ropes you is refused)
- [x] A full keep (60 troops) relays arriving ally pawns down its own ropes, in turn, instead of losing them
- [ ] Anime pixel art: barracks / keep / castle by level, soldiers, mounted knights, summoner, monsters, guardian castles
- [ ] World map: regions of level nodes, fog of war, stars per level, region conquered on the last level
- [ ] Army: races (human, beast, elf, spirit, dragon) with unit cards; gold from level wins upgrades cards; diamonds, a fixed reward per conquered region, unlock rare races (UAT-2)
- [ ] Guardian castle at the end of each region *(provisional, after UAT)*
- [ ] God and goddess powers: one per region, cast once per level, picked before a level *(provisional, after UAT)*
- [ ] Monetisation: in-app purchases (gem packs, starter pack, remove ads) and ads (rewarded for a revive or double reward; an interstitial between levels, never in region 1) *(provisional, store build after UAT)*
- [ ] Mobile app build for the App Store and Google Play, with save of map progress on the device
- [ ] Juice: banner pop on capture, level-up flourish, rope snap and fade, marching sounds

## Your systems
- troop generation · in the slice
- tower levels (max 3) · in the slice
- connections / links · in the slice
- world map of levels, conquer region by region · in the slice
- army: races, unit cards, gold and diamonds · in UAT-2, after UAT-1 (decided 2026-11-22)
- in-app purchase · after UAT
- ads · after UAT
- gods, goddesses and guardians · after UAT

## Keep
-

## Avoid
-

## Out of scope
- Several rival colours fighting each other: change it after play
- Online versus: needs a server, not built yet — one AI rival on this device instead
- Cloud save and accounts: progress lives on the device for now
- In-app purchase and ads: build order step 4 (after UAT)
- Gods, goddesses and guardian powers: build order step 3 (after UAT)

## Build order
1. **UAT-1 build** (offline, for testing; the 13 core systems, no deadline, decided 2026-11-22): the match (link/cut, generation, levels, marching and clashes, capture, win and lose, rival AI), the world map with regions (a win unlocks the next node), save, HUD and menus, all keeps sending the baseline unit; anime pixel art for keeps, troops and monsters. **UAT-2** (no deadline, after UAT-1): the army layer (races, unit cards, gold, stars, diamonds from region conquest) and its screens.
2. Polish after UAT: juice and sound, tutorial, settings, mobile platform integration, accessibility.
3. Guardian castles and god / goddess powers.
4. Store build for the App Store and Google Play; in-app purchases and ads.

---
**Kill condition:** if managing ropes feels like busywork rather than a tug-of-war after two tuning rounds, or players stop on the world map before region 2.

**Who it's for / what they feel:** mobile players who want a quick, punchy conquest in a couple of minutes, and the pull of painting a fantasy map in their colours *(provisional)*.

**Games you love / don't:** —
