#!/usr/bin/env node

/**
 * version-snapshot.js
 * 創建設計版本快照（HTML + 截圖 + metadata）
 * 
 * 用法：
 *   node version-snapshot.js --file=design.html --message="初版設計"
 *   node version-snapshot.js --file=design.html --auto  # 自動生成 message
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const VERSIONS_DIR = '_versions';
const SCREENSHOT_WIDTH = 1920;
const SCREENSHOT_HEIGHT = 1080;
const THUMBNAIL_WIDTH = 300;
const THUMBNAIL_HEIGHT = 200;

const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.split('=');
  acc[key.replace('--', '')] = value || true;
  return acc;
}, {});

const {
  file,
  message,
  auto = false,
  tags = ''
} = args;

if (!file) {
  console.error('錯誤：必須指定 --file 參數');
  console.log('用法：node version-snapshot.js --file=design.html --message="初版設計"');
  process.exit(1);
}

if (!fs.existsSync(file)) {
  console.error(`錯誤：文件不存在 ${file}`);
  process.exit(1);
}

async function createSnapshot() {
  console.log('創建版本快照...\n');
  
  // 1. 初始化版本目錄
  if (!fs.existsSync(VERSIONS_DIR)) {
    fs.mkdirSync(VERSIONS_DIR, { recursive: true });
    fs.mkdirSync(path.join(VERSIONS_DIR, 'diffs'), { recursive: true });
  }
  
  // 2. 讀取或創建 manifest
  const manifestPath = path.join(VERSIONS_DIR, 'manifest.json');
  let manifest = { versions: [], tags: {} };
  
  if (fs.existsSync(manifestPath)) {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } else {
    manifest.project = path.basename(process.cwd());
    manifest.created = new Date().toISOString();
  }
  
  // 3. 生成版本號
  const versionNum = manifest.versions.length + 1;
  const versionId = `v${versionNum}`;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const versionDir = `${versionId}-${timestamp}`;
  const versionPath = path.join(VERSIONS_DIR, versionDir);
  
  // 4. 創建版本目錄
  fs.mkdirSync(versionPath, { recursive: true });
  
  // 5. 複製 HTML 文件
  const htmlContent = fs.readFileSync(file, 'utf8');
  fs.writeFileSync(
    path.join(versionPath, 'design.html'),
    htmlContent
  );
  
  // 6. 提取 Tweaks 狀態（如果存在）
  const tweaksState = extractTweaksState(htmlContent);
  if (tweaksState) {
    fs.writeFileSync(
      path.join(versionPath, 'tweaks-state.json'),
      JSON.stringify(tweaksState, null, 2)
    );
  }
  
  // 7. 生成截圖
  console.log('生成截圖...');
  await generateScreenshot(file, versionPath);
  
  // 8. 分析變更（與上一版本對比）
  let changes = {};
  if (manifest.versions.length > 0) {
    const prevVersion = manifest.versions[manifest.versions.length - 1];
    const prevHtmlPath = path.join(VERSIONS_DIR, prevVersion.path, 'design.html');
    
    if (fs.existsSync(prevHtmlPath)) {
      const prevHtml = fs.readFileSync(prevHtmlPath, 'utf8');
      changes = analyzeChanges(prevHtml, htmlContent);
    }
  }
  
  // 9. 生成 metadata
  const metadata = {
    version: versionId,
    timestamp: new Date().toISOString(),
    message: message || (auto ? generateAutoMessage(changes) : '版本快照'),
    tags: tags ? tags.split(',').map(t => t.trim()) : [],
    author: 'huashu-design-agent',
    parent: manifest.versions.length > 0 ? manifest.versions[manifest.versions.length - 1].id : null,
    stats: {
      fileSize: Buffer.byteLength(htmlContent, 'utf8'),
      linesOfCode: htmlContent.split('\n').length,
      components: extractComponents(htmlContent)
    },
    changes,
    screenshot: 'screenshot.png',
    thumbnail: 'thumbnail.png'
  };
  
  fs.writeFileSync(
    path.join(versionPath, 'metadata.json'),
    JSON.stringify(metadata, null, 2)
  );
  
  // 10. 更新 manifest
  manifest.versions.push({
    id: versionId,
    timestamp: metadata.timestamp,
    message: metadata.message,
    path: versionDir,
    parent: metadata.parent
  });
  
  manifest.currentVersion = versionId;
  manifest.updated = new Date().toISOString();
  
  // 更新 tags 索引
  metadata.tags.forEach(tag => {
    if (!manifest.tags[tag]) manifest.tags[tag] = [];
    manifest.tags[tag].push(versionId);
  });
  
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  
  // 11. 輸出結果
  console.log('\n版本快照創建成功！\n');
  console.log(`版本：${versionId}`);
  console.log(`說明：${metadata.message}`);
  console.log(`路徑：${versionPath}`);
  console.log(`統計：${metadata.stats.linesOfCode} 行代碼，${(metadata.stats.fileSize / 1024).toFixed(1)} KB`);
  
  if (Object.keys(changes).length > 0) {
    console.log('\n主要變更：');
    if (changes.colors) {
      Object.entries(changes.colors).forEach(([key, change]) => {
        console.log(`色彩 ${key}: ${change.from} → ${change.to}`);
      });
    }
    if (changes.fonts) {
      Object.entries(changes.fonts).forEach(([key, change]) => {
        console.log(`字體 ${key}: ${change.from} → ${change.to}`);
      });
    }
  }
  
  console.log(`\n查看所有版本：node scripts/version-list.js`);
}

/**
 * 生成截圖（使用 Playwright）
 */
async function generateScreenshot(htmlFile, outputDir) {
  try {
    // 檢查是否安裝 Playwright
    const playwrightPath = execSync('npm root -g', { encoding: 'utf8' }).trim();
    const playwrightBin = path.join(playwrightPath, 'playwright', 'cli.js');
    
    if (!fs.existsSync(playwrightBin)) {
      console.warn('未安裝 Playwright，跳過截圖生成');
      console.log('安裝：npm install -g playwright');
      return;
    }
    
    const absolutePath = path.resolve(htmlFile);
    const screenshotPath = path.join(outputDir, 'screenshot.png');
    const thumbnailPath = path.join(outputDir, 'thumbnail.png');
    
    // 生成全尺寸截圖
    execSync(
      `node "${playwrightBin}" screenshot "file://${absolutePath}" "${screenshotPath}" ` +
      `--viewport-size=${SCREENSHOT_WIDTH},${SCREENSHOT_HEIGHT} --full-page`,
      { stdio: 'pipe' }
    );
    
    // 生成縮略圖（使用 ImageMagick 或 sharp）
    try {
      execSync(
        `convert "${screenshotPath}" -resize ${THUMBNAIL_WIDTH}x${THUMBNAIL_HEIGHT} "${thumbnailPath}"`,
        { stdio: 'pipe' }
      );
    } catch (e) {
      // ImageMagick 不可用，複製全尺寸圖
      fs.copyFileSync(screenshotPath, thumbnailPath);
    }
    
    console.log('✓ 截圖生成成功');
  } catch (error) {
    console.warn('截圖生成失敗:', error.message);
  }
}

/**
 * 提取 Tweaks 狀態
 */
function extractTweaksState(html) {
  // 查找 localStorage 相關的 Tweaks 狀態
  const tweaksMatch = html.match(/localStorage\.getItem\(['"]tweaks['"]\)/);
  if (!tweaksMatch) return null;
  
  // 提取默認值
  const defaultsMatch = html.match(/const\s+defaultTweaks\s*=\s*({[\s\S]*?});/);
  if (defaultsMatch) {
    try {
      // 簡單的 JSON 提取（實際應該用 AST parser）
      const tweaksStr = defaultsMatch[1]
        .replace(/\/\/.*/g, '')  // 移除註釋
        .replace(/'/g, '"');      // 單引號轉雙引號
      return JSON.parse(tweaksStr);
    } catch (e) {
      return null;
    }
  }
  
  return null;
}

/**
 * 分析變更
 */
function analyzeChanges(prevHtml, currentHtml) {
  const changes = {};
  
  // 1. 色彩變更
  const prevColors = extractColors(prevHtml);
  const currentColors = extractColors(currentHtml);
  
  const colorChanges = {};
  Object.keys(currentColors).forEach(key => {
    if (prevColors[key] && prevColors[key] !== currentColors[key]) {
      colorChanges[key] = {
        from: prevColors[key],
        to: currentColors[key]
      };
    }
  });
  
  if (Object.keys(colorChanges).length > 0) {
    changes.colors = colorChanges;
  }
  
  // 2. 字體變更
  const prevFonts = extractFonts(prevHtml);
  const currentFonts = extractFonts(currentHtml);
  
  const fontChanges = {};
  Object.keys(currentFonts).forEach(key => {
    if (prevFonts[key] && prevFonts[key] !== currentFonts[key]) {
      fontChanges[key] = {
        from: prevFonts[key],
        to: currentFonts[key]
      };
    }
  });
  
  if (Object.keys(fontChanges).length > 0) {
    changes.fonts = fontChanges;
  }
  
  // 3. 行數變更
  const prevLines = prevHtml.split('\n').length;
  const currentLines = currentHtml.split('\n').length;
  const lineDiff = currentLines - prevLines;
  
  if (Math.abs(lineDiff) > 10) {
    changes.linesOfCode = {
      from: prevLines,
      to: currentLines,
      diff: lineDiff
    };
  }
  
  return changes;
}

/**
 * 提取顏色
 */
function extractColors(html) {
  const colors = {};
  
  // CSS 變量
  const cssVarMatches = html.matchAll(/--([a-z-]+):\s*(#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3})/g);
  for (const match of cssVarMatches) {
    colors[match[1]] = match[2];
  }
  
  return colors;
}

/**
 * 提取字體
 */
function extractFonts(html) {
  const fonts = {};
  
  // CSS 變量
  const fontMatches = html.matchAll(/--([a-z-]+-font):\s*['"]?([^;'"]+)['"]?/g);
  for (const match of fontMatches) {
    fonts[match[1]] = match[2].trim();
  }
  
  // font-family 聲明
  const familyMatches = html.matchAll(/font-family:\s*['"]?([^;'"]+)['"]?/g);
  if (familyMatches) {
    const families = [...familyMatches].map(m => m[1].split(',')[0].trim());
    if (families.length > 0) {
      fonts['primary'] = families[0];
    }
  }
  
  return fonts;
}

/**
 * 提取組件
 */
function extractComponents(html) {
  const components = [];
  
  // React 組件
  const componentMatches = html.matchAll(/<([A-Z][a-zA-Z]+)/g);
  const uniqueComponents = new Set([...componentMatches].map(m => m[1]));
  
  return Array.from(uniqueComponents);
}

/**
 * 自動生成 message
 */
function generateAutoMessage(changes) {
  const parts = [];
  
  if (changes.colors) {
    const count = Object.keys(changes.colors).length;
    parts.push(`調整 ${count} 個顏色`);
  }
  
  if (changes.fonts) {
    const count = Object.keys(changes.fonts).length;
    parts.push(`更換 ${count} 個字體`);
  }
  
  if (changes.linesOfCode) {
    const diff = changes.linesOfCode.diff;
    if (diff > 0) {
      parts.push(`新增 ${diff} 行代碼`);
    } else {
      parts.push(`刪除 ${Math.abs(diff)} 行代碼`);
    }
  }
  
  return parts.length > 0 ? parts.join('，') : '版本更新';
}

createSnapshot().catch(error => {
  console.error('錯誤:', error.message);
  process.exit(1);
});
