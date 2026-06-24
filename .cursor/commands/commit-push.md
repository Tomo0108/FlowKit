# コミット & プッシュ

現在のブランチでコミットし、リモートへプッシュする。

## 参照ルール

コミットメッセージは `.cursor/rules/commit-message-format.mdc` に従う。

## 手順

1. ブランチを確認する:
   ```bash
   git branch --show-current
   ```
   - `main` / `master` への直接プッシュは禁止。別ブランチで作業すること。

2. 現在の状態を確認する（並列実行可）:
   - `git status`
   - `git diff`
   - `git log -5 --oneline`

3. （任意）品質チェックを実行する。プロジェクトに合わせてコメントを外して使う:
   ```bash
   # npm run lint
   # npm test
   # npm run build
   ```

4. `/commit-only` と同様に、ルールに沿ったメッセージでコミットする。

5. リモートへプッシュする:
   ```bash
   git push -u origin HEAD
   ```
   上流ブランチが既に設定されている場合は `git push` でよい。

6. `git status` でプッシュ完了を確認する。

## 注意

- force push（`--force` / `--force-with-lease`）はユーザー明示指示がある場合のみ
- `main` / `master` への force push は行わない
