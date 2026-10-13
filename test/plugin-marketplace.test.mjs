import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  copyableTrackedSkillPath,
  stageCleanSkill,
} from '../scripts/stage-clean-skill.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const pluginRoot = path.join(repoRoot, 'plugins', 'huashu-design');
const leafRoot = path.join(pluginRoot, 'skills', 'huashu-design');
const pluginVersion = '0.1.0';

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function json(relativePath) {
  return JSON.parse(read(relativePath));
}

function assertRegularFile(filePath) {
  const stat = fs.lstatSync(filePath);
  assert.equal(stat.isSymbolicLink(), false, `${filePath} must not be a symlink`);
  assert.equal(stat.isFile(), true, `${filePath} must be a regular file`);
}

function git(cwd, args) {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.error?.message);
  return result;
}

function initSkillFixture() {
  const source = fs.mkdtempSync(path.join(os.tmpdir(), 'huashu-design-fixture-'));
  fs.writeFileSync(path.join(source, 'SKILL.md'), '# huashu-design\n');
  fs.mkdirSync(path.join(source, 'assets'), { recursive: true });
  fs.writeFileSync(path.join(source, 'assets', 'banner.svg'), '<svg></svg>\n');
  fs.mkdirSync(path.join(source, 'scripts'), { recursive: true });
  fs.writeFileSync(path.join(source, 'scripts', 'verify.py'), 'print("ok")\n');
  git(source, ['init']);
  git(source, ['add', '.']);
  git(source, ['-c', 'user.email=huashu-test@example.com', '-c', 'user.name=huashu-test', 'commit', '-m', 'fixture']);
  return source;
}

test('Claude, Grok, and Codex marketplaces point at the generated plugin leaf', () => {
  const claude = json('.claude-plugin/marketplace.json');
  const grok = json('.grok-plugin/marketplace.json');
  const codex = json('.agents/plugins/marketplace.json');

  assert.equal(claude.name, 'huashu-design');
  assert.equal(grok.name, 'huashu-design');
  assert.equal(codex.name, 'huashu-design');
  assert.equal(claude.plugins[0].source, './plugins/huashu-design');
  assert.deepEqual(grok.plugins[0].source, { type: 'local', path: './plugins/huashu-design' });
  assert.deepEqual(codex.plugins[0].source, { source: 'local', path: './plugins/huashu-design' });
  assert.equal(claude.plugins[0].version, pluginVersion);
  assert.equal(grok.plugins[0].version, pluginVersion);
});

test('host plugin manifests use an independent plugin version', () => {
  const claude = json('plugins/huashu-design/.claude-plugin/plugin.json');
  const grok = json('plugins/huashu-design/plugin.json');
  const codex = json('plugins/huashu-design/.codex-plugin/plugin.json');

  assert.equal(claude.version, pluginVersion);
  assert.equal(grok.version, pluginVersion);
  assert.equal(codex.version, pluginVersion);
  assert.equal(grok.license, 'MIT');
  assert.equal(codex.skills, './skills/');
});

test('the generated Skill leaf is real files and excludes demos and plugin tooling', () => {
  for (const relative of ['SKILL.md', 'assets/banner.svg', 'scripts/verify.py', 'agents/openai.yaml']) {
    assertRegularFile(path.join(leafRoot, relative));
  }
  assert.equal(fs.existsSync(path.join(leafRoot, 'demos')), false);
  assert.equal(fs.existsSync(path.join(leafRoot, 'scripts/build-plugin-leaf.mjs')), false);
  assert.equal(fs.existsSync(path.join(leafRoot, 'scripts/stage-clean-skill.mjs')), false);
});

test('the plugin leaf stays fresh against the Skill SSoT', () => {
  const check = spawnSync(process.execPath, [path.join(repoRoot, 'scripts', 'build-plugin-leaf.mjs'), '--check'], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  assert.equal(check.status, 0, check.stderr || check.stdout);
  assert.match(check.stdout, /plugin leaf is fresh/);
});

test('the plugin release receipt matches host-visible bytes', () => {
  const check = spawnSync(process.execPath, [path.join(repoRoot, 'scripts', 'check-plugin-release.mjs')], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  assert.equal(check.status, 0, check.stderr || check.stdout);
  assert.match(check.stdout, /plugin release identity ok: 0\.1\.0/);
});

test('the plugin release gate rejects changed bytes without a version bump', () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'huashu-design-plugin-release-'));
  const gate = path.join(repoRoot, 'scripts', 'check-plugin-release.mjs');
  const writeJson = (relative, value) => {
    const target = path.join(fixture, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
  };
  try {
    writeJson('.claude-plugin/marketplace.json', { plugins: [{ version: pluginVersion }] });
    writeJson('.grok-plugin/marketplace.json', { plugins: [{ version: pluginVersion }] });
    writeJson('.agents/plugins/marketplace.json', { plugins: [] });
    for (const relative of [
      'plugins/huashu-design/plugin.json',
      'plugins/huashu-design/.claude-plugin/plugin.json',
      'plugins/huashu-design/.codex-plugin/plugin.json',
    ]) {
      writeJson(relative, { name: 'huashu-design', version: pluginVersion });
    }
    fs.writeFileSync(path.join(fixture, 'plugins/huashu-design/.codex-plugin/openai.yaml'), 'name: huashu-design\n');
    fs.mkdirSync(path.join(fixture, 'plugins/huashu-design/skills/huashu-design'), { recursive: true });
    const payload = path.join(fixture, 'plugins/huashu-design/skills/huashu-design/SKILL.md');
    fs.writeFileSync(payload, '# huashu-design\n');

    const receipt = spawnSync(process.execPath, [gate, '--root', fixture, '--write'], { encoding: 'utf8' });
    assert.equal(receipt.status, 0, receipt.stderr || receipt.stdout);
    fs.appendFileSync(payload, 'changed\n');
    const check = spawnSync(process.execPath, [gate, '--root', fixture], { encoding: 'utf8' });
    assert.notEqual(check.status, 0);
    assert.match(check.stderr, /plugin bytes changed without a version increment/);
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
});

test('Pi package declares the root Skill directory', () => {
  const root = json('package.json');
  assert.ok(root.keywords.includes('pi-package'));
  assert.deepEqual(root.pi, { skills: ['.'] });
  assert.ok(fs.existsSync(path.join(repoRoot, 'SKILL.md')));
});

test('stageCleanSkill copies tracked files only and skips untracked Skill paths', () => {
  const source = initSkillFixture();
  const dest = fs.mkdtempSync(path.join(os.tmpdir(), 'huashu-design-clean-skill-'));
  const markerName = 'review-untracked-marker.txt';
  fs.writeFileSync(path.join(source, markerName), 'should-not-pack\n');
  try {
    stageCleanSkill(source, dest);
    assert.equal(fs.existsSync(path.join(dest, 'SKILL.md')), true);
    assert.equal(fs.existsSync(path.join(dest, 'assets', 'banner.svg')), true);
    assert.equal(fs.existsSync(path.join(dest, markerName)), false);
    assert.equal(fs.existsSync(path.join(dest, 'demos')), false);
  } finally {
    fs.rmSync(source, { recursive: true, force: true });
    fs.rmSync(dest, { recursive: true, force: true });
  }
});

test('stageCleanSkill refuses to follow a tracked file symlink', () => {
  const source = initSkillFixture();
  const dest = fs.mkdtempSync(path.join(os.tmpdir(), 'huashu-design-symlink-file-'));
  try {
    const secret = path.join(source, 'secret.txt');
    fs.writeFileSync(secret, 'secret\n');
    fs.rmSync(path.join(source, 'SKILL.md'));
    fs.symlinkSync(secret, path.join(source, 'SKILL.md'));
    git(source, ['add', 'SKILL.md']);
    git(source, ['-c', 'user.email=huashu-test@example.com', '-c', 'user.name=huashu-test', 'commit', '-m', 'symlink']);
    assert.throws(() => stageCleanSkill(source, dest), /refusing to follow source symlink: SKILL.md/);
  } finally {
    fs.rmSync(source, { recursive: true, force: true });
    fs.rmSync(dest, { recursive: true, force: true });
  }
});

test('copyableTrackedSkillPath refuses a leaf symlink without following it', () => {
  const source = initSkillFixture();
  try {
    const target = path.join(source, 'secret.txt');
    fs.writeFileSync(target, 'secret\n');
    fs.rmSync(path.join(source, 'SKILL.md'));
    fs.symlinkSync(target, path.join(source, 'SKILL.md'));
    assert.throws(() => copyableTrackedSkillPath(source, 'SKILL.md'), /refusing to follow source symlink: SKILL.md/);
  } finally {
    fs.rmSync(source, { recursive: true, force: true });
  }
});
