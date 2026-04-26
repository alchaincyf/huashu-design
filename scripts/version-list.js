#!/usr/bin/env node

/**
 * version-list.js
 * 列出所有版本歷史
 * 
 * 用法：
 *   node version-list.js
 *   node version-list.js --detailed
 *   node version-list.js --tags=milestone
 */

const fs = require('fs');
const path = require('path');

const VERSIONS_DIR = '_versions';

const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.split('=');
  acc[key.replace('--', '')] = value || true;
  return acc;
}, {});

const {
  detailed = false,
  tags = null
} = args;

function listVersions() {
  // 1. 檢查版本目錄
  if (!fs.existsSync(VERSIONS_DIR)) {
    console.log('尚未創建任何版本');
    console.log('使用 node scripts/version-snapshot.js 創建第一個版本');
    return;
  }
  
  // 2. 讀取 manifest
  const manifestPath = path.join(VERSIONS_DIR, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.log('找不到 manifest.json');
    return;
  }
  
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  
  // 3. 過濾版本（按 tags）
  let versions = manifest.versions;
  if (tags) {
    const tagList = tags.split(',').map(t => t.trim());
    versions = versions.filter(v => {
      const metadata = loadMetadata(v.path);
      return metadata && metadata.tags.some(t => tagList.includes(t));
    });
  }
  
  // 4. 顯示標題
  console.log('\n版本歷史\n');
  console.log(`項目：${manifest.project}`);
  console.log(`當前版本：${manifest.currentVersion}`);
  console.log(`總版本數：${manifest.versions.length}\n`);
  
  if (tags) {
    console.log(`篩選標籤：${tags}\n`);
  }
  
  // 5. 列出版本
  if (versions.length === 0) {
    console.log('沒有符合條件的版本');
    return;
  }
  
  versions.forEach((version, index) => {
    const metadata = loadMetadata(version.path);
    
    if (!metadata) {
      console.log(`${version.id}  ${formatDate(version.timestamp)}  ${version.message}`);
      return;
    }
    
    // 基本信息
    const isCurrent = version.id === manifest.currentVersion;
    const marker = isCurrent ? '→' : ' ';
    const tagStr = metadata.tags.length > 0 ? ` [${metadata.tags.join(', ')}]` : '';
    
    console.log(`${marker} ${version.id}  ${formatDate(version.timestamp)}  ${version.message}${tagStr}`);
    
    // 詳細信息
    if (detailed) {
      console.log(`${metadata.stats.linesOfCode} 行，${(metadata.stats.fileSize / 1024).toFixed(1)} KB`);
      
      if (metadata.stats.components.length > 0) {
        console.log(`組件：${metadata.stats.components.join(', ')}`);
      }
      
      if (metadata.changes && Object.keys(metadata.changes).length > 0) {
        console.log('變更：');
        
        if (metadata.changes.colors) {
          Object.entries(metadata.changes.colors).forEach(([key, change]) => {
            console.log(`色彩 ${key}: ${change.from} → ${change.to}`);
          });
        }
        
        if (metadata.changes.fonts) {
          Object.entries(metadata.changes.fonts).forEach(([key, change]) => {
            console.log(`字體 ${key}: ${change.from} → ${change.to}`);
          });
        }
        
        if (metadata.changes.linesOfCode) {
          const diff = metadata.changes.linesOfCode.diff;
          const sign = diff > 0 ? '+' : '';
          console.log(`代碼行數：${sign}${diff}`);
        }
      }
      
      console.log('');
    }
  });
  
  // 6. 顯示標籤統計
  if (!tags && Object.keys(manifest.tags).length > 0) {
    console.log('\n標籤統計：');
    Object.entries(manifest.tags).forEach(([tag, versionIds]) => {
      console.log(`${tag}: ${versionIds.length} 個版本`);
    });
  }
  
  // 7. 提示
  console.log('\n操作提示：');
  console.log('   查看詳細信息：node scripts/version-list.js --detailed');
  console.log('   對比兩個版本：node scripts/version-diff.js --from=v1 --to=v3');
  console.log('   恢復某個版本：node scripts/version-restore.js --version=v2');
  console.log('');
}

/**
 * 載入 metadata
 */
function loadMetadata(versionPath) {
  const metadataPath = path.join(VERSIONS_DIR, versionPath, 'metadata.json');
  
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
 * 格式化日期
 */
function formatDate(isoString) {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hour}:${minute}`;
}

try {
  listVersions();
} catch (error) {
  console.error('錯誤:', error.message);
  process.exit(1);
}
