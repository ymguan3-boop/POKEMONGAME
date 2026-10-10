# V5 3D 擂台整合驗收紀錄

基準分支：`feature/v5-3d-turn-battle`。本紀錄只涵蓋截至提交時能透過 GitHub 連接器取得並做程式邏輯檢查的項目。

## 已執行的檢查

- 針對 `battle-core.js` 與 `progress.js` 使用 V8 執行了 `tests/battle-core.test.cjs` 與 `tests/battle-save-migration.test.cjs` 的 JavaScript 測試邏輯，**17/17 通過**。這不是 `node --test` 指令在本機完整儲存庫執行的紀錄；Codex 合併前須在完整專案重跑正式 Node 測試。
- 已用 JavaScript 語法解析檢查所有新增的 JS 模組、NPC、圖鑑、遷移程式及 V5 `index.html` 的 11 組內嵌 script，均未發現語法錯誤。
- 確認程式中有兩個獨立 `window.confirm()` 才會進行 V5 重置，且成功重置會留下乾淨 V5 記號，避免 V4 fallback 自動重生已刪除的 V5 進度。
- 圖鑑未捕捉項目已改成**不建立 `img`、不載入原圖**，僅顯示所有物種相同的暗色鎖定方塊。

## A01–A18 狀態

| ID | 狀態 | 說明 |
|---|---|---|
| A01 | PASS（邏輯） | 隊伍不足三隻時不合法。 |
| A02 | PASS（邏輯） | 入門卡牌數量無法解除捕捉資格限制。 |
| A03 | PASS（邏輯）；視覺待測 | 只有三種不同捕捉物種合法，隊伍遷移會去除重複。 |
| A04 | PASS（邏輯） | V5 catalog 外的舊物種不可出戰。 |
| A05 | NOT RUN | 61 種模型逐一載入與動畫尚未跑實際瀏覽器。 |
| A06 | PASS（邏輯） | 屬性 1.5 倍、減傷 50%、防禦消耗驗證。 |
| A07 | PASS（邏輯） | 特殊技能冷卻兩個自身指令回合。 |
| A08 | PASS（邏輯） | 主動換人耗動作，強制換人免費。 |
| A09 | NOT RUN | 真正雙指、重複觸控、背景切換需瀏覽器 QA。 |
| A10 | PASS（部分邏輯） | 三隻 KO 勝利與放棄測試通過；40 回合平手需更多測試。 |
| A11 | NOT RUN | 真實 3D 首勝獎勵、地圖生成與親自捕捉未端對端驗收。 |
| A12 | PASS（存檔邏輯） | 舊 `cardWins`、捕捉與 pending 旗標保留，不當作未解鎖。 |
| A13 | NOT RUN | 模型錯誤及 pending 地圖生成重試需真實環境驗收。 |
| A14 | NOT RUN | 場景恢復程式已寫，尚未實際擷取手機流程證據。 |
| A15 | NOT RUN | 四座原本道館與野外捕捉需要完整端對端回歸。 |
| A16 | NOT RUN | 新增 `tools/qa-v5-battle.cjs` 規劃三種直立解析度測試，但未實際啟動 Playwright。 |
| A17 | NOT RUN | 長時間五場、FPS、WebGL context、記憶體實測待補。 |
| A18 | 待 PR diff 確認 | 變更均限定 V5、新增 V5 專用測試/工具及首頁 V5 說明；合併前須跑比較確認。 |

## Codex 待執行命令

```bash
node tools/serve-v5.cjs
node --test tests/battle-core.test.cjs tests/battle-save-migration.test.cjs
node tools/qa-v5-battle.cjs
node tools/qa-v5-mobile.cjs
node tools/qa-v5-remodel-ui.cjs
node tools/qa-v5-integration.cjs
git diff --name-only main...HEAD
```

如未安裝 Playwright，可透過 `V5_PLAYWRIGHT_MODULE` 指定安裝路徑。實際 Android/iOS 仍需人工驗收。**以上 NOT RUN 不得在無測試證據情況下改標 PASS；沒有完成 A05/A11/A14/A15/A16/A17 前不建議合併部署。**
