#!/usr/bin/env node
// dango-pack 薄い自前層: コスト/相性の都合で工程を Codex に委譲するためのラッパ。
// Claude Code 基盤から Codex を「別ドライバ」として叩く最小実装。
//
//   node bin/dango-codex.mjs "<指示文>"
//
// codex CLI が PATH に無ければ、その旨を返して呼び出し側にフォールバックさせる。

import { spawnSync } from 'node:child_process';

const prompt = process.argv.slice(2).join(' ').trim();
if (!prompt) {
  console.error('usage: dango-codex.mjs "<指示文>"');
  process.exit(1);
}

const probe = spawnSync('codex', ['--version'], { stdio: ['ignore', 'pipe', 'ignore'] });
if (probe.status !== 0) {
  console.error('codex CLI が見つかりません。この工程は Claude 側で実行してください。');
  process.exit(2);
}

// 非対話で1ショット実行(codex exec)。出力はそのまま親に渡す。
const res = spawnSync('codex', ['exec', prompt], { stdio: 'inherit' });
process.exit(res.status ?? 0);
