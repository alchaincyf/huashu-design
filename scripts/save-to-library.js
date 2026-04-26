#!/usr/bin/env node

/**
 * save-to-library.js
 * 保存品牌資產、組件或模板到資產庫
 * 
 * 用法：
 *   # 保存品牌資產
 *   node save-to-library.js --type=brand --name=stripe --source=./stripe-brand/
 *   
 *   # 保存設計組件
 *   node save-to-library.js --type=component --category=hero-sections --name=hero-bold --source=./design.html --extract="section.hero"
 *   
 *   # 保存完整模板
 *   node save-to-library.js --type=template --name=landing-page-saas --source=./template.html
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

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
  type,
  name,
  source,
  category = null,
  extract = null,
  tags = '',
  auto = false
} = args;

// ============ 驗證 ============
if (!type || !name || !source) {
  console.error('錯誤：缺少必要參數');
  console.log('\n用法：');
  console.log('  品牌資產：node save-to-library.js --type=brand --name=stripe --source=./stripe-brand/');
  console.log('  設計組件：node save-to-library.js --type=component --category=hero-sections --name=hero-bold --source=./design.html');
  console.log('  完整模板：node save-to-library.js --type=template --name=landing-page-saas --source=./template.html');
  process.exit(1);
}

if (!['brand', 'component', 'template'].includes(type)) {
  console.error('錯誤：type 必須是 brand、component 或 template');
  process.exit(1);
}

if (!fs.existsSync(source)) {
  console.error(`錯誤：源路徑不存在 ${source}`);
  process.exit(1);
}

if (type === 'component' && !category) {
  console.error('錯誤：組件必須指定 --category（如 hero-sections、card-layouts）');
  process.exit(1);
}

// ============ 主函數 ============
async function saveToLibrary() {
  console.log(`保存${getTypeName(type)}到資產庫...\n`);
  
  // 1. 初始化資產庫
  initLibrary();
  
  // 2. 確定目標路徑
  let targetPath;
  if (type === 'brand') {
    targetPath = path.join(LIBRARY_ROOT, 'brands', name);
  } else if (type === 'component') {
    targetPath = path.join(LIBRARY_ROOT, 'components', category, name);
  } else {
    targetPath = path.join(LIBRARY_ROOT, 'templates', name);
  }
  
  // 3. 檢查衝突
  if (fs.existsSync(targetPath)) {
    if (!auto) {
      console.log(`資產庫中已存在 ${name}`);
      console.log('是否覆蓋？[y/N]');
      // 實際應該等待用戶輸入，這裡簡化處理
      console.log('使用 --force 強制覆蓋');
      return;
    }
    
    // 備份舊版本
    const backupPath = `${targetPath}-backup-${Date.now()}`;
    fs.renameSync(targetPath, backupPath);
    console.log(`舊版本已備份到 ${path.basename(backupPath)}`);
  }
  
  // 4. 創建目標目錄
  fs.mkdirSync(targetPath, { recursive: true });
  
  // 5. 根據類型處理
  if (type === 'brand') {
    await saveBrand(source, targetPath);
  } else if (type === 'component') {
    await saveComponent(source, targetPath, extract);
  } else {
    await saveTemplate(source, targetPath);
  }
  
  // 6. 生成 metadata
  const metadata = await generateMetadata(type, name, category, targetPath);
  fs.writeFileSync(
    path.join(targetPath, 'metadata.json'),
    JSON.stringify(metadata, null, 2)
  );
  
  // 7. 更新索引
  updateIndex(type, name, category, targetPath, metadata);
  
  // 8. 輸出結果
  console.log('\n保存成功！\n');
  console.log(`名稱：${name}`);
  console.log(`路徑：${targetPath}`);
  console.log(`標籤：${metadata.tags.join(', ') || '無'}`);
  console.log(`\n查看資產庫：node scripts/list-library.js`);
}

/**
 * 保存品牌資產
 */
async function saveBrand(source, target) {
  console.log('📋 複製品牌資產...');
  
  // 複製所有文件
  copyDirectory(source, target);
  
  // 驗證必要文件
  const requiredFiles = ['brand-spec.md'];
  const missingFiles = requiredFiles.filter(f => !fs.existsSync(path.join(target, f)));
  
  if (missingFiles.length > 0) {
    console.warn(`缺少文件：${missingFiles.join(', ')}`);
  }
  
  // 統計資產
  const assets = {
    logos: findFiles(target, /logo.*\.(svg|png)$/i),
    colors: fs.existsSync(path.join(target, 'colors.json')),
    fonts: fs.existsSync(path.join(target, 'fonts.json')),
    productImages: findFiles(target, /product.*\.(png|jpg)$/i),
    uiScreenshots: findFiles(target, /ui.*\.(png|jpg)$/i)
  };
  
  console.log(`   ✓ Logo: ${assets.logos.length} 個`);
  console.log(`   ✓ 色值: ${assets.colors ? '是' : '否'}`);
  console.log(`   ✓ 字體: ${assets.fonts ? '是' : '否'}`);
  console.log(`   ✓ 產品圖: ${assets.productImages.length} 張`);
  console.log(`   ✓ UI 截圖: ${assets.uiScreenshots.length} 張`);
  
  return assets;
}

/**
 * 保存設計組件
 */
async function saveComponent(source, target, selector) {
  console.log('提取設計組件...');
  
  const html = fs.readFileSync(source, 'utf8');
  
  let componentHtml;
  if (selector) {
    // 提取指定選擇器的 HTML
    componentHtml = extractHtmlBySelector(html, selector);
  } else {
    // 使用整個文件
    componentHtml = html;
  }
  
  // 保存組件 HTML
  fs.writeFileSync(path.join(target, 'component.html'), componentHtml);
  
  // 提取依賴
  const dependencies = extractDependencies(componentHtml);
  
  // 生成預覽截圖
  await generatePreview(path.join(target, 'component.html'), target);
  
  console.log(`   ✓ 組件已提取`);
  console.log(`   ✓ 依賴：${dependencies.libraries.join(', ') || '無'}`);
  
  return { dependencies };
}

/**
 * 保存完整模板
 */
async function saveTemplate(source, target) {
  console.log('複製模板...');
  
  // 複製 HTML 文件
  const html = fs.readFileSync(source, 'utf8');
  fs.writeFileSync(path.join(target, 'template.html'), html);
  
  // 分析模板結構
  const sections = extractSections(html);
  const components = extractComponents(html);
  
  // 生成 README
  const readme = generateTemplateReadme(name, sections, components);
  fs.writeFileSync(path.join(target, 'README.md'), readme);
  
  // 生成預覽
  await generatePreview(path.join(target, 'template.html'), target);
  
  console.log(`   ✓ 模板已保存`);
  console.log(`   ✓ 包含 ${sections.length} 個區塊`);
  console.log(`   ✓ 使用 ${components.length} 個組件`);
  
  return { sections, components };
}

/**
 * 初始化資產庫
 */
function initLibrary() {
  const dirs = [
    LIBRARY_ROOT,
    path.join(LIBRARY_ROOT, 'brands'),
    path.join(LIBRARY_ROOT, 'components'),
    path.join(LIBRARY_ROOT, 'templates'),
    path.join(LIBRARY_ROOT, 'exports')
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  
  // 創建索引文件
  const indexPath = path.join(LIBRARY_ROOT, 'index.json');
  if (!fs.existsSync(indexPath)) {
    const index = {
      version: '1.0',
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      stats: { brands: 0, components: 0, templates: 0, totalSize: 0 },
      brands: [],
      components: [],
      templates: [],
      tags: {}
    };
    fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
  }
}

/**
 * 複製目錄
 */
function copyDirectory(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }
  
  const files = fs.readdirSync(source);
  
  files.forEach(file => {
    const sourcePath = path.join(source, file);
    const targetPath = path.join(target, file);
    
    if (fs.statSync(sourcePath).isDirectory()) {
      copyDirectory(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  });
}

/**
 * 查找文件
 */
function findFiles(dir, pattern) {
  const results = [];
  
  if (!fs.existsSync(dir)) return results;
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    
    if (fs.statSync(filePath).isDirectory()) {
      results.push(...findFiles(filePath, pattern));
    } else if (pattern.test(file)) {
      results.push(file);
    }
  });
  
  return results;
}

/**
 * 提取 HTML（按選擇器）
 */
function extractHtmlBySelector(html, selector) {
  // 簡化實現：實際應該用 JSDOM 或 Cheerio
  const regex = new RegExp(`<${selector}[^>]*>([\\s\\S]*?)</${selector}>`, 'i');
  const match = html.match(regex);
  
  return match ? match[0] : html;
}

/**
 * 提取依賴
 */
function extractDependencies(html) {
  const dependencies = {
    fonts: [],
    libraries: [],
    cssVariables: []
  };
  
  // 字體
  const fontMatches = html.matchAll(/font-family:\s*['"]?([^;'"]+)['"]?/g);
  dependencies.fonts = [...new Set([...fontMatches].map(m => m[1].split(',')[0].trim()))];
  
  // 庫
  if (html.includes('React')) dependencies.libraries.push('React');
  if (html.includes('Babel')) dependencies.libraries.push('Babel');
  if (html.includes('Stage')) dependencies.libraries.push('Stage');
  
  // CSS 變量
  const cssVarMatches = html.matchAll(/var\((--[a-z-]+)\)/g);
  dependencies.cssVariables = [...new Set([...cssVarMatches].map(m => m[1]))];
  
  return dependencies;
}

/**
 * 提取區塊
 */
function extractSections(html) {
  const sections = [];
  const sectionMatches = html.matchAll(/<section[^>]*class=['"]([^'"]+)['"]/g);
  
  for (const match of sectionMatches) {
    sections.push(match[1].split(' ')[0]);
  }
  
  return sections;
}

/**
 * 提取組件
 */
function extractComponents(html) {
  const components = [];
  const componentMatches = html.matchAll(/<([A-Z][a-zA-Z]+)/g);
  
  return [...new Set([...componentMatches].map(m => m[1]))];
}

/**
 * 生成預覽
 */
async function generatePreview(htmlPath, outputDir) {
  try {
    const playwrightPath = execSync('npm root -g', { encoding: 'utf8' }).trim();
    const playwrightBin = path.join(playwrightPath, 'playwright', 'cli.js');
    
    if (!fs.existsSync(playwrightBin)) {
      console.warn('⚠️  未安裝 Playwright，跳過預覽生成');
      return;
    }
    
    const absolutePath = path.resolve(htmlPath);
    const previewPath = path.join(outputDir, 'preview.png');
    const thumbnailPath = path.join(outputDir, 'thumbnail.png');
    
    execSync(
      `node "${playwrightBin}" screenshot "file://${absolutePath}" "${previewPath}" --viewport-size=1920,1080`,
      { stdio: 'pipe' }
    );
    
    // 生成縮略圖
    try {
      execSync(
        `convert "${previewPath}" -resize 300x200 "${thumbnailPath}"`,
        { stdio: 'pipe' }
      );
    } catch (e) {
      fs.copyFileSync(previewPath, thumbnailPath);
    }
    
    console.log('   ✓ 預覽已生成');
  } catch (error) {
    console.warn('預覽生成失敗');
  }
}

/**
 * 生成 metadata
 */
async function generateMetadata(type, name, category, targetPath) {
  const metadata = {
    type,
    name,
    displayName: name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    tags: tags ? tags.split(',').map(t => t.trim()) : []
  };
  
  if (type === 'component') {
    metadata.category = category;
  }
  
  // 計算大小
  const size = calculateDirectorySize(targetPath);
  metadata.stats = { totalSize: size };
  
  metadata.usage = {
    projectCount: 0,
    lastUsed: null
  };
  
  return metadata;
}

/**
 * 計算目錄大小
 */
function calculateDirectorySize(dir) {
  let size = 0;
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      size += calculateDirectorySize(filePath);
    } else {
      size += stats.size;
    }
  });
  
  return size;
}

/**
 * 更新索引
 */
function updateIndex(type, name, category, targetPath, metadata) {
  const indexPath = path.join(LIBRARY_ROOT, 'index.json');
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  
  // 更新統計
  index.stats[`${type}s`] = (index.stats[`${type}s`] || 0) + 1;
  index.stats.totalSize += metadata.stats.totalSize;
  index.updated = new Date().toISOString();
  
  // 添加條目
  const entry = {
    name,
    path: path.relative(LIBRARY_ROOT, targetPath),
    updated: metadata.updated,
    tags: metadata.tags
  };
  
  if (type === 'component') {
    entry.category = category;
  }
  
  // 移除舊條目（如果存在）
  index[`${type}s`] = index[`${type}s`].filter(item => item.name !== name);
  index[`${type}s`].push(entry);
  
  // 更新標籤索引
  metadata.tags.forEach(tag => {
    if (!index.tags[tag]) index.tags[tag] = [];
    if (!index.tags[tag].includes(name)) {
      index.tags[tag].push(name);
    }
  });
  
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
}

/**
 * 生成模板 README
 */
function generateTemplateReadme(name, sections, components) {
  return `# ${name}

## 區塊

${sections.map(s => `- ${s}`).join('\n')}

## 組件

${components.map(c => `- ${c}`).join('\n')}

## 使用方式

\`\`\`bash
node scripts/use-template.js --name=${name} --output=./my-project/
\`\`\`
`;
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

saveToLibrary().catch(error => {
  console.error('錯誤:', error.message);
  process.exit(1);
});
