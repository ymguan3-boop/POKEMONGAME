# POKEMONGAME

寶可夢 3D 互動遊戲的存放空間，使用 Three.js 建置，並透過 GitHub Pages 免費公開遊玩。

## 資料夾說明

| 資料夾 | 內容 |
| --- | --- |
| `寶可夢3D-V1/` | 關都風格的單檔 3D 探索、捕捉、進化解放與傳奇寶可夢收集遊戲。 |
| `寶可夢3D-V2/` | 城都風格的單檔 3D 探索、捕捉、進化解放與傳奇寶可夢收集遊戲。 |
| `寶可夢3D-V3/` | 豐緣風格的單檔 3D 探索、捕捉、進化解放與 2 座道館挑戰遊戲。 |
| `寶可夢3D-V4/` | 神奧夏日 3D 開放地圖遊戲，含 44 種圖鑑、46 個 GLB 模型、4 座特殊道館與變身套裝。 |

## 遊戲與遊玩網址

- **部署網址**：<https://ymguan3-boop.github.io/POKEMONGAME/>

### 寶可夢 3D-V1

V1 是「進化與傳奇」版本，收錄 22 種圖鑑項目，包含關都進化型態、夢幻、三隻傳說鳥與超夢。原始程式沒有道館與變裝套裝，核心玩法是野外探索、捕捉、進化解放與傳奇寶可夢收集。

- **遊玩網址**：<https://ymguan3-boop.github.io/POKEMONGAME/寶可夢3D-V1/>
- **遊戲檔案**：[`寶可夢3D-V1/POKEMON3D-1代.html`](寶可夢3D-V1/POKEMON3D-1代.html)
- **詳細說明**：[`寶可夢3D-V1/README.md`](寶可夢3D-V1/README.md)

### 寶可夢 3D-V2

V2 是「進化與傳奇」版本，收錄 30 種圖鑑項目，包含城都進化鏈、雪拉比與四隻傳說寶可夢。

- **遊玩網址**：<https://ymguan3-boop.github.io/POKEMONGAME/寶可夢3D-V2/>
- **詳細說明**：[`寶可夢3D-V2/README.md`](寶可夢3D-V2/README.md)

### 寶可夢 3D-V3

V3 是「道館挑戰與進化解放版」，收錄 42 種圖鑑項目，包含豐緣進化鏈、4 隻傳說／幻之寶可夢，以及皮卡丘與噴火龍兩座道館首領。

- **遊玩網址**：<https://ymguan3-boop.github.io/POKEMONGAME/寶可夢3D-V3/>
- **詳細說明**：[`寶可夢3D-V3/README.md`](寶可夢3D-V3/README.md)

### 寶可夢 3D-V4

V4 是「神奧夏日遠征版」，提供開放地圖探索、捕捉、圖鑑、傳說寶可夢、4 座特殊道館與變身套裝。

- **遊玩網址**：<https://ymguan3-boop.github.io/POKEMONGAME/寶可夢3D-V4/>
- **詳細說明**：[`寶可夢3D-V4/README.md`](寶可夢3D-V4/README.md)

## 技術

- Three.js、JavaScript、HTML、Tailwind CSS
- V1～V3 使用程式幾何與材質即時建立 3D 場景
- V4 使用 Three.js、GLTFLoader 與 GLB 模型
- 進度支援瀏覽器本機存檔；部分版本可使用 Firebase／Firestore 雲端存檔
- GitHub Actions 建置 `_site` 並透過 GitHub Pages 公開部署
