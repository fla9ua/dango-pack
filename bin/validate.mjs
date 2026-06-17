#!/usr/bin/env node
// スキルとリポジトリ構成の検証(依存ゼロ)。
// - 各 skills/*/SKILL.md の frontmatter(name/description/allowed-tools)
// - name がディレクトリ名と一致するか
// - 本文が参照する sections/*.md が実在するか
// 失敗があれば非ゼロで終了(CI で利用)。

import { readFileSync, readdirSync, existsSync, lstatSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const skillsDir = join(repoRoot, "skills");
const errors = [];

for (const name of readdirSync(skillsDir)) {
  const dir = join(skillsDir, name);
  if (!lstatSync(dir).isDirectory()) continue;
  const skillPath = join(dir, "SKILL.md");
  if (!existsSync(skillPath)) {
    errors.push(`${name}: SKILL.md がありません`);
    continue;
  }
  const text = readFileSync(skillPath, "utf8");

  // frontmatter(先頭の --- ... --- ブロック)
  const fm = text.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) {
    errors.push(`${name}: frontmatter(--- ブロック)がありません`);
    continue;
  }
  const front = fm[1];
  const nameLine = front.match(/^name:\s*(\S+)/m);
  if (!nameLine) errors.push(`${name}: frontmatter に name がありません`);
  else if (nameLine[1] !== name)
    errors.push(`${name}: name "${nameLine[1]}" がディレクトリ名と不一致`);
  if (!/^description:\s*\S/m.test(front))
    errors.push(`${name}: frontmatter に description がありません`);
  if (!/^allowed-tools:/m.test(front))
    errors.push(`${name}: frontmatter に allowed-tools がありません`);

  // sections 参照切れ
  const refs = [...text.matchAll(/sections\/([\w-]+\.md)/g)].map((m) => m[1]);
  for (const ref of new Set(refs)) {
    if (!existsSync(join(dir, "sections", ref)))
      errors.push(`${name}: 参照先 sections/${ref} が存在しません`);
  }
}

if (errors.length) {
  console.error("✗ 検証失敗:");
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}
const count = readdirSync(skillsDir).filter((n) =>
  lstatSync(join(skillsDir, n)).isDirectory()
).length;
console.log(`✓ 検証OK(${count} 役割)`);
