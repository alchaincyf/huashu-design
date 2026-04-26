#!/usr/bin/env node

/**
 * check-library.js
 * 檢查資產庫中是否已有指定品牌/組件/模板
 * 
 * 用法：
 *   node check-library.js --brand=stripe
 *   node check-library.js --component=hero-bold
 *   node check-library.js --template=landing-page-saas
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// ============ 配置 ============
// 默認：用戶級資產庫（推薦）
const LIBRARY_ROOT = path.join(os.homedir(), '.design', 'huashu-design', 'library');
const FRESHNESS_DAYS = 30; // 資產新鮮度閾值（天）

// 替代選項（根據需要取消註釋）：
// const LIBRARY_ROOT = path.join(process.cwd(), '_library');           // 項目級
// const LIBRARY_ROOT = path.join(os.homedir(), '.huashu-design');      // 簡化路徑
// const LIBRARY_ROOT = process.env.HUASHU_LIBRARY || path.join(os.homedir(), '.design', 'huashu-design', 'library');  // 環境變量

const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.split('=');
  acc[key.replace('--', '')] = value || true;
  return acc;
}, {});

const {
  brand = null,
  component = null,
  template = null
} = args;

if (!brand && !component && !template) {
  console.error('錯誤：必須指定 --brand、--component 或 --template');
  console.log('\n用法：');
  console.log('  node check-library.js --brand=stripe');
  console.log('  node check-library.js --component=hero-bold');
  console.log('  node check-library.js --template=landing-page-saas');
  process.exit(1);
}

function checkLibrary() {
  // 1. 檢查資產庫是否存在
  if (!fs.existsSync(LIBRARY_ROOT)) {
    console.log('資產庫尚未初始化');
    console.log('首次使用會自動創建資產庫');
    process.exit(1);
  }
  
  // 2. 讀取索引
  const indexPath = path.join(LIBRARY_ROOT, 'index.json');
  if (!fs.existsSync(indexPath)) {
    console.log('找不到索引文件');
    process.exit(1);
  }
  
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  
  // 3. 確定查詢類型和名稱
  let type, name;
  if (brand) {
    type = 'brand';
    name = brand;
  } else if (component) {
    type = 'component';
    name = component;
  } else {
    type = 'template';
    name = template;
  }
  
  // 4. 查找資產
  const items = index[`${type}s`] || [];
  const item = items.find(i => i.name === name);
  
  if (!item) {
    console.log(`資產庫中沒有 ${name}`);
    console.log(`使用 node scripts/save-to-library.js --type=${type} --name=${name} 添加`);
    process.exit(1);
  }
  
  // 5. 載入 metadata
  const metadataPath = path.join(LIBRARY_ROOT, item.path, 'metadata.json');
  let metadata = null;
  
  if (fs.existsSync(metadataPath)) {
    metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  }
  
  // 6. 檢查新鮮度
  const updatedDate = new Date(item.updated);
  const now = new Date();
  const daysSinceUpdate = Math.floor((now - updatedDate) / (1000 * 60 * 60 * 24));
  const isFresh = daysSinceUpdate <= FRESHNESS_DAYS;
  
  // 7. 輸出結果
  console.log(`\n${getTypeName(type)} ${name} 已在資產庫中\n`);
  console.log(`最後更新：${formatDate(item.updated)} (${daysSinceUpdate} 天前)`);
  console.log(`路徑：${item.path}`);
  
  if (item.tags && item.tags.length > 0) {
    console.log(`標籤：${item.tags.join(', ')}`);
  }
  
  // 8. 顯示資產詳情
  if (type === 'brand' && metadata) {
    console.log('\n包含資產：');
    
    if (metadata.assets) {
      const assets = metadata.assets;
      
      if (assets.logo) {
        const logoCount = assets.logo.variants ? assets.logo.variants.length + 1 : 1;
        console.log(`✓ Logo: ${logoCount} 個變體`);
      }
      
      if (assets.colors) {
        const colorCount = Object.keys(assets.colors).length - 1; // 減去 source
        console.log(`✓ 色值: ${colorCount} 個`);
      }
      
      if (assets.fonts) {
        console.log(`✓ 字體: ${assets.fonts.display || '未指定'} / ${assets.fonts.body || '未指定'}`);
      }
      
      if (assets.productImages && assets.productImages.length > 0) {
        console.log(`✓ 產品圖: ${assets.productImages.length} 張`);
      }
      
      if (assets.uiScreenshots && assets.uiScreenshots.length > 0) {
        console.log(`✓ UI 截圖: ${assets.uiScreenshots.length} 張`);
      }
    }
    
    // 質量評分
    if (metadata.quality) {
      const score = Math.round(metadata.quality.completeness * 100);
      const stars = '★'.repeat(Math.floor(score / 20)) + '☆'.repeat(5 - Math.floor(score / 20));
      console.log(`\n質量評分：${score}/100 ${stars}`);
      
      if (metadata.quality.verified) {
        console.log('   ✓ 已人工驗證');
      }
    }
  }
  
  if (type === 'component' && metadata) {
    console.log('\n組件信息：');
    console.log(`類別：${metadata.category || '未分類'}`);
    
    if (metadata.dependencies) {
      if (metadata.dependencies.libraries && metadata.dependencies.libraries.length > 0) {
        console.log(`依賴：${metadata.dependencies.libraries.join(', ')}`);
      }
      
      if (metadata.dependencies.fonts && metadata.dependencies.fonts.length > 0) {
        console.log(`字體：${metadata.dependencies.fonts.join(', ')}`);
      }
    }
  }
  
  if (type === 'template' && metadata) {
    console.log('\n模板信息：');
    
    if (metadata.sections && metadata.sections.length > 0) {
      console.log(`區塊：${metadata.sections.join(', ')}`);
    }
    
    if (metadata.components && metadata.components.length > 0) {
      console.log(`組件：${metadata.components.join(', ')}`);
    }
  }
  
  // 9. 使用統計
  if (metadata && metadata.usage) {
    console.log('\n使用統計：');
    console.log(`項目數：${metadata.usage.projectCount || 0}`);
    
    if (metadata.usage.lastUsed) {
      console.log(`最後使用：${formatDate(metadata.usage.lastUsed)}`);
    }
  }
  
  // 10. 新鮮度建議
  console.log('\n建議：');
  
  if (isFresh) {
    console.log(`資產較新（${daysSinceUpdate} 天前更新），可以直接使用`);
    console.log(`載入：node scripts/load-from-library.js --${type}=${name}`);
  } else {
    console.log(`資產較舊（${daysSinceUpdate} 天前更新），建議重新抓取`);
    console.log(`更新：node scripts/save-to-library.js --type=${type} --name=${name} --source=... --force`);
    console.log(`或直接使用：node scripts/load-from-library.js --${type}=${name}`);
  }
  
  console.log('');
  
  // 11. 退出碼（0 = 存在且新鮮，1 = 存在但過期）
  process.exit(isFresh ? 0 : 1);
}

/**
 * 格式化日期
 */
function formatDate(isoString) {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * 獲取類型名稱
 */
function getTypeName(type) {
  const names = {
    brand: '品牌資產',
    component: '設計組件',
    template: '完整模板'
  };
  return names[type] || type;
}

// ============ 執行 ============
try {
  checkLibrary();
} catch (error) {
  console.error('錯誤:', error.message);
  process.exit(1);
}
