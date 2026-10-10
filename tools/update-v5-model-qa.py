import json
from pathlib import Path
r=Path(__file__).resolve().parents[1]/'寶可夢3D-V5'
manifest=json.loads((r/'pokemon-model-manifest.json').read_text(encoding='utf-8'))
facts={}
for report in ['prototypes.json','bird-rigs.json']:
    data=json.loads((r/'qa'/report).read_text(encoding='utf-8'))
    for m in data['models']:
        facts[m['id']]=m
for m in manifest:
    mid=m['speciesId']
    if mid not in facts: continue
    f=facts[mid]
    m.update(sourceModel='authoring/models/',rigType={'piplup':'biped','bulbasaur':'quadruped','kyogre':'swimmer'}.get(mid,'flying'),actualClips=f['clips'],status='NEEDS_FIX',technicalStatus='PASS',reviewShots=f['shots'],performanceMetrics={k:f[k] for k in ['bones','meshes','triangles','bytes']})
    m['knownIssues']=['骨架與片段通過技術檢查；外觀精細度、完整捕捉演出與實體手機效能仍需驗收。']
    if mid in ['articuno','zapdos']:
        m['reviewShots']['gameplay_camera']=f'qa/{mid}-Flying-portrait.png'
        m['reviewShots']['ground_gameplay_camera']=f'qa/{mid}-GroundIdle-portrait.png'
        m['habitat']=['sky']
(r/'pokemon-model-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
lines=['# V5 模型驗收進度','', '本報告區分程式測試與美術驗收。未通過的模型維持 NEEDS_FIX，不以可載入或動畫片段存在宣稱重製完成。','', '## 本輪鳥類與手機檢查','', '- 急凍鳥與閃電鳥各 9 根骨頭、8 個動畫片段；飛行軀幹前傾約 77 度，降落回到直立。','- 正面截圖已檢查腿與身體連接；直立手機飛行與站立截圖另存 qa 目錄。','- 高空遭遇自動增加取景距離，避免飛行模型出框；手機通知縮至上方工具列區域。','- 波加曼重生會重新選擇岸邊棲地；遠距離睡眠停止動畫並移除投影。','- 以上尚不代表所有鳥類及全部 87 種模型完成。','', '## 逐種狀態','', '| 寶可夢 ID | 骨架 | 技術檢查 | 美術狀態 |','|---|---|---|---|']
for m in manifest:lines.append(f"| {m['speciesId']} | {m['rigType']} | {m.get('technicalStatus','待彙整／待驗證')} | {m['status']} |")
lines+=['','## 下一個必須完成的驗收項目','','- 其餘鳥類、四足與其他解剖類型的獨立骨架與自然動作。','- 將新增 7 種模型的既有測試證據納入清單，逐種檢查 4+1 截圖。','- 人物服裝在實際俯視、移動、丟球與變裝後的穿模檢查。','- 雷之石進化用途、完整 NPC 互動、場景品質及實體手機效能。','- 全部完成後才更新公開入口與 GitHub Pages。','']
(r/'docs/MODEL_QA_REPORT.md').write_text('\n'.join(lines),encoding='utf-8')
