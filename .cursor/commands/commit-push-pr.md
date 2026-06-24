# コミット & プッシュ & PR 作成

コミット → プッシュ → Pull Request 作成まで行う。

## 参照ルール

- コミットメッセージ: `.cursor/rules/commit-message-format.mdc`
- PR タイトル・本文: `.cursor/rules/pr-message-format.mdc`

## 手順

1. ブランチとリモートの状態を確認する（並列実行可）:
   - `git status`
   - `git diff`
   - `git branch -vv`
   - `git log --oneline -10`

2. 未コミット変更があれば `/commit-push` と同様にコミットする。
   既にコミット済みの場合はスキップする。

3. リモートへプッシュする（未プッシュの場合）:
   ```bash
   git push -u origin HEAD
   ```

4. PR 用の差分・履歴を収集する（並列実行可）:
   - ベースブランチは `main`（なければ `master`）を既定とする
   ```bash
   git log main..HEAD --oneline
   git diff main...HEAD
   ```

5. `pr-message-format.mdc` に沿って PR タイトルと本文を作成する。

6. GitHub CLI で PR を作成する:
   ```bash
   gh pr create --title "<Prefix>: <一行サマリ>" --body "$(cat <<'EOF'
   ## 概要

   ## 変更内容

   ## 技術的な詳細

   ## テスト内容

   ## 関連 Issue

   EOF
   )"
   ```

7. 作成された PR の URL をユーザーに返す。

## 注意

- ユーザーが明示的に依頼した場合のみ PR を作成する
- プッシュはユーザー指示がある場合のみ（creating-pull-requests ルールに従う）
- `gh` が未認証の場合はエラーを報告し、手動作成手順を案内する
