# Installing Claude Code in VS Code

## What is Claude Code?

Claude Code is an AI coding assistant by Anthropic that helps you write, debug, and understand code directly in VS Code. It's like having an expert developer pair programming with you 24/7.

---

## Prerequisites

- VS Code installed (download from: code.visualstudio.com)
- Internet connection
- Claude account (free to create)

---

## Step-by-Step Installation

### Method 1: Install from VS Code Marketplace (Recommended)

1. **Open VS Code**

2. **Open Extensions Panel**
   - Click the Extensions icon in the left sidebar (or press `Ctrl+Shift+X`)

3. **Search for Claude Code**
   - Type "Claude Code" in the search bar
   - Look for the official extension by Anthropic

4. **Install**
   - Click the blue "Install" button
   - Wait for installation to complete (10-30 seconds)

5. **Sign In**
   - After installation, a prompt will appear
   - Click "Sign in to Claude"
   - Browser will open to claude.ai
   - Log in or create free account
   - Authorize VS Code connection

6. **Verify Installation**
   - You should see Claude icon in your VS Code sidebar
   - Click it to open Claude panel

---

## Payment Options

### Option 1: API Credits (Pay-as-you-go)
- **Cost:** ~$5 for 2-4 weeks of light usage
- **Best for:** Testing Claude Code before committing
- **Setup:** 
  1. Go to console.anthropic.com
  2. Add payment method
  3. Add $5-10 credits
  4. Copy API key
  5. In VS Code: Claude Settings → Add API Key

### Option 2: Claude Pro (Recommended)
- **Cost:** $20/month
- **Best for:** Regular development (building your store)
- **Includes:** 45 messages per 5-hour window
- **Setup:** Subscribe at claude.ai/pro

### Option 3: Claude Max
- **Cost:** $100-200/month
- **Best for:** Professional intensive development
- **Includes:** 5x more capacity than Pro

---

## Essential VS Code Extensions

Install these along with Claude Code:

### 1. ES7+ React/Redux/React-Native snippets
```
Shortcut: Type "rafce" → creates React component instantly
```

### 2. ESLint
```
Catches JavaScript errors as you type
```

### 3. Prettier - Code formatter
```
Automatically formats your code
Settings: Format on Save = ON
```

### 4. GitLens
```
Shows who changed what code and when
```

### 5. Tailwind CSS IntelliSense
```
Autocompletes Tailwind classes
```

### 6. Path Intellisense
```
Autocompletes file paths
```

### 7. Error Lens
```
Shows errors inline (easier to spot)
```

---

## Configuring Claude Code for Your Project

### 1. Create CLAUDE.md in Project Root

This file tells Claude about your project. Create: `hoodie-store/CLAUDE.md`

(See the main CLAUDE.md file created in this folder)

### 2. Create Custom Commands

Custom commands let you trigger specific Claude behaviors with `/custom [name]`

**Location:** Create `.claude/` folder in project root

---

## Using Claude Code Effectively

### Basic Usage

1. **Ask Questions**
   ```
   Q: How do I fetch data from Supabase in Next.js?
   ```

2. **Generate Code**
   ```
   Create a ProductCard component that displays:
   - Product image
   - Product name
   - Price
   - "Add to Cart" button
   Use Tailwind CSS for styling
   ```

3. **Debug Errors**
   ```
   I'm getting this error: [paste error]
   Here's my code: [paste code]
   ```

4. **Reference Files**
   ```
   @ProductCard.tsx explain this component
   ```

### Advanced Usage

**Use Custom Commands:**
```
/custom frontend-component
/custom fetch-data
/custom shopping-cart
```

**Ask for Alternatives:**
```
Show me 3 different ways to implement this feature
```

**Request Explanations:**
```
Explain this code line by line like I'm a beginner
```

---

## Claude Code Keyboard Shortcuts

- **Open Claude Panel:** `Ctrl+Shift+P` → "Claude: Open"
- **New Chat:** Click "New Chat" in Claude panel
- **Reference File:** Type `@` then filename
- **Execute Command:** Type `/custom` then command name

---

## Troubleshooting

### Claude Code Not Appearing

**Fix:**
1. Restart VS Code
2. Check Extensions panel - ensure installed
3. Sign out and sign back in

### "Rate Limited" Message

**Fix:**
- You've hit message limit for current time window
- Wait 5 hours for reset (Claude Pro)
- Or upgrade to Claude Max

### Claude Gives Wrong Answers

**Remember:**
- Claude can make mistakes
- Always review generated code
- Test thoroughly before using
- Claude doesn't have access to your specific API keys/data

### API Key Not Working

**Fix:**
1. Verify key is correct (no extra spaces)
2. Check you have credits remaining
3. Regenerate key if needed

---

## Best Practices

### ✅ DO:
- Review all generated code before using
- Ask Claude to explain unclear parts
- Use custom commands for repetitive tasks
- Keep CLAUDE.md updated with project changes
- Ask for test cases with generated code

### ❌ DON'T:
- Blindly copy-paste without understanding
- Share your API keys with anyone
- Commit API keys to Git
- Rely 100% on Claude - verify everything
- Skip learning fundamentals

---

## Cost Management

### Make Your Credits Last:

1. **Be Specific**
   - Instead of: "Help with my code"
   - Try: "Fix the undefined error on line 45 in @ProductCard.tsx"

2. **Use Documentation First**
   - Check official docs before asking Claude
   - Ask Claude only when stuck

3. **Batch Questions**
   - Ask multiple related questions in one message
   - Not multiple separate messages

4. **Use Free Resources**
   - Stack Overflow for common issues
   - Official docs for basic syntax
   - Claude for complex problem-solving

---

## Testing Your Setup

### Quick Test:

1. Create new file: `test.js`
2. Open Claude panel
3. Ask: "Write a function that adds two numbers"
4. If Claude responds with code, it's working!

### Project-Specific Test:

1. Reference your CLAUDE.md: `@CLAUDE.md`
2. Ask: "What tech stack am I using?"
3. Claude should mention Next.js, Supabase, Stripe, Tailwind

---

## Getting Help

### Resources:
- Claude Code Docs: docs.anthropic.com/claude-code
- VS Code Discord: discord.gg/vscode
- Anthropic Discord: discord.gg/anthropic
- Stack Overflow: Tag questions with `claude-code`

### Common Questions:
Q: "Is Claude Code free?"
A: No, requires payment. Start with $5 API credits or $20/mo Claude Pro.

Q: "Will Claude write my entire app?"
A: Claude helps, but you still need to understand and guide development.

Q: "Can Claude access my database?"
A: No, Claude only sees code you share. Your data is safe.

Q: "Does Claude work offline?"
A: No, requires internet connection.

---

## Next Steps

Once installed:
1. ✅ Read `CLAUDE.md` in this folder
2. ✅ Explore `.claude/prompts/` for custom commands
3. ✅ Start your Next.js project
4. ✅ Begin building with Claude's help!

---

## Need More Help?

Check these files in this directory:
- `CLAUDE.md` - Main project context
- `00-QUICK-START-GUIDE.md` - Development roadmap
- `.claude/prompts/` - Pre-made Claude commands

**You're ready to code!** 🚀
