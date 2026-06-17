#!/usr/bin/env node
// dango-pack 薄い自前層: 成果物ディレクトリと決定ログの管理。
// ビルド不要・依存ゼロ。利用者が既に持っている Node でそのまま動く。
//
//   node bin/dango-state.mjs init <kind>          成果物ディレクトリを用意
//   node bin/dango-state.mjs path [<kind>]        保存先パスを表示
//   node bin/dango-state.mjs decide "<判断>"      決定ログに1行追記
//   node bin/dango-state.mjs log                  決定ログを表示

import { execSync } from 'node:child_process';
import { mkdirSync, appendFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

function repoSlug() {
  try {
    const root = execSync('git rev-parse --show-toplevel', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString().trim();
    return root.split('/').pop();
  } catch {
    return process.cwd().split('/').pop();
  }
}

const base = join(homedir(), '.dango-pack', 'projects', repoSlug());
const [cmd, ...rest] = process.argv.slice(2);

function dirFor(kind) {
  // kind 例: review -> reviews/, plan -> plan は単一ファイルなので base 直下
  const sub = kind === 'review' ? 'reviews' : kind ? kind : '';
  const dir = sub ? join(base, sub) : base;
  mkdirSync(dir, { recursive: true });
  return dir;
}

switch (cmd) {
  case 'init': {
    const dir = dirFor(rest[0]);
    console.log(dir);
    break;
  }
  case 'path': {
    mkdirSync(base, { recursive: true });
    console.log(dirFor(rest[0]));
    break;
  }
  case 'decide': {
    mkdirSync(base, { recursive: true });
    const line = `${new Date().toISOString()}\t${rest.join(' ')}\n`;
    appendFileSync(join(base, 'decisions.log'), line);
    process.stdout.write(line);
    break;
  }
  case 'log': {
    const f = join(base, 'decisions.log');
    process.stdout.write(existsSync(f) ? readFileSync(f, 'utf8') : '(まだ決定ログはありません)\n');
    break;
  }
  default:
    console.error('usage: dango-state.mjs <init|path|decide|log> [args]');
    process.exit(1);
}
