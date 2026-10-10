# 外部來源核驗

2026-10-09。只讀取指定檔案，不安裝外部框架，不複製其資產或控制器。

| 來源 | 固定版本 | 授權核驗 | 採用與限制 |
|---|---|---|---|
| [PauliusOS/pallet-town-3d](https://github.com/PauliusOS/pallet-town-3d) | `c03c5cd0490b59ab3905bceeb02f960bd0b88ae7` | MIT | 概念重寫 |
| [MickaelVanhoutte/openmon](https://github.com/MickaelVanhoutte/openmon) | `01709fccfefcc34585b2e704d50b9000baefd52b` | package.json 宣告 MIT；無獨立 LICENSE，僅概念重寫 | 概念重寫 |
| [carpentry-liu/awesome-astra-3d](https://github.com/carpentry-liu/awesome-astra-3d) | `ad16f5fd1f2196b8e43e34d0855599a4966ff60a` | NOASSERTION | 不採用；索引或非必要候選 |
| [Akihisa-Watanabe/awesome-astra](https://github.com/Akihisa-Watanabe/awesome-astra) | `bb4a4070d11672d78bbec265cf938f0917a7db46` | 無獨立 LICENSE 確認 | 不採用；索引或非必要候選 |
| [amsminn/gpt-6-astra-smash-karts](https://github.com/amsminn/gpt-6-astra-smash-karts) | `33bcbdb2cc6180fea17e74d33c734f401b15d315` | 無獨立 LICENSE 確認 | 不採用；索引或非必要候選 |

Pallet Town 3D 的 tools/shoot-creature.mjs 與 ART_DIRECTION.md 已讀：採固定四視圖與一致性管理概念；明確排除其第一人稱/Animal Crossing 風格。CreatureMaterials/Sculpt 僅研究，未引入。

OpenMon 的 src/js/scripting/scripts.ts 已讀，包含 Svelte store/GameContext 與 setTimeout 耦合。V5 僅重寫資料化事件概念，不複製此實作。其原始碼 license 宣告不涵蓋圖像音樂。

其餘三項索引/賽車候選無必要且授權條件未完整核實，因此不採用。全部外部專案均未本機建置，不宣稱已驗證可移植；V5 不依賴其 runtime。

Three.js r128 GLTFExporter 從 https://unpkg.com/three@0.128.0/examples/js/exporters/GLTFExporter.js 取得，僅離線 authoring 使用，與現有 r128 引擎版本相同。
