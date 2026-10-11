# 寶可夢 3D-V5｜真新鎮與專屬 3D 回合制擂台

[公開遊玩（目前正式站需待 PR 合併部署）](https://ymguan3-boop.github.io/POKEMONGAME/寶可夢3D-V5/)

> 開發說明：本功能在 `feature/v5-3d-turn-battle` 分支實作。尚未合併 `main` 前，GitHub Pages 正式網址可能仍顯示原本的卡牌對戰；不要把 PR 完成誤認為正式站已更新。

## 主要玩法

- 第三人稱高斜角的真新鎮探索與野外捕捉、原四座道館均保持原有機制。
- V5 圖鑑維持 **61 種新模型**。從未成功捕捉的物種只會顯示相同的深色鎖定方塊，完全不載入其插畫/預覽圖；捕捉後顯示 Q 版卡圖、技能及模型。
- 選單的「⚔️ 寶可夢隊伍」可從**真實捕捉**的物種選擇三種不同夥伴；只持有舊卡牌或入門卡包者不得出戰。
- 找到 NPC「寶可夢對戰訓練家」（保留既有 `card-rival` 內部 ID）並主動確認挑戰，前往**獨立的 3D 競技擂台**。
- 3 對 3，雙方一次各上一隻；回合操作：**普通攻擊、特殊技能（冷卻兩次自身指令機會）、防禦（下次傷害減半）、更換夥伴**。三隻全部倒下即判負；被擊倒後可免費強制換人。
- 擂台沿用原 V5 3D 模型（GLB 與程式關節建模混合）、動畫控制器與探索的同一個 WebGL renderer，沒有新增常駐 renderer。
- 對戰時世界探索暫停，雷達、搖桿和投球等 UI 暫時隱藏；戰後回原本的真新鎮角色座標和相機角度。
- 首次正式勝利解鎖超夢、胖丁於野外出現；**仍須自行捕捉**才會加入圖鑑/隊伍。舊卡牌勝利紀錄已存在者不會重複領首次獎勵。
- 「重置進度」需要**連續兩次明確確認**；任一次取消不重置。

## 技術與存檔

- 仍用 Three.js、既有 V5 模型載入器與 `V5AnimationController`，不要求付費 API。
- 戰鬥模組：`js/battle-core.js`、`battle-data.js`、`battle-arena.js`、`battle-ui.js`、`battle-controller.js`、`css/battle3d.css`。
- 新增 `battle3d` 儲存隊伍、首發、勝敗與首次解鎖旗標，`schemaVersion` 保持 5；舊 `captureCounts`、`pokedexUnlocks`、`gyms`、`cardDeck`、`cardCollection`、`cardWins`、`worldFlags` 等欄位不得刪除。
- 舊 `js/card-battle.js` 保留供回退與資料相容，但正式選單與 NPC 均改走 3D 回合制。
- 遇到模型載入失敗時應顯示可返回真新鎮的錯誤，而非黑屏；可取消載入，不算失敗場次。

## 測試與限制

自儲存庫**根目錄**執行：

```bash
node tools/serve-v5.cjs
node --test tests/battle-core.test.cjs tests/battle-save-migration.test.cjs
node tools/qa-v5-battle.cjs
node tools/qa-v5-mobile.cjs
node tools/qa-v5-remodel-ui.cjs
node tools/qa-v5-integration.cjs
```

`tools/qa-v5-battle.cjs` 需要 Playwright/Chromium（可透過 `V5_PLAYWRIGHT_MODULE` 指定現有安裝），它的測試以本機開發伺服器 `http://127.0.0.1:4179/?qa=1` 執行，對 360×640、390×844、430×932 截圖並檢查 NPC 對戰、模型及退出後還原。瀏覽器手機模擬**不等於實際 Android/iPhone 長時間效能驗收**。

既有 `tests/card-battle.test.cjs` 仍保留測試舊版規則，但不能代表新 3D 對戰已通過；舊 `tools/qa-v5-cards.cjs` 可能預期舊卡牌 UI，若測試失敗須說明新舊功能差異，不得偽稱通過。

## 資產與詳細資料

目前 V5 收錄 61 種新模型；13 種為骨架 GLB，其餘採程式模型/關節動畫。逐種的模型美術品質及手機 GPU 效能仍需最終驗收。舊版 28 種 V4 模型只保留於存檔相容資料，不加入 V5 的圖鑑與對戰名單。

- [V5 模型來源與卡圖](cards/model-sources.json)
- [架構與資產盤點](docs/ARCHITECTURE_ASSET_AUDIT.md)
- [美術準則](docs/ART_DIRECTION_V5.md)
- [逐種模型清單](pokemon-model-manifest.json)
- [手機驗收基準](docs/MOBILE_ACCEPTANCE.md)
- [逐種模型驗收進度](docs/MODEL_QA_REPORT.md)
- [新模型與道館政策](docs/NEW_MODEL_POLICY.md)

**修改範圍：只限 V5 及必要的 V5 專屬 tests/tools，V1～V4 不修改。**

## 對戰背景與野外生成權重（本分支調整）

- **3D 擂台**：背景由淺青色改為深靛藍，地板為淺灰藍；玩家站位為青藍色、NPC 站位為珊瑚橘色，讓寶可夢模型與場地更容易區分。
- **保留的 2D 卡牌介面**：對戰模式改用高對比漸層背景，敵方卡片使用暖紅紫底、己方卡片使用青藍底。目前正式 NPC 對戰入口仍依上述 3D 擂台規則；這項改動不代表已改成正式 2D 卡戰。
- **自然野外生成**：在既有模型可用性、進化解放、雷丘解鎖與基礎稀有度篩選後，依同物種累積捕捉數套用加權：尚未捕捉 **8 倍**；已捕捉 1～2 隻 **2 倍**；已達 3 隻上限 **0.2 倍**。同基礎權重下未捕捉相對已滿額為 **40 倍**，並非固定 40 倍「實際機率」。
- **不受影響**：傳說寶可夢、道館獎勵、劇情指定出現與捕捉成功率；已存在場景中的個體不強制消失，權重作用於之後自然生成的選擇。
- **測試**：於儲存庫根目錄執行 `node --test tests/v5-spawn-priority.test.cjs`，覆蓋相對權重、既有稀有度、隨機區間、極端資料與空候選池。
