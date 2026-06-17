#!/usr/bin/env node
// dango-pack のスキルを Claude Code が読む ~/.claude/skills/ にリンクする。
// シンボリックリンクなので、リポジトリを更新すれば即反映される。

import { symlinkSync, mkdirSync, existsSync, lstatSync, rmSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const skillsDir = join(repoRoot, 'skills');
const target = join(homedir(), '.claude', 'skills');
mkdirSync(target, { recursive: true });

for (const name of readdirSync(skillsDir)) {
  const src = join(skillsDir, name);
  if (!lstatSync(src).isDirectory()) continue;
  const dest = join(target, name);
  if (existsSync(dest) || lstatSync(dest, { throwIfNoEntry: false })) {
    rmSync(dest, { recursive: true, force: true });
  }
  symlinkSync(src, dest, 'dir');
  console.log(`linked: ${name} -> ${dest}`);
}

console.log('\n完了。Claude Code を再読込してください。');
