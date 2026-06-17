#!/usr/bin/env node
// dango-pack のスキルを Claude Code が読む ~/.claude/skills/ にリンクする。
// シンボリックリンクなので、リポジトリを更新すれば即反映される。

import { symlinkSync, mkdirSync, existsSync, lstatSync, rmSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
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

// 役割ガイドを ~/.claude/CLAUDE.md に注入(マーカー間を冪等に upsert)
const START = '<!-- dango-pack:start -->';
const END = '<!-- dango-pack:end -->';
const claudeMd = join(homedir(), '.claude', 'CLAUDE.md');
const section = readFileSync(join(repoRoot, 'templates', 'claude-md-section.md'), 'utf8').trim();
const block = `${START}\n${section}\n${END}`;
let md = existsSync(claudeMd) ? readFileSync(claudeMd, 'utf8') : '';
const re = new RegExp(`${START}[\\s\\S]*?${END}`);
md = re.test(md) ? md.replace(re, block) : `${md.trimEnd()}\n\n${block}\n`;
mkdirSync(dirname(claudeMd), { recursive: true });
writeFileSync(claudeMd, md.replace(/^\n+/, ''));
console.log(`updated: ${claudeMd}(役割ガイドを注入)`);

console.log('\n完了。Claude Code を再読込してください。');
