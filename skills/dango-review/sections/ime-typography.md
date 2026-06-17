# 観点: IME・タイポグラフィ

日本語入力(IME)はキー入力と確定が分離するため、欧文前提のUIロジックが壊れる。
表示面では日本語フォント・文字数カウントが地雷になる。

## 検出パターン

### 1. IME変換中の誤確定 ★重大度高
- 変換中(未確定)の Enter で検索・送信が走る、`onChange` で毎キー検索が飛ぶ。
- `compositionstart` / `compositionend` を見ているか確認。
  ```js
  let composing = false;
  el.addEventListener('compositionstart', () => composing = true);
  el.addEventListener('compositionend', () => composing = false);
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (composing || e.isComposing)) return; // 確定キーを無視
    // ...送信処理
  });
  ```
- React なら `onCompositionStart/End` + `e.nativeEvent.isComposing` を確認。
- Grep 例: `rg 'isComposing|composition|onKeyDown|keydown|onChange'`

### 2. 日本語フォント指定
- `font-family` に日本語フォントの fallback があるか。欧文フォント単独だと
  環境次第で表示が崩れる。
- 例: `font-family: system-ui, "Hiragino Sans", "Noto Sans JP", "Yu Gothic", sans-serif;`
- Grep 例: `rg 'font-family'`

### 3. 文字数カウント ★誤りやすい
- `str.length` は UTF-16 コード単位。絵文字・サロゲートペアで実際の文字数とずれる。
  - 「𠮟」「🍣」などで `length` が 2 になる。
  - 書記素単位で数えるなら `Intl.Segmenter` か `[...str].length`(コードポイント)。
- 全角=2文字としてカウントすべき要件(SMS・帳票)があるか確認。
- Grep 例: `rg '\.length|maxLength|文字数|文字以内'`

### 4. プレースホルダ・ラベルの体裁
- プレースホルダを必須情報の説明に使っていないか(入力すると消える)。
- 半角スペースでの位置調整(全角環境で崩れる)。

### 5. 縦書き・長文表示
- `writing-mode: vertical-rl` を使う場合、約物・英数字の向き、スクロール方向。
- 長い日本語見出しの省略 `text-overflow: ellipsis` が効く前提(`white-space`)。

## 直し方の指針
- 検索/送信フォームは必ず `isComposing` ガードを入れる(最優先で指摘)。
- 文字数制限は要件を確認し、書記素なら `Intl.Segmenter('ja')` を提案。
- `font-family` に日本語 fallback を追加する具体修正を出す。
