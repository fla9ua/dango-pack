# 変更履歴

このプロジェクトの主な変更を記録します。形式は
[Keep a Changelog](https://keepachangelog.com/ja/1.1.0/) に準拠し、
[セマンティックバージョニング](https://semver.org/lang/ja/) を採用します。

## [Unreleased]

## [0.2.1] - 2026-06-17
### Added
- `bin/install.mjs` が `~/.claude/CLAUDE.md` に役割ガイドを自動注入するように
  (スキルが確実に発火するようにするため)。`bin/uninstall.mjs` で除去できる。
- 本 `CHANGELOG.md` を追加。

## [0.2.0] - 2026-06-17
### Added
- 障害報告・ポストモーテム役 `dango-incident`(日本企業フォーマットの障害報告書 +
  非難なし(blameless)のポストモーテム)。

## [0.1.0] - 2026-06-17
### Added
- 初回公開。6役割: `dango-run` / `dango-plan` / `dango-spec` / `dango-review` /
  `dango-legal` / `dango-ship`。
- 核となる日本語レビュー役(全角半角・和暦・禁則・郵便番号/住所・IME/組版)。
- インストール/アンインストール、状態・決定ログ helper(Node・ビルド不要)。

[Unreleased]: https://github.com/fla9ua/dango-pack/compare/v0.2.1...HEAD
[0.2.1]: https://github.com/fla9ua/dango-pack/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/fla9ua/dango-pack/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/fla9ua/dango-pack/releases/tag/v0.1.0
