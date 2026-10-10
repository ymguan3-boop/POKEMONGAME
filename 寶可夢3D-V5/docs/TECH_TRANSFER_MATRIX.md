# 技術移植矩陣

| 外部概念 | V4 接點 | V5 實作方式 | 風險與驗證 |
|---|---|---|---|
| 固定 seed、四視角 QA | 原本無模型 QA | 自寫 Playwright GLB 載入、4+1 和骨架採樣 | 固定攝影棚不能代替遊戲視角，須同時驗 |
| Art Bible | 各模型分散風格 | 本專案 ART_DIRECTION_V5.md | 不採第一人稱或 Animal Crossing 風格 |
| Sculpt/marching cubes | 即時程序幾何 | 僅離線候選，本階段不搬入 | 避免每次載入建立全名單 |
| OpenMon Script/Event | NPC 尚未實作 | 純 JS Event/Condition/Reward/Flag adapter | 以 V4 save schema 為基準、永久旗標測試 |
| Follower | 既有小夢幻同行 | 原功能保持；NPC Companion 獨立實例層 | 不改 player controller、不加入可捕捉清單 |
| GLB骨架動畫 | getGLBAsset / Pokemon.update | 分型Skeleton + AnimationMixer | 腿翼連接、水平飛行、NaN/丟失clip與捕捉測試 |

外部控制器、UI框架、戰鬥系統、存檔格式均不移植。未使用任何外部遊戲二進位角色資產。樣板的幾何來自本機既有程序模型，輸出 GLB 後再載入驗收。
