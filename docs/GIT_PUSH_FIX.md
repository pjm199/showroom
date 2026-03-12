# Git push error — fix

## What the terminal showed (terminal 6)

- You ran `git add .` then `git commit` then `git push -u origin main`.
- **Push failed** with:
  - `remote: error: File node_modules/@next/swc-win32-x64-msvc/next-swc.win32-x64-msvc.node is 141.54 MB; this exceeds GitHub's file size limit of 100.00 MB`
  - `error: failed to push some refs to 'https://github.com/pjm199/showroom.git'`

So a large file inside `node_modules` was committed at some point and is still in your history. GitHub refuses pushes that contain files over 100 MB.

There were also **warnings** (not errors) when you ran `git add .`: “LF will be replaced by CRLF” for `.env` and several `node_modules/.prisma/client/*` files. That means those paths were staged; `.env` and `node_modules` should not be in the repo.

---

## Fix: remove `node_modules` (and `.env`) from history

Your `.gitignore` already has `node_modules` and `.env`. We need to remove them from **all commits** so the next push succeeds.

### Option 1 — Use `git filter-repo` (recommended)

1. Install: <https://github.com/newren/git-filter-repo> (e.g. `pip install git-filter-repo` or use the standalone script).
2. In the repo root:
   ```bash
   git filter-repo --path node_modules --invert-paths --path .env --invert-paths --force
   ```
3. Re-add your remote (filter-repo removes remotes):
   ```bash
   git remote add origin https://github.com/pjm199/showroom.git
   ```
4. Push:
   ```bash
   git push -u origin main
   ```

### Option 2 — Use BFG Repo-Cleaner

1. Download BFG: <https://rtyley.github.io/bfg-repo-cleaner/>.
2. In the repo root:
   ```bash
   java -jar bfg.jar --delete-folders node_modules
   java -jar bfg.jar --delete-files .env
   git reflog expire --expire=now --all && git gc --prune=now --aggressive
   ```
3. Push (force if the history changed):
   ```bash
   git push -u origin main
   ```
   Use `git push -u origin main --force` only if the remote has no important commits you need to keep.

### Option 3 — Fresh repo (if the remote is empty or disposable)

If the GitHub repo has no important history:

1. On GitHub, delete the repo or create a new one.
2. Locally, remove the last commit(s) that added `node_modules`/`.env`, or start from a clean state:
   - Make sure `.gitignore` has `node_modules` and `.env`.
   - Create a new commit that only has source code (no `node_modules`, no `.env`).
3. Add the (new) remote and push:
   ```bash
   git remote add origin https://github.com/pjm199/showroom.git
   git push -u origin main
   ```

---

## After the fix

- Never run `git add .` without checking that `.env` and `node_modules` are ignored; use `git status` and only add the files you intend to commit.
- The “LF will be replaced by CRLF” messages are line-ending warnings on Windows; they don’t cause the push to fail but confirm that those files were staged — so avoid staging `.env` and `node_modules` at all.
