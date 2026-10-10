# V5 架構與資產盤點

基準：V4 `35c03c916eae26419b5554fd7fa4656b90995dd3`；Three.js r128，無 bundler。原版 44 種／46 GLB；寶可夢 GLB 均無 skin。主程式為 index.html/game.html，外部載入 runtime、Three.js、GLTFLoader、Tailwind；V5 改為同源靜態資產，不導入新框架。

現有本機改製 52 種不包含原 V4 的 28 種。依最新規格保留聯集並新增雷丘及兩條蟲系進化鏈，共 87 種。NPC 吉利蛋、小福蛋、風速狗為獨立實例，不計入此捕捉名單。原有 ID 不改名。

## 凍結範圍

WASD/搖桿、Space 蓄力放開、L/U/B/H、拖曳第三人稱視角；V4 捕捉 75/95、45/70、大師99，樹果+15且非大師上限95；道館HP100/200/160/240，球傷害10/40/90，5種基礎解放進化。保留使用者已明確要求的夢幻道館／同行與四世代名單擴充。

## 適配接點

| 原責任 | V5 局部適配 |
|---|---|
| getGLBAsset/applyPokemonGLB | 預生成含Skeleton/Clips的GLB、單模型fallback、逐隻manifest |
| buildPlayerAndModels/applyActiveSuit | 共用骨架/控制器、服裝mesh切換、AnimationMixer |
| animate 相機區塊 | 高位斜俯視CameraRig、阻尼/限距/遮擋，不用PointerLock |
| Pokemon.update/initSpawns | Habitat/FlightController適配，不改捕捉公式 |
| releaseAndThrow/resolveCaptureOutcome | Release動畫事件接原投射物，結果演出不重抽機率 |
| saveGameData/applyLoadedData | 讀取V4舊key、保留進度map、新旗標安全預設 |
| getModeLockTargets | 依instance角色排除NPC，非species黑名單 |

## 已知不合格項目

現有重製模型只有靜態合併幾何；鳥腳與軀幹有缺口；玩家動畫只有擺手腳，無Mixer；場景無資料化NPC/任務；相機低位；沒有GLB預生成、存檔遷移、4+1驗收與LOD證據。先做四種骨架樣板，再批次資產。舊QA只能證明舊功能路徑，不能視為新規格已通過。
