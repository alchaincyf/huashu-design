# 版本管理系統 · Version Control

> 自動追蹤設計迭代、視覺對比、一鍵回退的版本管理系統

---

## 核心理念

設計是迭代的過程，不是一次性產出。用戶常見痛點：
- 改了 10 版，忘記 v3 和 v7 的差異
- 想回退到「昨天那版」，但文件已覆蓋
- 多個 variations 散落各處，難以對比

**版本管理系統解決**：
- 📸 每次生成自動快照（HTML + 截圖 + 參數）
- 🔄 一鍵回退到任意歷史版本
- 📊 視覺 diff 對比（並排截圖 + 參數變化）
- 🏷️ 語義化標籤（「初版」「客戶反饋後」「最終版」）

---

## 目錄結構

```
project/
├── design.html                    # 當前工作版本
├── _versions/                     # 版本歷史（自動管理）
│   ├── manifest.json              # 版本索引
│   ├── v1-2026-04-23-14-30/
│   │   ├── design.html
│   │   ├── screenshot.png
│   │   ├── metadata.json
│   │   └── tweaks-state.json      # Tweaks 參數快照
│   ├── v2-2026-04-23-15-45/
│   │   └── ...
│   └── diffs/
│       ├── v1-v2.md               # 文字 diff
│       └── v1-v2-visual.html      # 視覺對比頁
└── _versions/.gitignore           # 排除大文件
```

---

## 使用方式

### 1. 自動快照（Agent 自動執行）

每次生成新設計或重大修改時，Agent 自動調用：

```bash
node scripts/version-snapshot.js \
  --file=design.html \
  --message="初版設計" \
  --auto
```

**觸發時機**：
- 首次生成設計
- 用戶選擇某個 variation 後
- 應用 Tweaks 重大變更後（如換配色方案）
- 用戶明確說「保存這版」

### 2. 手動快照（用戶主動）

用戶可以在 HTML 裡點擊「保存版本」按鈕：

```html
<button onclick="window.__saveVersion('客戶反饋後修改版')">
  💾 保存當前版本
</button>
```

### 3. 查看版本歷史

```bash
node scripts/version-list.js

# 輸出：
# v1  2026-04-23 14:30  初版設計
# v2  2026-04-23 15:45  調整配色為暖色調
# v3  2026-04-23 16:20  增加動畫效果
# v4  2026-04-23 17:00  客戶反饋後修改版 ⭐ (tagged)
```

### 4. 視覺對比

```bash
node scripts/version-diff.js --from=v2 --to=v4

# 生成 _versions/diffs/v2-v4-visual.html
# 並排展示兩版截圖 + 高亮差異區域
```

### 5. 回退版本

```bash
node scripts/version-restore.js --version=v3

# 將 v3 的內容恢復到 design.html
# 同時創建新快照 v5（標記為「從 v3 恢復」）
```

---

## metadata.json 結構

每個版本的元數據：

```json
{
  "version": "v4",
  "timestamp": "2026-04-23T17:00:32.123Z",
  "message": "客戶反饋後修改版",
  "tags": ["milestone", "client-approved"],
  "author": "huashu-design-agent",
  "parent": "v3",
  "stats": {
    "fileSize": 45632,
    "linesOfCode": 523,
    "components": ["IosFrame", "Stage", "Sprite"]
  },
  "changes": {
    "colors": {
      "primary": { "from": "#FF6B35", "to": "#E63946" }
    },
    "fonts": {
      "display": { "from": "Inter", "to": "Newsreader" }
    },
    "tweaks": {
      "density": { "from": "comfortable", "to": "compact" }
    }
  },
  "screenshot": "screenshot.png",
  "thumbnail": "thumbnail-300x200.png"
}
```

---

## manifest.json 結構

版本索引文件：

```json
{
  "project": "ios-prototype-v1",
  "created": "2026-04-23T14:30:00.000Z",
  "currentVersion": "v4",
  "versions": [
    {
      "id": "v1",
      "timestamp": "2026-04-23T14:30:00.000Z",
      "message": "初版設計",
      "path": "v1-2026-04-23-14-30"
    },
    {
      "id": "v2",
      "timestamp": "2026-04-23T15:45:00.000Z",
      "message": "調整配色為暖色調",
      "path": "v2-2026-04-23-15-45",
      "parent": "v1"
    }
  ],
  "tags": {
    "milestone": ["v4"],
    "client-approved": ["v4"],
    "experimental": ["v2"]
  }
}
```

---

## 視覺 Diff 頁面

`_versions/diffs/v2-v4-visual.html` 自動生成的對比頁：

```html
<!DOCTYPE html>
<html>
<head>
  <title>Version Diff: v2 → v4</title>
  <style>
    .comparison {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      padding: 48px;
    }
    .version-panel {
      border: 2px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
    }
    .version-header {
      background: #f5f5f5;
      padding: 16px;
      font-weight: 600;
    }
    .screenshot {
      width: 100%;
      height: auto;
    }
    .changes-list {
      padding: 16px;
      background: #fffbf0;
    }
    .change-item {
      margin: 8px 0;
      padding: 8px;
      background: white;
      border-left: 3px solid #ff6b35;
    }
  </style>
</head>
<body>
  <h1>Version Comparison: v2 → v4</h1>
  
  <div class="comparison">
    <div class="version-panel">
      <div class="version-header">v2 - 2026-04-23 15:45</div>
      <img src="../v2-2026-04-23-15-45/screenshot.png" class="screenshot">
    </div>
    
    <div class="version-panel">
      <div class="version-header">v4 - 2026-04-23 17:00 ⭐</div>
      <img src="../v4-2026-04-23-17-00/screenshot.png" class="screenshot">
    </div>
  </div>
  
  <div class="changes-list">
    <h2>主要變更</h2>
    <div class="change-item">
      <strong>配色</strong>: #FF6B35 → #E63946
    </div>
    <div class="change-item">
      <strong>字體</strong>: Inter → Newsreader
    </div>
    <div class="change-item">
      <strong>信息密度</strong>: comfortable → compact
    </div>
  </div>
</body>
</html>
```

---

## 集成到工作流

### Agent 工作流修改

在 `SKILL.md` 的工作流程中新增：

```markdown
### 標準流程（用TaskCreate追蹤）

6. **Full pass + 版本快照**：
   - 填placeholder，做variations
   - **🆕 自動創建版本快照 v1**
   - 做到一半再show一次
   
7. **驗證 + 版本標記**：
   - 用Playwright截圖
   - **🆕 如果用戶滿意，標記為 milestone**
   - 交付前自己肉眼過一遍瀏覽器
```

### 用戶對話觸發詞

Agent 識別以下關鍵詞自動執行版本操作：

| 用戶說 | Agent 動作 |
|--------|-----------|
| 「保存這版」「記住這個」 | `version-snapshot.js --message="用戶要求保存"` |
| 「回到之前那版」「撤銷」 | 列出最近 5 版讓用戶選 |
| 「v2 和 v4 有什麼區別」 | `version-diff.js --from=v2 --to=v4` |
| 「恢復到昨天的版本」 | 按時間戳篩選版本列表 |

---

## 性能優化

### 截圖策略

- **全尺寸截圖**（1920×1080）：用於視覺對比
- **縮略圖**（300×200）：用於版本列表快速預覽
- **延遲生成**：首次訪問 diff 頁面時才生成對比圖

### 存儲優化

```javascript
// 只保存變更的文件
const shouldSnapshot = (currentHTML, lastHTML) => {
  const diff = calculateDiff(currentHTML, lastHTML);
  return diff.changedLines > 10; // 少於 10 行變更不快照
};

// 自動清理舊版本（保留策略）
const cleanupPolicy = {
  keepRecent: 10,           // 最近 10 版全保留
  keepMilestones: true,     // 標記為 milestone 的永久保留
  keepDaily: 30,            // 每天保留一版，保留 30 天
  keepWeekly: 52            // 每週保留一版，保留 52 週
};
```

---

## 與 Git 的關係

**版本管理系統 ≠ Git**，兩者互補：

| 維度 | 版本管理系統 | Git |
|------|-------------|-----|
| 粒度 | 設計作品級（整個 HTML） | 文件行級 |
| 對比 | 視覺截圖 + 參數 | 文本 diff |
| 用戶 | 設計師/非技術用戶 | 開發者 |
| 自動化 | Agent 自動快照 | 手動 commit |

**推薦組合使用**：
- 版本管理系統：設計迭代追蹤
- Git：代碼協作和備份

---

## 故障恢復

### 版本損壞

如果某個版本的文件損壞：

```bash
node scripts/version-verify.js

# 檢查所有版本的完整性
# 自動修復 manifest.json 索引
# 標記損壞版本為 corrupted
```

### 磁盤空間不足

```bash
node scripts/version-cleanup.js --dry-run

# 預覽將刪除的版本（按保留策略）
# 確認後執行：
node scripts/version-cleanup.js --execute
```

---

## 未來擴展

### Phase 2 功能

- **分支系統**：從某版本創建實驗分支
- **版本合併**：合併兩個分支的設計元素
- **協作標註**：在版本截圖上直接批註
- **雲端同步**：版本歷史同步到雲端

### Phase 3 功能

- **AI 版本摘要**：自動生成「這版主要改了什麼」
- **智能推薦**：「v3 的配色 + v5 的布局可能更好」
- **版本動畫**：生成 v1→v5 的演進動畫

---

## 參考實現

完整實現見：
- `scripts/version-snapshot.js` - 創建快照
- `scripts/version-list.js` - 列出版本
- `scripts/version-diff.js` - 生成對比
- `scripts/version-restore.js` - 恢復版本
- `scripts/version-cleanup.js` - 清理舊版本

---

**版本**：v1.0  
**更新日期**：2026-04-23  
**作者**：huashu-design
