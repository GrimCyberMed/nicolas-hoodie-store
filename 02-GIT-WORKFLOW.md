# Git & GitHub Workflow for Beginners

## What is Git?

**Git** = Version control system (tracks changes to your code)
**GitHub** = Website that hosts your Git repositories (backups + collaboration)

Think of it like:
- **Git** = Save button with time travel
- **GitHub** = Cloud storage for your code

---

## Initial Setup (One-Time)

### 1. Install Git

**Windows:**
- Download: git-scm.com
- Run installer (use default options)

**Verify:**
```bash
git --version
# Should show: git version 2.x.x
```

### 2. Configure Git

```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# Verify:
git config --list
```

### 3. Create GitHub Account

1. Go to github.com
2. Sign up (free)
3. Verify email

### 4. Set Up SSH Key (Optional but Recommended)

**Why?** So you don't type password every time.

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your@email.com"

# Press Enter 3 times (accept defaults)

# Copy public key
cat ~/.ssh/id_ed25519.pub
```

**Add to GitHub:**
1. GitHub.com → Settings → SSH Keys → New SSH Key
2. Paste your public key
3. Save

---

## Your First Repository

### Create New Project on GitHub

**Option A: Start on GitHub (Easier)**
1. GitHub.com → New Repository
2. Name: `hoodie-store`
3. ✅ Add README
4. ✅ Add .gitignore (Node)
5. Create Repository

**Option B: Start Locally**
```bash
# In your project folder
cd hoodie-store
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub, then:
git remote add origin git@github.com:yourusername/hoodie-store.git
git push -u origin main
```

---

## Daily Workflow

### The Basic Git Cycle

```
1. Make changes to files
   ↓
2. Stage changes (git add)
   ↓
3. Commit changes (git commit)
   ↓
4. Push to GitHub (git push)
```

### Commands Explained

#### 1. Check Status (Use Often!)
```bash
git status
```
**Shows:** What files changed, what's staged, current branch

#### 2. Stage Changes
```bash
# Stage all changes
git add .

# Stage specific file
git add src/components/ProductCard.tsx

# Stage multiple files
git add file1.js file2.css file3.jsx
```

#### 3. Commit Changes
```bash
git commit -m "Add product card component"
```

**Good commit messages:**
- ✅ "Add shopping cart functionality"
- ✅ "Fix: Checkout button not clickable"
- ✅ "Update: Product card styling"

**Bad commit messages:**
- ❌ "Updates"
- ❌ "Fixed stuff"
- ❌ "asdf"

#### 4. Push to GitHub
```bash
# First time:
git push -u origin main

# After that:
git push
```

---

## Working with Branches

### What are Branches?

Branches let you work on features without breaking your main code.

```
main ────────────────────── (production-ready code)
  \
   feature/shopping-cart ─── (work in progress)
```

### Create & Use Branches

```bash
# Create new branch
git checkout -b feature/add-product-page

# See all branches
git branch

# Switch branches
git checkout main

# Delete branch (after merging)
git branch -d feature/add-product-page
```

### Branch Workflow

```bash
# 1. Start with updated main
git checkout main
git pull

# 2. Create feature branch
git checkout -b feature/shopping-cart

# 3. Make changes, commit
git add .
git commit -m "Add cart functionality"

# 4. Push branch to GitHub
git push -u origin feature/shopping-cart

# 5. Test everything works

# 6. Merge to main
git checkout main
git merge feature/shopping-cart

# 7. Push main
git push

# 8. Delete feature branch
git branch -d feature/shopping-cart
```

---

## Essential Git Commands

### Viewing History
```bash
# See commit history
git log

# Prettier version
git log --oneline --graph

# See what changed in last commit
git show
```

### Undoing Changes

#### Undo Uncommitted Changes
```bash
# Discard changes in file
git checkout -- filename.js

# Discard all changes
git checkout -- .
```

#### Undo Last Commit (Keep Changes)
```bash
git reset --soft HEAD~1
```

#### Undo Last Commit (Discard Changes)
```bash
git reset --hard HEAD~1
```

⚠️ **Warning:** `--hard` permanently deletes changes!

#### Undo Last Push
```bash
# Create new commit that undoes previous commit
git revert HEAD
git push
```

### Pulling Updates
```bash
# Get latest changes from GitHub
git pull

# If you have local changes:
git stash        # Save changes temporarily
git pull         # Get updates
git stash pop    # Restore your changes
```

---

## .gitignore File

**Purpose:** Tell Git which files to ignore

**Create:** `hoodie-store/.gitignore`

```bash
# Dependencies
node_modules/
.pnp
.pnp.js

# Next.js
/.next/
/out/
.next

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Testing
/coverage

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/

# Vercel
.vercel
```

---

## Common Problems & Solutions

### Problem: "Fatal: Not a git repository"
**Solution:**
```bash
git init
```

### Problem: "Permission denied (publickey)"
**Solution:** Set up SSH key (see Setup section)

### Problem: "Merge conflict"
**What it means:** You and GitHub have different versions of same file

**Solution:**
1. Open conflicted file
2. Look for markers:
```
<<<<<<< HEAD
Your code
=======
GitHub's code
>>>>>>> branch-name
```
3. Delete markers and keep the code you want
4. `git add .` and `git commit`

### Problem: Committed wrong files
**Solution:**
```bash
# If haven't pushed yet:
git reset --soft HEAD~1
# Fix files, then commit again

# If already pushed:
# Create new commit fixing it
```

### Problem: Want to undo everything
**Nuclear option (use carefully):**
```bash
# Reset to last working state on GitHub
git fetch origin
git reset --hard origin/main
```

---

## Best Practices

### When to Commit
✅ **Good times:**
- After finishing a feature
- Before trying something risky
- End of coding session
- After fixing a bug
- When tests pass

❌ **Bad times:**
- Every file save
- When code doesn't work
- Before understanding what you changed

### Commit Message Convention

**Format:** `type: description`

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting, no code change
- `refactor:` Code restructuring
- `test:` Adding tests

**Examples:**
```bash
git commit -m "feat: add product search"
git commit -m "fix: shopping cart total calculation"
git commit -m "docs: update README with setup instructions"
```

### Branch Naming

**Format:** `type/description`

**Examples:**
- `feature/shopping-cart`
- `feature/user-authentication`
- `fix/checkout-bug`
- `update/product-page-styling`

---

## GitHub Desktop (Alternative)

If command line feels intimidating:

**GitHub Desktop:**
- Download: desktop.github.com
- Visual interface for Git
- Easier for beginners
- Same functionality as command line

**Basic workflow:**
1. Open GitHub Desktop
2. See changed files visually
3. Check boxes to stage
4. Write commit message
5. Click "Commit to main"
6. Click "Push origin"

---

## Quick Reference Cheat Sheet

```bash
# Setup
git init                          # Start tracking project
git clone [url]                   # Download from GitHub

# Daily workflow
git status                        # Check what changed
git add .                         # Stage all changes
git commit -m "message"           # Save changes
git push                          # Upload to GitHub
git pull                          # Download from GitHub

# Branches
git branch                        # List branches
git checkout -b feature/name      # Create & switch to branch
git checkout main                 # Switch to main
git merge feature/name            # Merge branch to current

# Undo
git checkout -- .                 # Discard all changes
git reset --soft HEAD~1           # Undo last commit
git revert HEAD                   # Undo last push

# Info
git log                           # See history
git diff                          # See changes
git remote -v                     # See GitHub URL
```

---

## Integration with Vercel

**Automatic Deployment:**
Once you connect GitHub to Vercel:

1. Push to `main` branch → Auto deploys to production
2. Push to any branch → Creates preview deployment
3. Open Pull Request → Preview link appears

**Setup:**
1. Vercel.com → Import Project
2. Select GitHub repository
3. Click Deploy
4. Done! Auto-deploys on every push

---

## Next Steps

1. ✅ Install Git and configure
2. ✅ Create GitHub account
3. ✅ Initialize your project with Git
4. ✅ Make first commit
5. ✅ Push to GitHub
6. ✅ Practice the daily workflow

**Remember:** 
- Commit often (every working feature)
- Push daily (backs up your work)
- Use branches for experiments
- Read error messages carefully

---

## Learning Resources

- **Git Basics:** git-scm.com/book/en/v2
- **GitHub Guides:** guides.github.com
- **Interactive Tutorial:** learngitbranching.js.org
- **Cheat Sheet:** education.github.com/git-cheat-sheet-education.pdf

---

**You're now ready to use Git like a pro!** 🚀

Every senior developer uses these same commands. You've got this!
