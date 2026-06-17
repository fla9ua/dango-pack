#!/usr/bin/env node
// install.mjs の逆操作。~/.claude/skills/ に張った dango-pack のリンクだけを外す。
// dango-pack 本体や成果物(~/.dango-pack/)は消さない。

import { lstatSync, readlinkSync, rmSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const skillsDir = join(repoRoot, 'skills');
const target = join(homedir(), '.claude', 'skills');

const owned = new Set(readdirSync(skillsDir));
let removed = 0;

for (const name of owned) {
  const dest = join(target, name);
  const stat = lstatSync(dest, { throwIfNoEntry: false });
  if (!stat) continue;
  // dango-pack リポジトリを指すシンボリックリンクのときだけ外す(誤削除防止)
  if (stat.isSymbolicLink() && readlinkSync(dest).startsWith(skillsDir)) {
    rmSync(dest);
    console.log(`unlinked: ${name}`);
    removed++;
  }
}

console.log(removed ? '\n完了。Claude Code を再読込してください。' : 'dango-pack のリンクは見つかりませんでした。');
