# 新しい役割を追加する

dango-pack の役割は **SKILL.md 1枚**が単位です。コードはほぼ要りません。

## 手順

1. `skills/dango-<役割名>/SKILL.md` を作る。フロントマターは既存スキルに倣う:

   ```yaml
   ---
   name: dango-<役割名>
   version: 0.1.0
   description: "<一言で何の役割か>。(dango-pack)"
   allowed-tools: [Read, Grep, Glob, Bash, ...]
   triggers: [<自動起動の合図となる日本語/英語フレーズ>]
   ---
   ```

2. 本文に「この役割は何者か / いつ呼ぶか / 進め方 / 原則」を書く。
   観点が複数あるなら `sections/*.md` に分割し、本文から参照する
   (`dango-review` が良い手本)。

3. 並列で走らせたい点検は `agents/` にサブエージェント定義を置き、本文から
   Agent ツールで呼ぶ。

4. オーケストレータ(`dango-run`)のフローに組み込みたい場合は、その SKILL.md の
   フローに1ステップ追記する。

5. `node bin/install.mjs` でリンクし、Claude Code を再読込して試す。

## 設計の原則

- **日本特有の価値に寄せる。** 英語圏ツールと同じことをやる役割は優先度を下げる。
- **専用エンジンを足さない。** スキル連鎖・サブエージェント・ファイル成果物で表現する。
- **薄い自前層(bin/)は依存ゼロ・ビルド不要**を保つ。利用者の Node でそのまま動くこと。
- トーンは日本の開発文化に合わせ、断定で殴らず理由付きで提案する。

## 開発フロー(プルリクエスト)

`main` はブランチ保護されています。直接 push せず、以下で進めてください。

1. ブランチを切る(例: `feat/...` / `fix/...` / `chore/...`)。
2. 変更を入れ、ローカル検証を通す:
   ```bash
   node bin/validate.mjs   # SKILL.md の体裁・sections 参照切れを検査
   node bin/install.mjs    # 実際にリンクして挙動を確認
   ```
3. PR を作成。CI(`node bin/validate.mjs` ほか)が通ること。
4. **マージは rebase のみ**許可(merge commit / squash は無効)。

## リリース手順(メンテナ向け)

1. `package.json` の `version` を更新(セマンティックバージョニング)。
2. `CHANGELOG.md` に該当バージョンの項目を追記。
3. PR をマージ後、`main` にタグを打って push:
   ```bash
   git tag -a vX.Y.Z -m "vX.Y.Z — 概要"
   git push origin vX.Y.Z
   ```
