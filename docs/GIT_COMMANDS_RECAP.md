# Git commands recap — removing `node_modules` and `.env` from history

This document recaps the Git commands used to fix the “file exceeds 100 MB” push error, with short explanations for each.

---

## The problem

- **Push failed** because a file in the repo history is over GitHub’s 100 MB limit:  
  `node_modules/@next/swc-win32-x64-msvc/next-swc.win32-x64-msvc.node` (141.54 MB).
- **Cause:** `node_modules` (and possibly `.env`) were committed in a past commit. Adding them to `.gitignore` only affects *future* commits; the big file stays in *history*, so the push still fails.
- **Fix:** Remove `node_modules` and `.env` from **every** commit (rewrite history), then force-push.

---

## Commands we used (in order)

### 1. Update `.gitignore`

**Edit (by hand or in the editor):**

- Ensure `node_modules` and `.env` are listed.
- Add an extra line so the Next.js binary is ignored even if something goes wrong later:

```gitignore
node_modules
**/next-swc.*.node
.env
```

**Why:** So these paths are never committed again. The `**/next-swc.*.node` line is a safety net for that large binary.

---

### 2. Stash local changes (so filter-branch can run)

```bash
git stash push -m "gitignore update"
```

**What it does:** Saves your current uncommitted changes (e.g. the `.gitignore` edit) and restores the working tree to the last commit.

**Why we used it:** `git filter-branch` refuses to run if there are “unstaged changes.” Stashing gives a clean state so the rewrite can proceed. You can restore the changes later with `git stash pop` (we reapplied the `.gitignore` edit manually instead).

---

### 3. Squelch the filter-branch warning (PowerShell)

```powershell
$env:FILTER_BRANCH_SQUELCH_WARNING=1
```

**What it does:** Sets an environment variable so `git filter-branch` doesn’t print its long “gotchas” warning.

**Why we used it:** Optional. It only hides the warning; the next command would run either way. Makes the output easier to read.

---

### 4. Remove `node_modules` and `.env` from all commits (history rewrite)

```bash
git filter-branch --force --index-filter "git rm -rf --cached --ignore-unmatch node_modules .env" --prune-empty HEAD
```

**What it does:**

- **`filter-branch`** — Rewrites the history of the current branch (`HEAD`).
- **`--force`** — Allows overwriting the existing backup refs if you run it again.
- **`--index-filter "..."`** — For each commit, runs the given command in the index (staged files) only; doesn’t touch your working directory.
- **`git rm -rf --cached --ignore-unmatch node_modules .env`** — Removes `node_modules` and `.env` from the index in that commit. `--cached` = only from Git, not from disk. `--ignore-unmatch` = don’t fail if the path doesn’t exist in that commit.
- **`--prune-empty`** — Drops commits that end up with no changes (e.g. “only removed node_modules”).
- **`HEAD`** — Rewrite the branch you’re on (e.g. `main`).

**Why we used it:** This is what actually removes the big file (and the rest of `node_modules` and `.env`) from **every** commit. After this, the history no longer contains those paths, so the push can succeed.

**Note:** Commit hashes change after a history rewrite. That’s expected.

---

### 5. Unstage everything (clean the index)

```bash
git reset HEAD
```

**What it does:** Unstages all files. Your working directory is unchanged; only the “staging area” (index) is cleared.

**Why we used it:** After `filter-branch`, the index can still list many files (e.g. from backup refs or leftover state). Resetting ensures we don’t accidentally commit `node_modules` or `.env` again when we make the next commit (e.g. the `.gitignore` update).

---

### 6. Commit the updated `.gitignore`

```bash
git add .gitignore
git commit -m "chore: ignore node_modules and next-swc binary in .gitignore"
```

**What it does:** Stages only `.gitignore` and creates a new commit with the updated ignore rules.

**Why we used it:** To record the safer `.gitignore` in the rewritten history so future `git add` behavior is correct.

---

### 7. Remove filter-branch backup refs (PowerShell)

```powershell
git for-each-ref --format="%(refname)" refs/original | ForEach-Object { git update-ref -d $_ }
```

**What it does:**

- **`git for-each-ref --format="%(refname)" refs/original`** — Lists all refs under `refs/original/` (where `filter-branch` saves the old branch state).
- **`ForEach-Object { git update-ref -d $_ }`** — Deletes each of those refs.

**Why we used it:** Until these refs are removed, Git still keeps the old (big) objects. Deleting the backup refs allows the next step to reclaim that space.

---

### 8. Expire reflog and run garbage collection

```bash
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

**What it does:**

- **`git reflog expire --expire=now --all`** — Marks all reflog entries as expired so they can be pruned.
- **`git gc --prune=now --aggressive`** — Garbage collection: removes unreachable objects (including the old commits that had `node_modules` and `.env`) and compresses the repo.

**Why we used it:** To actually free disk space and shrink the repository after rewriting history and deleting `refs/original`.

---

### 9. Push the rewritten history to GitHub

```bash
git push --force -u origin main
```

**What it does:**

- **`--force`** — Overwrites the remote `main` with your local `main`. Needed because we changed history (new commit hashes).
- **`-u origin main`** — Sets the upstream of your current branch to `origin main` so future `git push` / `git pull` use that branch by default.

**Why we used it:** The remote still had (or would have had) the old history with the 141 MB file. Our local history no longer contains it, so we must force-push to replace the remote history. **Only do this if you’re sure no one else relies on the existing remote history** (e.g. empty repo or only your own failed pushes).

---

## Quick reference (command list only)

```bash
# 1. Edit .gitignore (node_modules, **/next-swc.*.node, .env)
git stash push -m "gitignore update"
$env:FILTER_BRANCH_SQUELCH_WARNING=1   # PowerShell
git filter-branch --force --index-filter "git rm -rf --cached --ignore-unmatch node_modules .env" --prune-empty HEAD
git reset HEAD
git add .gitignore
git commit -m "chore: ignore node_modules and next-swc binary in .gitignore"
git for-each-ref --format="%(refname)" refs/original | ForEach-Object { git update-ref -d $_ }   # PowerShell
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force -u origin main
```

---

## See also

- **`docs/GIT_PUSH_FIX.md`** — Problem summary and alternative fixes (e.g. `git filter-repo`, BFG, fresh repo).
