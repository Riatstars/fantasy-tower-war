# Tower War: Danh sách việc còn lại

> Tạo: 2026-11-22. Nguồn: `production/session-state/active.md`, `design/gdd/systems-index.md`, Open Questions của các GDD đã viết, các bước của rigor `standard`.
> Cập nhật 2026-11-22: phạm vi bản UAT (20 hệ thống), art bible, review GDD, gate check.
> Cập nhật 2026-11-22 (tối): 13 GDD UAT-1 Approved; `/test-setup` xong và CI chạy; `/gate-check technical-setup` = FAIL (thiếu 7 GDD).
> Đánh dấu `[x]` khi xong. **(bạn)** = chỉ bạn quyết hoặc làm được.

## A. Dọn dẹp và việc dở dang
- [x] **Commit** (4cad5aa, 2026-11-22) · còn lại sau đó: save-progress.md, systems-index, active.md, task-list: CLAUDE.md, `project.yaml`, `project.godot`, `technical-preferences.md`, `VERSION.md`, `game-brief.md`, `game-concept.md`, 3 GDD, `systems-index.md`, registry, `docs/consistency-failures.md`, file này
- [ ] Ghi `production/project-stage-report.md` (đã đồng ý, chưa ghi)
- [x] Cập nhật `design/gdd/game-concept.md` theo phạm vi mới: các tộc, thẻ lính, vàng, kim cương; IAP và quảng cáo sau UAT; thêm Pillars và Visual Identity Anchor (2026-11-22)
- [x] Cập nhật `design/game-brief.md`: IAP và quảng cáo sang bước 4 (sau UAT); build order mới (2026-11-22)
- [x] Đổi git remote: origin = https://github.com/Riatstars/fantasy-tower-war (đã push main 2026-11-22); template = repo framework
- [x] (xong, commit c907aff, 2026-11-22) Commit thay đổi cài Godot từ phiên kia: `project.yaml`, `project.godot`, `docs/engine-reference/godot/VERSION.md`, các file `.gdignore`; thêm `.godot/` vào `.gitignore`

## B. Môi trường Godot
- [x] Cài Godot 4.7.2 (`engine.path` trong `project.yaml`) **(bạn)**
- [ ] Cài export templates 4.7.2 **(bạn)**
- [x] Đặt đường dẫn editor cho `commands.*`: `test`, `run`, `smoke` dùng đường dẫn đầy đủ (2026-11-22); `build` còn chờ export preset (dòng dưới)
- [ ] Tạo export preset Android/iOS rồi đặt `commands.build`
- [x] Chạy import để kiểm tra `project.godot`: `--headless --import` exit 0 (2026-11-22); `project-coherence.sh` = 6 MATCH, 0 DIFFERS

## C. Quyết định thiết kế cần chốt **(bạn)**
- [x] F6 (Input): giới hạn ngang = keep_hit_radius (78 px), chốt 2026-11-22
- [x] Phạm vi bản đầu: bản UAT offline, 20 hệ thống (13 cốt lõi + lớp quân đội); IAP và quảng cáo sau UAT (2026-11-22)
- [x] Chia UAT thành hai bước (người chơi, 2026-11-22): UAT-1 = 13 hệ thống cốt lõi; UAT-2 = lớp quân đội (7 hệ thống); không có hạn chót cho cả hai. Ở UAT-1 mọi keep gửi lính cơ bản; thắng màn chỉ mở nút kế tiếp (sao và vàng thuộc UAT-2)
- [x] Kim cương kiếm bằng cách nào khi không có IAP? Phần thưởng cố định khi chinh phục một vùng (2026-11-22)
- [x] Vàng chia thế nào giữa nâng thẻ lính và nâng sức mạnh thần? Bản UAT: vàng chỉ để nâng thẻ; sức mạnh thần làm sau UAT
- [ ] Đối thủ có chọn tộc không? Mỗi vùng một tộc? (GDD Factions)
- [ ] Cả 5 tộc (người, ma thú, elf, tinh linh, rồng) có vào bản UAT không? (GDD Factions)
- [ ] Troop Generation: lệch pha timer ban đầu? Giữ việc reset timer khi chiếm keep? (Open Questions 1, 2; GDD ghi: chốt khi có bản chơi Godot đầu tiên)
- [x] Screen Flow: Restart giữ bước xác nhận (quyết định 2026-11-22 khi thiết kế Menus & Screens; Restart bỏ cả trận như Quit, một chạm nhầm không được làm mất 2 phút chơi)

## D. Review độc lập (mỗi file ở một phiên Claude Code mới)
- [x] Review lần 1 của 6 GDD (2026-11-22): cả 6 NEEDS REVISION, đã sửa, đang In Review (log trong `design/gdd/reviews/`)
- [x] `/design-review design/gdd/game-concept.md` lần 1 (2026-11-22): NEEDS REVISION, 3 điểm chặn đã sửa
- [x] `/design-review design/gdd/game-concept.md` lần 2 (2026-11-22): APPROVED. Còn lại: commit
- [x] Level State & Match Flow GDD ghi ngoại lệ cho Troop Generation rule 5: màn 1 đồng hồ bắt đầu khi người chơi thắt sợi dây đầu tiên (`wait_for_first_rope`; troop-generation.md AC26)
- [x] `/design-review design/gdd/troop-marching-clashes.md`: Approved (2026-11-22)
- [x] Review lại 6 GDD đã sửa: troop-generation, screen-flow-scene-manager, touch-mouse-input, save-progress, keep-levels, rope-links: cả 6 Approved (2026-11-22)
- [x] Cả 13 GDD UAT-1 Approved (commit dbe343b, 2026-11-22). 2 agent kiểm tra lại 5 bản re-review của phiên 7a: đồng ý cả 5 kết luận; tìm thêm lỗi cạnh dưới B2/B6 của Campaign Level Data (đã sửa: B2 113 ≤ y ≤ 1.202, B6 213 / 1.142, `longest_rope` 1.226 px). Báo cáo: scratchpad phiên này `verify/`
- [ ] Sửa nhãn "Alpha" còn sót: systems-index đã ghi MVP, nhưng `screen-flow-scene-manager.md` dòng 37, 124, 137 vẫn ghi Faction Collection và màn nâng thẻ vào "Alpha" (đúng là UAT-2 / MVP, quyết định 2026-11-22). Giữ Alpha cho God & Goddess Powers, Guardian Castles, Accessibility
- [ ] Việc ghi lại cho lượt sửa sau (không chặn): Keep Levels AC15 (thứ tự clamp: margin phải về 0 sau khi `lv3_at` bị clamp) và F2 `prev` ở bước chiếm keep; Rope Links AC21 ("no Active rope" ngược rule 10 / AC23) và F2 (thiếu pawn cuối của dây Cutting); troop-marching-clashes.md dòng 275 (cùng lỗi AC21); cùng 69 đề xuất đã ghi trong các review log
- [x] Không có hạn chót cho UAT (người chơi, 2026-11-22); thay cho ngày 30/11 đã ghi trước đó cùng ngày
- [x] Quyết định (2026-11-22): chọn phương án A (chia UAT-1/UAT-2); sau đó bỏ hạn 30/11, không có hạn chót. Ước tính tham khảo của Claude cho UAT-1: 6 GDD còn lại ≈ 15–20 phiên, Technical Setup 2–3 ngày, code 2–3 tuần, test 1 tuần
- [x] (không còn cần: không có hạn chót) đo tốc độ làm việc để chỉnh ngày
- [x] Thứ tự GDD cho UAT-1: Level State & Match Flow → Rival AI → Campaign Level Data → World Map & Regions → Level HUD → Menus & Screens (xong cả 6); lớp quân đội để sau

## E. GDD cho bản UAT (13/20 xong, còn 7), theo thứ tự thiết kế
- [x] 1–6. Troop Generation, Screen Flow, Touch & Mouse Input, Save & Progress, Keep Levels, Rope Links
- [x] 7. Troop Marching & Clashes (hợp đồng `UnitStats`; viết 2026-11-22)
- [x] 8. Level State & Match Flow
- [ ] 9. Unit Roster & Stats (đang viết ở phiên khác: `design/gdd/unit-roster-stats.md`, In Design, chưa commit)
- [ ] 10. Factions
- [x] 11. Rival AI
- [x] 12. Campaign Level Data (tuân thủ khoảng cách keep I2)
- [ ] 13. Currencies & Economy (lượng kim cương mỗi vùng, giá tộc hiếm)
- [x] 14. World Map & Regions
- [ ] 15. Stars & Rewards
- [ ] 16. Unit Cards & Upgrades
- [ ] 17. Faction Collection & Unlocks
- [x] 18. Level HUD
- [x] 19. Menus & Screens
- [ ] 20. Collection & Upgrade Screens
- [ ] `/consistency-check` sau mỗi GDD

## F. Hoàn tất Concept và Systems Design
- [x] `/art-bible`: mục 1–4 (2026-11-22; mục 5–9 làm sau)
- [x] `/gate-check systems-design`: PASS ở lần chạy lại thứ 3 (`production/gate-checks/2026-11-22-systems-design-rerun-3.md`)
- [x] `/review-all-gdds` cho 13 GDD UAT-1: CONCERNS, 0 điểm chặn (`design/gdd/gdd-cross-review-2026-11-22.md`)
- [ ] `/review-all-gdds` lại cho cả 20 GDD bản UAT, khi 7 GDD còn lại đã qua `/design-review`
- [ ] `/gate-check technical-setup`: lần 1 = FAIL (2026-11-22, `production/gate-checks/2026-11-22-technical-setup.md`): thiếu 7 GDD MVP. Chạy lại sau dòng trên

## G. Technical Setup
- [ ] `/create-architecture`
- [ ] `/architecture-decision`: quản lý scene/overlay, xử lý input và đa chạm, định dạng save, nạp config và kiểm tra bất biến
- [ ] `/architecture-review`, rồi `/create-control-manifest`
- [ ] `/ux-design`: accessibility requirements và interaction patterns
- [x] `/test-setup`: gdUnit4 6.2.2 trong `addons/gdUnit4/`, `tests/`, CI `.github/workflows/tests.yml`, test đầu tiên Troop Generation F1/F2 (commit 877ec76, 2026-11-22). CI trên GitHub: 5/5 pass; coherence 0 DIFFERS
- [ ] `/gate-check pre-production`

## H. Pre-Production
- [ ] `/ux-design` cho HUD, keep plaque, preview dây, các màn và lớp phủ (UX Flag từ các GDD; systems-index ghi: world-map, level-hud, menus)
- [ ] `/create-epics`, rồi `/create-stories`, rồi `/sprint-plan`
- [ ] `/gate-check production`

## I. Sau bản UAT
- [ ] GDD Vertical Slice (5): Settings, Audio, Feedback & Juice, Tutorial & Onboarding, Mobile Platform Integration
- [ ] GDD Alpha (3): God & Goddess Powers, Guardian Castles, Accessibility
- [ ] Bản store: in-app purchase và quảng cáo
- [ ] Art bible mục 5–9 (nhân vật, môi trường, UI/HUD, chuẩn asset, tham chiếu)
- [ ] Cân bằng tiếp: chỉnh trên prototype (`prototypes/tower-war/config.js`) hoặc `/balance-check` khi đã có GDD
