# コミットのみ

ローカル変更をコミットする。プッシュは行わない。

## 参照ルール

コミットメッセージは `.cursor/rules/commit-message-format.mdc` に従う。

## 手順

1. 現在の状態を確認する（並列実行可）:
   - `git status`
   - `git diff`（ステージ済み・未ステージ両方）
   - `git log -5 --oneline`（直近のメッセージスタイル確認）

2. 変更内容を分析し、`commit-message-format.mdc` に沿ったメッセージを作成する。

3. コミット対象をステージングする:
   - `git add`（対象ファイルを明示。秘密情報 `.env` 等は含めない）

4. コミットする:
   ```bash
   git commit -m "$(cat <<'EOF'
   <Prefix>: <一行サマリ>

   EOF
   )"
   ```
   複数変更がある場合は HEREDOC 内に箇条書き本文を含める。

5. `git status` でコミット成功を確認する。

## 注意

- ユーザーが明示的に依頼した場合のみコミットする
- pre-commit フックで失敗した場合は amend せず、修正後に新規コミットする
- `git config` の変更は行わない
