# Tower War: Danh sách việc còn lại

> Tạo: 2026-11-22. Nguồn: `production/session-state/active.md`, `design/gdd/systems-index.md`, Open Questions của 3 GDD đã viết, các bước của rigor `standard`.
> Đánh dấu `[x]` khi xong. **(bạn)** = chỉ bạn quyết hoặc làm được.

## A. Dọn dẹp và việc dở dang
- [ ] **Commit** toàn bộ thay đổi chưa lưu: CLAUDE.md, `project.yaml`, `project.godot`, `technical-preferences.md`, `VERSION.md`, `game-brief.md`, `game-concept.md`, 3 GDD, `systems-index.md`, registry, `docs/consistency-failures.md`, file này
- [ ] Ghi `production/project-stage-report.md` (đã đồng ý, chưa ghi)
- [ ] Cập nhật `design/gdd/game-concept.md` theo phạm vi mới: các tộc, thẻ lính, vàng, kim cương; bỏ IAP và quảng cáo; xóa câu hỏi phạm vi cũ
- [ ] Cập nhật `design/game-brief.md`: chuyển IAP và quảng cáo sang Out of scope
- [ ] Đổi git remote: `origin` vẫn trỏ về repo template (`git remote rename origin template`, rồi `git remote add origin <repo của bạn>`) **(bạn)**

## B. Môi trường Godot
- [ ] Cài Godot 4.7.x và export templates **(bạn)**
- [ ] Đặt đường dẫn editor cho `commands.*` bằng `/project-settings`
- [ ] Tạo export preset Android/iOS rồi đặt `commands.build`
- [ ] Chạy import để kiểm tra `project.godot` (đang NOT VERIFIED)

## C. Quyết định thiết kế cần chốt **(bạn)**
- [ ] F6 (Input): thêm giới hạn khoảng cách ngang? Chốt trước khi viết Rope Links (`touch-mouse-input.md`, Open Question 1)
- [ ] Kim cương kiếm bằng cách nào khi không có IAP?
- [ ] Vàng chia thế nào giữa nâng thẻ lính và nâng sức mạnh thần?
- [ ] Đối thủ có chọn tộc không? Mỗi vùng một tộc?
- [ ] Cả 5 tộc (người, ma thú, elf, tinh linh, rồng) có vào bản đầy đủ không?
- [ ] Troop Generation: lệch pha timer ban đầu? Giữ việc reset timer khi chiếm keep? (Open Questions 1, 2)
- [ ] Screen Flow: Restart cần hai bước xác nhận có quá nặng? (Open Question 6)

## D. Review độc lập (mỗi file ở một phiên Claude Code mới)
- [ ] `/design-review design/gdd/troop-generation.md`
- [ ] `/design-review design/gdd/screen-flow-scene-manager.md`
- [ ] `/design-review design/gdd/touch-mouse-input.md`

## E. GDD còn lại cho MVP (10/13), theo thứ tự thiết kế
- [ ] 4. Save & Progress
- [ ] 5. Keep Levels (ghi thứ tự trong một bước với Troop Generation)
- [ ] 6. Rope Links (dùng F6 của Touch & Mouse Input)
- [ ] 7. Troop Marching & Clashes (định nghĩa hợp đồng `UnitStats`)
- [ ] 8. Level State & Match Flow
- [ ] 9. Rival AI
- [ ] 10. Campaign Level Data (tuân thủ khoảng cách keep I2)
- [ ] 11. World Map & Regions
- [ ] 12. Level HUD
- [ ] 13. Menus & Screens
- [ ] `/consistency-check` sau mỗi GDD

## F. Hoàn tất Concept và Systems Design
- [ ] `/art-bible`: hướng nghệ thuật pixel art anime (bắt buộc ở rigor `standard`)
- [ ] `/gate-check systems-design`: chuyển Concept → Systems Design
- [ ] `/review-all-gdds` khi xong 13 GDD MVP
- [ ] `/gate-check technical-setup`

## G. Technical Setup
- [ ] `/create-architecture`
- [ ] `/architecture-decision`: quản lý scene/overlay, xử lý input và đa chạm, định dạng save, nạp config và kiểm tra bất biến
- [ ] `/architecture-review`, rồi `/create-control-manifest`
- [ ] `/ux-design`: accessibility requirements và interaction patterns
- [ ] `/test-setup`: cài gdUnit4 (xóa dòng DIFFERS trong kiểm tra coherence)
- [ ] `/gate-check pre-production`

## H. Pre-Production
- [ ] `/ux-design` cho HUD, keep plaque, preview dây, các màn và lớp phủ (UX Flag từ 3 GDD)
- [ ] `/create-epics`, rồi `/create-stories`, rồi `/sprint-plan`
- [ ] `/gate-check production`

## I. Sau MVP
- [ ] GDD Vertical Slice (7): Settings, Currencies & Economy, Audio, Stars & Rewards, Feedback & Juice, Tutorial & Onboarding, Mobile Platform Integration
- [ ] GDD Alpha (8): Unit Roster & Stats, Factions, Unit Cards & Upgrades, Faction Collection & Unlocks, God & Goddess Powers, Guardian Castles, Collection & Upgrade Screens, Accessibility
- [ ] Cân bằng tiếp: chỉnh trên prototype (`prototypes/tower-war/config.js`) hoặc `/balance-check` khi đã có GDD
