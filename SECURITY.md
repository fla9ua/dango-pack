# セキュリティポリシー

## 脆弱性の報告

セキュリティ上の問題を見つけた場合は、**公開 issue を立てずに**非公開で報告してください。

- GitHub の [Security Advisories](https://github.com/fla9ua/dango-pack/security/advisories/new)(推奨)
- または fla9ua@gmail.com

可能であれば、再現手順・影響範囲・想定される深刻度を添えてください。
受領後、できる範囲で速やかに確認し、対応方針を返します。

## 対象範囲

dango-pack は利用者のローカル(Claude Code / Codex)で動くスキル群と、依存ゼロの
Node スクリプト(`bin/`)です。とくに以下に関する報告を歓迎します:

- `bin/install.mjs` / `uninstall.mjs` によるファイル操作(`~/.claude/` への書き込み等)
- `bin/dango-codex.mjs` の外部コマンド実行
- スキルが生成・保存する成果物(`~/.dango-pack/`)に機微情報が漏れる経路

## 対象外

- 利用者自身の Claude Code / Codex・OS の設定に起因する問題
- サポート対象外の改変版
