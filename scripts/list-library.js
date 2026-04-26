#!/usr/bin/env node

/**
 * list-library.js
 * 列出資產庫中的所有資產
 * 
 * 用法：
 *   node list-library.js
 *   node list-library.js --type=brands
 *   node list-library.js --type=components --category=hero-sections
 *   node list-library.js --tags=modern,gradient
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// ============ 配置 ============
// 默認：用戶級資產庫（推薦）
const LIBRARY_ROOT = path.join(os.homedir(), '.design', 'huashu-design', 'library');

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
  type = null,
  category = null,
  tags = null,
  detailed = false
} = args;

function listLibrary() {
  // 1. 檢查資產庫
  if (!fs.existsSync(LIBRARY_ROOT)) {
    console.log('資產庫尚未初始化');
    console.log('使用 node scripts/save-to-library.js 添加第一個資產');
    return;
  }
  
  // 2. 讀取索引
  const indexPath = path.join(LIBRARY_ROOT, 'index.json');
  if (!fs.existsSync(indexPath)) {
    console.log('找不到索引文件');
    return;
  }
  
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  
  // 3. 顯示標題
  console.log('\n Huashu-Design 資產庫\n');
  
  if (!type) {
    // 顯示統計
    console.log(`統計：`);
    console.log(`品牌資產：${index.stats.brands || 0} 個`);
    console.log(`設計組件：${index.stats.components || 0} 個`);
    console.log(`完整模板：${index.stats.templates || 0} 個`);
    console.log(`總大小：${formatSize(index.stats.totalSize || 0)}`);
    console.log('');
  }
  
  // 4. 過濾資產
  let items = [];
  
  if (!type || type === 'brands') {
    items.push(...filterItems(index.brands || [], 'brand', tags));
  }
  
  if (!type || type === 'components') {
    let components = index.components || [];
    if (category) {
      components = components.filter(c => c.category === category);
    }
    items.push(...filterItems(components, 'component', tags));
  }
  
  if (!type || type === 'templates') {
    items.push(...filterItems(index.templates || [], 'template', tags));
  }
  
  // 5. 按類型分組顯示
  if (!type) {
    displayByType(items, index, detailed);
  } else {
    displayList(items, type, detailed);
  }
  
  // 6. 顯示標籤統計
  if (!tags && Object.keys(index.tags).length > 0) {
    console.log('\n熱門標籤：');
    const sortedTags = Object.entries(index.tags)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 10);
    
    sortedTags.forEach(([tag, items]) => {
      console.log(`   ${tag} (${items.length})`);
    });
  }
  
  // 7. 提示
  console.log('\n操作提示：');
  console.log('查看品牌資產：node scripts/list-library.js --type=brands');
  console.log('查看設計組件：node scripts/list-library.js --type=components');
  console.log('按標籤篩選：node scripts/list-library.js --tags=modern,gradient');
  console.log('載入資產：node scripts/load-from-library.js --brand=stripe');
  console.log('');
}

/**
 * 過濾項目
 */
function filterItems(items, type, tags) {
  let filtered = items.map(item => ({ ...item, type }));
  
  if (tags) {
    const tagList = tags.split(',').map(t => t.trim());
    filtered = filtered.filter(item => 
      item.tags && item.tags.some(t => tagList.includes(t))
    );
  }
  
  return filtered;
}

/**
 * 按類型分組顯示
 */
function displayByType(items, index, detailed) {
  const byType = {
    brand: items.filter(i => i.type === 'brand'),
    component: items.filter(i => i.type === 'component'),
    template: items.filter(i => i.type === 'template')
  };
  
  // 品牌資產
  if (byType.brand.length > 0) {
    console.log(`品牌資產 (${byType.brand.length})`);
    byType.brand.forEach(item => {
      displayItem(item, detailed);
    });
    console.log('');
  }
  
  // 設計組件（按類別分組）
  if (byType.component.length > 0) {
    console.log(`設計組件 (${byType.component.length})`);
    
    const byCategory = {};
    byType.component.forEach(item => {
      const cat = item.category || 'uncategorized';
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(item);
    });
    
    Object.entries(byCategory).forEach(([cat, items]) => {
      console.log(`\n   ${formatCategory(cat)} (${items.length})`);
      items.forEach(item => {
        displayItem(item, detailed, '   ');
      });
    });
    console.log('');
  }
  
  // 完整模板
  if (byType.template.length > 0) {
    console.log(`完整模板 (${byType.template.length})`);
    byType.template.forEach(item => {
      displayItem(item, detailed);
    });
    console.log('');
  }
}

/**
 * 列表顯示
 */
function displayList(items, type, detailed) {
  console.log(`${getTypeIcon(type)} ${getTypeName(type)} (${items.length})\n`);
  
  if (items.length === 0) {
    console.log('沒有符合條件的資產');
    return;
  }
  
  items.forEach((item, index) => {
    console.log(`${index + 1}. ${item.name}`);
    displayItem(item, detailed, '   ');
  });
}

/**
 * 顯示單個項目
 */
function displayItem(item, detailed, indent = '') {
  const tagStr = item.tags && item.tags.length > 0 ? ` [${item.tags.join(', ')}]` : '';
  const dateStr = item.updated ? formatDate(item.updated) : '';
  
  if (!detailed) {
    console.log(`${indent}- ${item.name}${tagStr} ${dateStr ? `(${dateStr})` : ''}`);
    return;
  }
  
  // 詳細信息
  console.log(`${indent}${item.name}${tagStr}`);
  console.log(`${indent} 更新：${dateStr}`);
  console.log(`${indent} 路徑：${item.path}`);
  
  // 載入 metadata 顯示更多信息
  const metadata = loadMetadata(item.path);
  if (metadata) {
    if (metadata.stats) {
      console.log(`${indent} 大小：${formatSize(metadata.stats.totalSize || 0)}`);
    }
    
    if (metadata.usage) {
      console.log(`${indent} 使用：${metadata.usage.projectCount || 0} 個項目`);
    }
  }
  
  console.log('');
}

/**
 * 載入 metadata
 */
function loadMetadata(relativePath) {
  const metadataPath = path.join(LIBRARY_ROOT, relativePath, 'metadata.json');
  
  if (!fs.existsSync(metadataPath)) {
    return null;
  }
  
  try {
    return JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  } catch (e) {
    return null;
  }
}

/**
 * 格式化類別名稱
 */
function formatCategory(category) {
  return category
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * 格式化日期
 */
function formatDate(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays} 天前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} 週前`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} 個月前`;
  
  return `${Math.floor(diffDays / 365)} 年前`;
}

/**
 * 格式化大小
 */
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * 獲取類型圖標
 */
function getTypeIcon(type) {
  const icons = {
    brand: '🎨',
    brands: '🎨',
    component: '🧩',
    components: '🧩',
    template: '📄',
    templates: '📄'
  };
  return icons[type] || '📦';
}

/**
 * 獲取類型名稱
 */
function getTypeName(type) {
  const names = {
    brand: '品牌資產',
    brands: '品牌資產',
    component: '設計組件',
    components: '設計組件',
    template: '完整模板',
    templates: '完整模板'
  };
  return names[type] || type;
}

try {
  listLibrary();
} catch (error) {
  console.error('錯誤:', error.message);
  process.exit(1);
}
