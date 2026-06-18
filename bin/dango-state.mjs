#!/usr/bin/env node
// dango-pack 薄い自前層: 成果物ディレクトリと決定ログの管理。
// ビルド不要・依存ゼロ。利用者が既に持っている Node でそのまま動く。
//
//   node bin/dango-state.mjs init <kind>          成果物ディレクトリを用意
//   node bin/dango-state.mjs path [<kind>]        保存先パスを表示
//   node bin/dango-state.mjs decide "<判断>"      決定ログに1行追記
//   node bin/dango-state.mjs log                  決定ログを表示
//   node bin/dango-state.mjs verdict --high N [--mid N --low N] [--target T --branch B]
//                                                  レビュー結果を構造化して保存(verdict.json)
//   node bin/dango-state.mjs gate [--reset]       verdict.json と往復回数から
//                                                  continue|loop-back|escalate をコード判定

import { execSync } from 'node:child_process';
import { mkdirSync, appendFileSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

// 実装⇄レビューの往復上限。超えたら自動で回さず人間にエスカレートする(無限ループ防止)。
const MAX_ROUNDTRIPS = 3;

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

// --key value / --flag を素朴にパースする(依存ゼロのため自前)。
function parseFlags(args) {
  const out = { _: [] };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = args[i + 1];
      if (next === undefined || next.startsWith('--')) {
        out[key] = true;
      } else {
        out[key] = next;
        i++;
      }
    } else {
      out._.push(a);
    }
  }
  return out;
}

function readJson(path, fallback) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return fallback;
  }
}

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
  case 'verdict': {
    // レビュー結果を構造化して保存する。gate がこれを入力に判定する。
    const f = parseFlags(rest);
    const high = Number(f.high ?? 0);
    const mid = Number(f.mid ?? 0);
    const low = Number(f.low ?? 0);
    if (!Number.isFinite(high)) {
      console.error('verdict: --high には件数(数値)を渡してください');
      process.exit(1);
    }
    mkdirSync(base, { recursive: true });
    const verdict = {
      high, mid, low,
      target: typeof f.target === 'string' ? f.target : null,
      branch: typeof f.branch === 'string' ? f.branch : null,
      at: new Date().toISOString(),
    };
    writeFileSync(join(base, 'verdict.json'), JSON.stringify(verdict, null, 2) + '\n');
    process.stdout.write(`verdict saved: high=${high} mid=${mid} low=${low}\n`);
    break;
  }
  case 'gate': {
    // 状態(verdict + 往復回数)を読んで、continue|loop-back|escalate をコードで決める。
    // モデルはこの結果に従うだけ。3回上限の判定もここで強制する。
    mkdirSync(base, { recursive: true });
    const f = parseFlags(rest);
    const gatePath = join(base, 'gate.json');

    if (f.reset) {
      writeFileSync(gatePath, JSON.stringify({ roundtrips: 0 }, null, 2) + '\n');
      process.stdout.write('gate reset: roundtrips=0\n');
      break;
    }

    const verdict = readJson(join(base, 'verdict.json'), null);
    if (!verdict) {
      console.error('gate: verdict.json がありません。先に `verdict --high N ...` を実行してください');
      process.exit(1);
    }
    const gateState = readJson(gatePath, { roundtrips: 0 });
    const high = Number(verdict.high ?? 0);

    let action;
    if (high === 0) {
      action = 'continue';
    } else if (gateState.roundtrips < MAX_ROUNDTRIPS) {
      gateState.roundtrips += 1;
      action = 'loop-back';
    } else {
      action = 'escalate';
    }
    writeFileSync(gatePath, JSON.stringify(gateState, null, 2) + '\n');

    const iter = gateState.roundtrips;
    const line = `${new Date().toISOString()}\tgate\tstep=review\titer=${iter}\thigh=${high}\tmid=${verdict.mid ?? 0}\tlow=${verdict.low ?? 0}\taction=${action}\n`;
    appendFileSync(join(base, 'decisions.log'), line);

    const human = {
      continue: `重大度「高」なし → 次の工程へ進む (continue)`,
      'loop-back': `重大度「高」${high}件 → 実装へ戻す (loop-back ${iter}/${MAX_ROUNDTRIPS})`,
      escalate: `往復上限 ${MAX_ROUNDTRIPS} 回に達し「高」${high}件が残存 → 人間にエスカレート (escalate)`,
    }[action];
    process.stdout.write(`${human}\naction=${action}\n`);
    break;
  }
  default:
    console.error('usage: dango-state.mjs <init|path|decide|log|verdict|gate> [args]');
    process.exit(1);
}
