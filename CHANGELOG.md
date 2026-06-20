# 変更履歴

このプロジェクトの主な変更を記録します。形式は
[Keep a Changelog](https://keepachangelog.com/ja/1.1.0/) に準拠し、
[セマンティックバージョニング](https://semver.org/lang/ja/) を採用します。

## [Unreleased]

## [0.2.0] - 2026-06-21
### Added
- ゲートの実機化: `bin/dango-state.mjs` に `check --<name> pass|fail` を追加し、
  ビルド/起動/スモークの合否を `check.json` に記録。`gate` は「レビュー『高』が残る」
  **または**「実機チェックに `fail` がある」を阻害要因として `continue|loop-back|escalate`
  を判定する(文書だけでなく動作で関門を閉じる)。`check` 未記録時は従来どおりレビューのみで判定。
- `dango-run` に **autoplan(計画一気通し)モード**。計画フェーズ(`dango-plan`→`dango-spec`
  →自己レビュー)を無確認で連鎖し、実装(`Edit`)の手前で人間に渡す。
### Changed
- `gate --reset` が往復カウンタに加えて前回の `check.json` も初期化(feature 跨ぎの誤ブロック防止)。
- `decisions.log` のゲート行に `checks_failed=` を追記。

## [0.1.3] - 2026-06-17
### Added
- OSS 運用の環境整備: `CODE_OF_CONDUCT.md`、`SECURITY.md`、Issue/PR テンプレート、
  GitHub Actions CI(`bin/validate.mjs` による SKILL.md 体裁・sections 参照検証)。
- README にバッジ、CONTRIBUTING に開発フロー(ブランチ+PR / rebase のみ)とリリース手順。
### Fixed
- `LICENSE` と `.gitignore` に残っていた旧名 `wagumi` の表記を修正。

## [0.1.2] - 2026-06-17
### Added
- `bin/install.mjs` が `~/.claude/CLAUDE.md` に役割ガイドを自動注入するように
  (スキルが確実に発火するようにするため)。`bin/uninstall.mjs` で除去できる。
- 本 `CHANGELOG.md` を追加。

## [0.1.1] - 2026-06-17
### Added
- 障害報告・ポストモーテム役 `dango-incident`(日本企業フォーマットの障害報告書 +
  非難なし(blameless)のポストモーテム)。

## [0.1.0] - 2026-06-17
### Added
- 初回公開。6役割: `dango-run` / `dango-plan` / `dango-spec` / `dango-review` /
  `dango-legal` / `dango-ship`。
- 核となる日本語レビュー役(全角半角・和暦・禁則・郵便番号/住所・IME/組版)。
- インストール/アンインストール、状態・決定ログ helper(Node・ビルド不要)。

[Unreleased]: https://github.com/fla9ua/dango-pack/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/fla9ua/dango-pack/compare/v0.1.3...v0.2.0
[0.1.3]: https://github.com/fla9ua/dango-pack/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/fla9ua/dango-pack/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/fla9ua/dango-pack/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/fla9ua/dango-pack/releases/tag/v0.1.0
