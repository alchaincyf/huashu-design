#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const DEFAULT_SKILL_SOURCE = repoRoot;

export const ALLOWED_ROOT_FILES = new Set([
  'SKILL.md',
  'LICENSE',
  'SECURITY.md',
  'package.json',
  '.env.example',
]);

export const ALLOWED_PREFIXES = ['assets/', 'references/', 'scripts/'];

export const CLEAN_SKILL_EXCLUDED_NAMES = new Set([
  'node_modules',
  '__pycache__',
  '.DS_Store',
  '.git',
]);

export const CLEAN_SKILL_EXCLUDED_FILES = new Set([
  'scripts/stage-clean-skill.mjs',
  'scripts/build-plugin-leaf.mjs',
  'scripts/check-plugin-release.mjs',
]);

function posixRelative(from, to) {
  return path.relative(from, to).split(path.sep).join('/');
}

export function shouldIncludeTrackedSkillFile(relative) {
  if (!relative || relative === '.') return false;
  if (CLEAN_SKILL_EXCLUDED_FILES.has(relative)) return false;
  const parts = relative.split('/');
  if (parts.some((part) => CLEAN_SKILL_EXCLUDED_NAMES.has(part))) return false;
  if (ALLOWED_ROOT_FILES.has(relative)) return true;
  return ALLOWED_PREFIXES.some((prefix) => relative.startsWith(prefix));
}

function walkTree(root, visit) {
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name);
    visit(full, entry);
    if (entry.isDirectory() && !entry.isSymbolicLink()) walkTree(full, visit);
  }
}

export function listTrackedSkillFiles(sourceRoot) {
  const tracked = spawnSync('git', ['ls-files', '-z', '--', '.'], {
    cwd: sourceRoot,
    encoding: 'utf8',
  });
  if (tracked.error) {
    throw new Error(`unable to enumerate tracked Skill files: ${tracked.error.message}`);
  }
  if (tracked.status !== 0) {
    throw new Error(
      `unable to enumerate tracked Skill files: ${tracked.stderr || `git ls-files exited ${tracked.status}`}`,
    );
  }
  return tracked.stdout.split('\0').filter(Boolean);
}

function isInsideRoot(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === '' || (relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
}

export function copyableTrackedSkillPath(sourceRoot, relative) {
  const sourceResolved = path.resolve(sourceRoot);
  const src = path.resolve(sourceRoot, ...relative.split('/'));
  if (!isInsideRoot(sourceResolved, src)) {
    throw new Error(`tracked Skill path escapes source root: ${relative}`);
  }
  if (!shouldIncludeTrackedSkillFile(relative)) return null;

  let stat;
  try {
    stat = fs.lstatSync(src);
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      throw new Error(`tracked Skill file is missing on disk: ${relative}`);
    }
    throw error;
  }

  if (stat.isSymbolicLink()) {
    throw new Error(`refusing to follow source symlink: ${relative}`);
  }
  if (!stat.isFile()) return null;

  const fileReal = fs.realpathSync(src);
  const sourceReal = fs.realpathSync(sourceRoot);
  if (!isInsideRoot(sourceReal, fileReal)) {
    throw new Error(`refusing to follow source symlink: ${relative}`);
  }
  return src;
}

export function stageCleanSkill(sourceRoot, destRoot) {
  fs.mkdirSync(destRoot, { recursive: true });

  for (const relative of listTrackedSkillFiles(sourceRoot)) {
    const src = copyableTrackedSkillPath(sourceRoot, relative);
    if (!src) continue;
    const destination = path.join(destRoot, relative);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(src, destination);
  }
}

export function collectRegularFiles(root) {
  const files = [];
  walkTree(root, (full, entry) => {
    if (entry.isDirectory()) return;
    files.push(posixRelative(root, full));
  });
  return files.sort();
}

export function assertNoSymlinks(root) {
  const links = [];
  walkTree(root, (full, entry) => {
    if (entry.isSymbolicLink()) links.push(posixRelative(root, full));
  });
  if (links.length > 0) {
    throw new Error(`symlinks are not allowed under ${root}:\n${links.join('\n')}`);
  }
}

export function diffTrees(leftRoot, rightRoot) {
  const left = collectRegularFiles(leftRoot);
  const right = collectRegularFiles(rightRoot);
  const missing = left.filter((file) => !right.includes(file));
  const extra = right.filter((file) => !left.includes(file));
  const changed = [];
  for (const file of left) {
    if (!right.includes(file)) continue;
    const leftBytes = fs.readFileSync(path.join(leftRoot, file));
    const rightBytes = fs.readFileSync(path.join(rightRoot, file));
    if (!leftBytes.equals(rightBytes)) changed.push(file);
  }
  return { missing, extra, changed };
}
