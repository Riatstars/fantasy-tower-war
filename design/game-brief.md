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

**Pitch:** Drag rope-links between keeps to march troops along them, grow towers to level 3 to open more links, and take every keep on the map before the rival takes yours.

**Genre:** tower-war / real-time conquest (like Galcon, Mushroom Wars) *(inferred (strong))*

**Controls:** drag from your tower to another to connect them; troops then flow along the link. Swipe across a link to cut it *(guessed)*. On a computer: left mouse drags to tie; right-click on a rope, or right-drag across it, cuts it. Keeps have a large click/touch area.

**Question:** Is building and rerouting links, as towers grow 1→3, a fun tug-of-war for a 2–3 minute map?

**Hooks:** links are persistent supply lines; a tower's level (1–3) is how many links it can hold, and level comes from how many troops it holds.

**Intent:** —

## Look and references
- Look: tactile tabletop diorama *(provisional)*. Mood: a war game on a table, warm and toy-like. Little stone keeps on a parchment-and-green-felt map; each level adds a visible storey and a bigger banner. Troops are tiny pawn figures marching single file along a rope-like link. Palette: player royal blue, rival crimson, neutral grey stone, ground parchment and felt, accent gold for level-ups; shadows cool, lights warm. Detail on keeps and banners; the map behind is quiet. Signature: links drawn as taut ropes pinned between keeps that sag when cut. Every figure drawn, no emoji, no plain circles.
- References: Galcon, Mushroom Wars (the send-and-conquer loop); Tentacle Wars (persistent links).
- View: 2D · Camera: fixed top-down, portrait phone layout, the whole map in view.

## First minute
You start with one blue level-1 keep, its troop count ticking up; grey neutral keeps sit nearby with small garrisons. A pulsing hint shows a drag to the nearest neutral; you drag, a rope snaps between them, and pawns march. The garrison counts down, hits zero, and flips blue with a banner pop. Your first keep passes the threshold and grows to level 2 — it can now hold a second rope; you link another neutral. The red rival, far off, is doing the same: the race for the middle is on.

## Challenge
Map 1 is a gentle race for neutrals. From map 2 the rival attacks your thinnest keep, and you must cut and reroute ropes to defend. A loss restarts that map. Later maps add more keeps, a stronger rival start and a faster rival *(provisional)*.

## Core loop
- Keeps generate troops over time; more troops raise the level (max 3), which allows more outgoing links and faster generation.
- Drag to link one of your keeps to another; troops march along it without emptying the sender (a keep only loses troops when attacked), draining an enemy or neutral garrison, or reinforcing your own.
- A garrison at zero flips to the attacker; cut and reroute links as the front shifts.
- Take every keep to win the map; lose all of yours and it restarts.

## Goal & fail state
- Win: own every keep on the map; a ladder of 5 maps that get harder *(provisional)*.
- Lose: you own no keeps (and no troops marching); the map restarts.

## Features
- [x] Drag to link two keeps; swipe to cut a link
- [x] Troops generate periodically; keeps level 1→3 by troop count; level sets max links (1/2/3) and generation speed
- [x] Sending is free: pawns march along links and the sender keeps its troops; hitting an enemy keep reduces its garrison and takes it at zero; hitting your own reinforces
- [x] Two keeps roping each other: their ropes run side by side and the marches clash and kill each other where they meet; the rival ropes back at a keep that ropes it
- [x] Neutral keeps hold a garrison and don't generate *(guessed)*
- [x] One AI rival that expands, attacks weak keeps and defends, at a calmer pace (thinks 1.8x slower, leaves you alone for the first 60 s of map 1)
- [x] Ropes have no length limit: any keep can rope any keep on the map
- [x] Two allied keeps can't rope each other both ways (a rope back to an ally that already ropes you is refused)
- [x] A full keep (60 troops) relays arriving ally pawns down its own ropes, in turn, instead of losing them
- [x] 5 maps with a map-select ladder, win/lose screens, restart
- [ ] Juice: banner pop on capture, level-up flourish, rope snap and sag, marching sounds

## Your systems
- troop generation · in the slice
- tower levels (max 3) · in the slice
- connections / links · in the slice

## Keep
-

## Avoid
-

## Out of scope
- Several rival colours fighting each other: change it after play
- Tower kinds (barracks, fort, archer tower): change it after play
- Online versus: needs a server, not built yet — one AI rival on this device instead
- An app store build: it runs in a phone's browser

## Build order
1. The slice: one map with player, rival and neutral keeps; link/cut, generation, levels, capture, win and lose.
2. Rival AI tuned; 5 maps on a ladder.
3. Juice and sound.

---
**Kill condition:** if managing ropes feels like busywork rather than a tug-of-war after two tuning rounds.

**Who it's for / what they feel:** mobile players who want a quick, punchy conquest in a couple of minutes *(provisional)*.

**Games you love / don't:** —
