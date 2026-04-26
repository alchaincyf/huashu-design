# 設計資產庫系統 · Asset Library

> 一次抓取，永久復用。品牌資產、設計組件、模板的個人化資產庫

---

## 核心理念

當前痛點：
- 每次新項目都要重新抓取 Stripe 的 logo 和色值（浪費 10-15 分鐘）
- 做過的好設計無法跨項目復用
- 團隊成員各自抓取，品牌資產不一致

**資產庫系統解決**：
- 🎨 **品牌資產**：logo、色值、字體一次抓取，永久復用
- 🧩 **設計組件**：hero section、card layout 等可復用組件
- 📄 **項目模板**：完整的 landing page、deck 模板
- 👥 **團隊共享**：導出/導入資產包，團隊統一標準

---

## 目錄結構

```
~/.design/huashu-design/library/
├── index.json                      # 資產庫索引
├── brands/                         # 品牌資產
│   ├── stripe/
│   │   ├── brand-spec.md           # 品牌規範
│   │   ├── logo.svg
│   │   ├── logo-white.svg
│   │   ├── colors.json
│   │   ├── fonts.json
│   │   ├── product-hero.png        # 產品圖
│   │   └── metadata.json
│   ├── anthropic/
│   │   └── ...
│   └── linear/
│       └── ...
├── components/                     # 可復用組件
│   ├── hero-sections/
│   │   ├── hero-minimal/
│   │   │   ├── component.html
│   │   │   ├── preview.png
│   │   │   └── metadata.json
│   │   ├── hero-bold/
│   │   └── hero-split/
│   ├── card-layouts/
│   │   ├── card-3col-grid/
│   │   └── card-masonry/
│   ├── navigation/
│   │   ├── nav-minimal/
│   │   └── nav-sidebar/
│   └── footers/
│       └── footer-comprehensive/
├── templates/                      # 完整模板
│   ├── landing-page-saas/
│   │   ├── template.html
│   │   ├── preview.png
│   │   ├── metadata.json
│   │   └── README.md
│   ├── product-launch-deck/
│   └── ios-prototype-onboarding/
└── exports/                        # 導出的資產包
    └── team-brand-kit-2026-04.zip
```

---

## 使用方式

### 1. 保存品牌資產到庫

**自動保存**（Agent 執行品牌資產協議後）：

```bash
node scripts/save-to-library.js \
  --type=brand \
  --name=stripe \
  --source=./stripe-brand/ \
  --auto
```

**手動保存**（用戶主動）：

```bash
node scripts/save-to-library.js \
  --type=brand \
  --name=my-company \
  --source=./my-company-brand/ \
  --tags="client,active"
```

### 2. 從庫中載入品牌資產

**Agent 工作流集成**：

```markdown
## 修改 SKILL.md 核心資產協議 Step 1

##### Step 1 · 問（資產清單一次問全）+ 🆕 檢查資產庫

**🆕 前置檢查**：
```bash
node scripts/check-library.js --brand=stripe

# 如果存在：
# ✅ Stripe 品牌資產已在庫中（最後更新：2026-03-15）
#    - logo.svg ✓
#    - colors.json ✓
#    - 產品圖 3 張 ✓
# 
# 是否直接使用？[Y/n]
```

如果用戶確認，**跳過 Step 2-4**，直接從庫載入：

```bash
node scripts/load-from-library.js \
  --brand=stripe \
  --output=./current-project/stripe-brand/
```

**時間節省**：30 分鐘 → 30 秒（60 倍提速）
```

### 3. 保存設計組件

做完一個好的 hero section 後：

```bash
node scripts/save-to-library.js \
  --type=component \
  --category=hero-sections \
  --name=hero-gradient-mesh \
  --source=./design.html \
  --extract="section.hero" \
  --tags="gradient,modern,bold"
```

**自動處理**：
- 提取指定 CSS selector 的 HTML
- 生成預覽截圖
- 記錄依賴（使用了哪些字體、顏色變量）
- 創建 metadata.json

### 4. 瀏覽資產庫

```bash
node scripts/list-library.js

# 輸出：
# 📦 Huashu-Design Asset Library
# 
# 🎨 Brands (12)
#   - stripe (2026-03-15) [active]
#   - anthropic (2026-04-10) [active]
#   - linear (2026-02-20)
#   ...
# 
# 🧩 Components (34)
#   Hero Sections (8)
#   Card Layouts (12)
#   Navigation (6)
#   Footers (8)
# 
# 📄 Templates (5)
#   - landing-page-saas
#   - product-launch-deck
#   ...
```

**按類別篩選**：

```bash
node scripts/list-library.js --type=components --category=hero-sections

# Hero Sections (8)
# 1. hero-minimal          [minimal, clean]
# 2. hero-bold             [gradient, modern]
# 3. hero-split            [two-column, image]
# ...
```

### 5. 搜索資產

```bash
node scripts/search-library.js --query="gradient modern"

# 搜索結果 (3)
# 
# 🧩 hero-gradient-mesh (component)
#    Tags: gradient, modern, bold
#    Preview: ~/.design/huashu-design/library/components/hero-sections/hero-gradient-mesh/preview.png
# 
# 📄 landing-page-saas (template)
#    Tags: saas, gradient, modern
#    ...
```

### 6. 使用組件

```bash
node scripts/use-component.js \
  --name=hero-gradient-mesh \
  --output=./current-project/hero.html \
  --customize='{"primaryColor": "#E63946", "title": "Transform Your Workflow"}'
```

**自動處理**：
- 複製組件 HTML
- 替換顏色變量為指定值
- 替換佔位文本
- 注入必要的依賴（字體、CSS）

---

## metadata.json 結構

### 品牌資產 metadata

```json
{
  "type": "brand",
  "name": "stripe",
  "displayName": "Stripe",
  "created": "2026-03-15T10:30:00.000Z",
  "updated": "2026-04-20T14:22:00.000Z",
  "tags": ["fintech", "active", "client"],
  "assets": {
    "logo": {
      "main": "logo.svg",
      "variants": ["logo-white.svg", "logo-icon.svg"],
      "formats": ["svg", "png"]
    },
    "colors": {
      "primary": "#635BFF",
      "background": "#0A2540",
      "accent": "#00D4FF",
      "source": "colors.json"
    },
    "fonts": {
      "display": "Camphor",
      "body": "Inter",
      "source": "fonts.json"
    },
    "productImages": [
      "product-dashboard.png",
      "product-terminal.png"
    ],
    "uiScreenshots": [
      "ui-home.png",
      "ui-payments.png"
    ]
  },
  "source": {
    "website": "https://stripe.com",
    "brandGuidelines": "https://stripe.com/brand",
    "capturedBy": "huashu-design-agent",
    "method": "automated"
  },
  "usage": {
    "projectCount": 5,
    "lastUsed": "2026-04-20T14:22:00.000Z"
  },
  "quality": {
    "completeness": 0.95,  // 0-1，資產完整度
    "verified": true,       // 是否經過人工驗證
    "notes": "All assets verified, high quality"
  }
}
```

### 組件 metadata

```json
{
  "type": "component",
  "category": "hero-sections",
  "name": "hero-gradient-mesh",
  "displayName": "Gradient Mesh Hero",
  "created": "2026-04-15T16:45:00.000Z",
  "tags": ["gradient", "modern", "bold", "animated"],
  "preview": "preview.png",
  "thumbnail": "thumbnail-300x200.png",
  "description": "Bold hero section with animated gradient mesh background",
  "files": {
    "html": "component.html",
    "css": "styles.css",
    "js": "animation.js"
  },
  "dependencies": {
    "fonts": ["Inter", "Newsreader"],
    "libraries": ["React", "Babel"],
    "cssVariables": [
      "--primary-color",
      "--background-color",
      "--accent-color"
    ]
  },
  "customizable": {
    "title": { "type": "text", "default": "Transform Your Workflow" },
    "subtitle": { "type": "text", "default": "AI-powered design tools" },
    "primaryColor": { "type": "color", "default": "#E63946" },
    "ctaText": { "type": "text", "default": "Get Started" }
  },
  "usage": {
    "projectCount": 3,
    "lastUsed": "2026-04-20T10:15:00.000Z"
  },
  "stats": {
    "linesOfCode": 156,
    "fileSize": 8432
  }
}
```

### 模板 metadata

```json
{
  "type": "template",
  "name": "landing-page-saas",
  "displayName": "SaaS Landing Page",
  "created": "2026-03-20T09:00:00.000Z",
  "tags": ["saas", "landing-page", "conversion-optimized"],
  "preview": "preview.png",
  "description": "Complete SaaS landing page with hero, features, pricing, testimonials",
  "files": {
    "main": "template.html",
    "readme": "README.md"
  },
  "sections": [
    "hero",
    "features-3col",
    "testimonials",
    "pricing-table",
    "cta",
    "footer"
  ],
  "components": [
    "hero-sections/hero-split",
    "card-layouts/card-3col-grid",
    "navigation/nav-minimal"
  ],
  "customizable": {
    "brandName": { "type": "text", "default": "YourBrand" },
    "primaryColor": { "type": "color", "default": "#635BFF" },
    "heroImage": { "type": "image", "default": "placeholder.png" }
  },
  "usage": {
    "projectCount": 8,
    "lastUsed": "2026-04-18T11:30:00.000Z"
  }
}
```

---

## index.json 結構

資產庫總索引：

```json
{
  "version": "1.0",
  "created": "2026-03-01T00:00:00.000Z",
  "updated": "2026-04-23T18:00:00.000Z",
  "stats": {
    "brands": 12,
    "components": 34,
    "templates": 5,
    "totalSize": "245MB"
  },
  "brands": [
    {
      "name": "stripe",
      "path": "brands/stripe",
      "updated": "2026-04-20T14:22:00.000Z",
      "tags": ["fintech", "active"]
    }
  ],
  "components": [
    {
      "name": "hero-gradient-mesh",
      "category": "hero-sections",
      "path": "components/hero-sections/hero-gradient-mesh",
      "tags": ["gradient", "modern"]
    }
  ],
  "templates": [
    {
      "name": "landing-page-saas",
      "path": "templates/landing-page-saas",
      "tags": ["saas", "landing-page"]
    }
  ],
  "tags": {
    "active": ["stripe", "anthropic"],
    "gradient": ["hero-gradient-mesh", "landing-page-saas"],
    "modern": ["hero-gradient-mesh", "hero-bold"]
  }
}
```

---

## 集成到工作流

### Agent 自動檢查資產庫

修改 `SKILL.md` 核心資產協議：

```markdown
##### Step 1 · 問（資產清單一次問全）+ 🆕 檢查資產庫

**🆕 前置步驟**（涉及具體品牌時自動執行）：

```bash
# 1. 檢查資產庫是否已有該品牌
node scripts/check-library.js --brand=<brand-name>

# 2. 如果存在且新鮮（<30天）：
#    - 詢問用戶是否直接使用
#    - 用戶確認 → 跳到 Step 5（載入並固化 spec）
#    - 用戶拒絕 → 繼續 Step 2（重新抓取）

# 3. 如果不存在或過期：
#    - 繼續正常流程（Step 2-4）
#    - 完成後自動保存到庫（Step 5 後）
```

**對話示例**：

```
Agent: 檢測到你要做 Stripe 相關設計。
       資產庫中已有 Stripe 品牌資產（最後更新：2026-03-15，38天前）
       
       包含：
       ✓ Logo (SVG + PNG)
       ✓ 色值 (5 個品牌色)
       ✓ 產品圖 (3 張)
       
       是否直接使用？
       [1] 是，直接用（30秒完成）
       [2] 否，重新抓取最新的（15分鐘）

User: 1

Agent: ✅ 已從資產庫載入 Stripe 品牌資產
       → 跳過抓取流程，直接進入設計階段
```

### 自動保存到庫

完成品牌資產協議後：

```markdown
##### Step 5 · 固化為 `brand-spec.md` 文件 + 🆕 保存到資產庫

**🆕 自動保存**（完成 brand-spec.md 後）：

```bash
node scripts/save-to-library.js \
  --type=brand \
  --name=<brand-name> \
  --source=./assets/<brand>-brand/ \
  --auto \
  --tags="active"
```

**靜默執行**（不打斷用戶）：
- 後台複製資產到 `~/.design/huashu-design/library/brands/<brand>/`
- 更新 index.json
- 生成 metadata.json
- 不需要用戶確認（除非衝突）

**衝突處理**：
- 如果庫中已有同名品牌 → 比較更新時間
- 新版本更新 → 提示用戶「是否覆蓋舊版本？」
- 保留兩版 → 舊版重命名為 `<brand>-2026-03-15`
```

---

## 團隊協作

### 導出資產包

```bash
node scripts/export-library.js \
  --brands="stripe,anthropic,linear" \
  --components="hero-sections/*" \
  --output=team-brand-kit.zip
```

**生成的 ZIP 結構**：

```
team-brand-kit.zip
├── manifest.json           # 包含的資產清單
├── brands/
│   ├── stripe/
│   ├── anthropic/
│   └── linear/
└── components/
    └── hero-sections/
```

### 導入資產包

```bash
node scripts/import-library.js \
  --file=team-brand-kit.zip \
  --merge                    # 合併到現有庫（不覆蓋）
```

**衝突解決策略**：
- 同名資產 → 比較更新時間，保留較新的
- 用戶手動選擇 → `--interactive` 模式逐個確認

---

## 資產質量管理

### 自動驗證

```bash
node scripts/verify-library.js

# 檢查項目：
# ✓ 所有 logo 文件存在且可讀
# ✓ colors.json 格式正確
# ✓ 預覽圖生成成功
# ✗ stripe/product-hero.png 損壞
# 
# 發現 1 個問題，是否自動修復？[Y/n]
```

### 質量評分

每個資產自動計算質量分數（0-100）：

```javascript
const qualityScore = {
  completeness: 0.4,  // 資產完整度（40%）
  freshness: 0.2,     // 更新時間（20%）
  usage: 0.2,         // 使用頻率（20%）
  verified: 0.2       // 人工驗證（20%）
};

// 示例：
// Stripe: 95 分（完整、新鮮、常用、已驗證）
// OldBrand: 45 分（完整但 2 年未更新、很少用）
```

### 自動清理

```bash
node scripts/cleanup-library.js --dry-run

# 清理策略：
# - 刪除 180 天未使用的資產
# - 保留標記為 "active" 的資產
# - 保留質量分 >80 的資產
# 
# 將刪除 (3)：
#   - old-client-brand (365 天未用)
#   - test-component (質量分 25)
#   - deprecated-template (已標記廢棄)
# 
# 將釋放空間：45 MB
```

---

## 性能優化

### 延遲載入

```javascript
// 只在需要時載入完整 metadata
const loadBrandMetadata = async (brandName) => {
  // 先從 index.json 讀取基本信息（快）
  const basic = index.brands.find(b => b.name === brandName);
  
  // 需要詳細信息時才讀取完整 metadata.json（慢）
  if (needsDetails) {
    const full = await fs.readJSON(`${basic.path}/metadata.json`);
    return { ...basic, ...full };
  }
  
  return basic;
};
```

### 縮略圖緩存

```bash
# 預生成所有縮略圖（加速列表顯示）
node scripts/generate-thumbnails.js --all

# 只生成缺失的
node scripts/generate-thumbnails.js --missing
```

---

## 安全與隱私

### 敏感信息過濾

自動檢測並移除：
- API keys
- 用戶數據
- 內部 URL
- 員工姓名/郵箱

```javascript
const sanitize = (html) => {
  return html
    .replace(/sk_live_[a-zA-Z0-9]+/g, 'sk_live_REDACTED')
    .replace(/user@company\.com/g, 'user@example.com')
    .replace(/https:\/\/internal\./g, 'https://example.');
};
```

### 訪問控制

```json
{
  "name": "client-confidential",
  "access": "private",
  "allowedUsers": ["user@company.com"],
  "expiresAt": "2026-12-31T23:59:59.000Z"
}
```

---

## 未來擴展

### Phase 2 功能

- **雲端同步**：資產庫同步到 S3/Google Drive
- **團隊協作**：多人共享同一資產庫
- **版本控制**：品牌資產的版本歷史
- **智能推薦**：「做 SaaS 落地頁？推薦這 3 個模板」

### Phase 3 功能

- **AI 生成組件**：從截圖生成可復用組件
- **自動更新**：定期檢查品牌官網，自動更新資產
- **使用分析**：哪些組件最受歡迎、哪些從未用過

---

## 參考實現

完整實現見：
- `scripts/save-to-library.js` - 保存資產
- `scripts/load-from-library.js` - 載入資產
- `scripts/list-library.js` - 列出資產
- `scripts/search-library.js` - 搜索資產
- `scripts/check-library.js` - 檢查資產
- `scripts/export-library.js` - 導出資產包
- `scripts/import-library.js` - 導入資產包
- `scripts/verify-library.js` - 驗證資產
- `scripts/cleanup-library.js` - 清理資產

---

**版本**：v1.0  
**更新日期**：2026-04-23  
**作者**：huashu-design
