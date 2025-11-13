# Installing Claude Code in VS Code

This guide will walk you through setting up Claude Code, Anthropic's AI coding assistant, in Visual Studio Code.

## What is Claude Code?

Claude Code is an AI-powered coding assistant that integrates directly into VS Code, helping you:
- Write code faster with intelligent suggestions
- Debug issues more efficiently
- Learn best practices as you code
- Generate boilerplate code
- Refactor existing code

## Prerequisites

Before installing Claude Code, ensure you have:
- **VS Code** installed ([Download here](https://code.visualstudio.com/))
- **A Claude account** (Pro or API credits)
  - Claude Pro: $20/month (recommended for regular use)
  - API Credits: Pay-as-you-go starting at $5 (good for testing)

## Step-by-Step Installation

### Step 1: Install VS Code (if not already installed)

1. Go to [code.visualstudio.com](https://code.visualstudio.com/)
2. Download the installer for Windows
3. Run the installer and follow the prompts
4. Launch VS Code

### Step 2: Install Claude Code Extension

#### Method A: Through VS Code Marketplace (Recommended)

1. Open VS Code
2. Click the **Extensions** icon in the left sidebar (or press `Ctrl+Shift+X`)
3. In the search bar, type: **"Claude Code"**
4. Look for the official extension by **Anthropic**
5. Click **Install**

#### Method B: Through VS Code Command Palette

1. Open VS Code
2. Press `Ctrl+Shift+P` to open the Command Palette
3. Type: `Extensions: Install Extensions`
4. Search for **"Claude Code"**
5. Click **Install**

### Step 3: Get Your Claude Account

#### Option 1: Claude Pro Subscription ($20/month)

1. Go to [claude.ai](https://claude.ai)
2. Sign up for an account
3. Click **Upgrade to Pro** in the bottom left
4. Complete the payment process
5. You'll get 45 messages per 5-hour window

**Best for**: Regular development work, learning, building projects

#### Option 2: API Credits (Pay-as-you-go)

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account
3. Go to **Settings** → **API Keys**
4. Click **Create Key**
5. Add credits (minimum $5)

**Best for**: Testing Claude Code before committing to Pro

### Step 4: Authenticate Claude Code

After installing the extension:

1. You'll see a **Claude Code** icon in your VS Code sidebar
2. Click the icon
3. Click **Sign In** or **Connect Account**
4. Follow the prompts to authenticate
5. Choose your authentication method:
   - **Claude Pro**: Sign in with your claude.ai credentials
   - **API Key**: Paste your API key from the console

### Step 5: Configure Claude Code for This Project

Once authenticated:

1. Open your project in VS Code (`File` → `Open Folder`)
2. Navigate to: `C:\Users\Admin\Documents\VS-Code\Nicolas`
3. Claude Code will automatically detect the `CLAUDE.md` file
4. This file gives Claude context about your project

## Using Claude Code Effectively

### Basic Usage

#### Chat with Claude

1. Click the **Claude Code** icon in the sidebar
2. Type your question or request in the chat
3. Reference files using `@filename`
4. Examples:
   - "Explain @ProductCard.tsx"
   - "Help me debug @app/page.tsx"
   - "Create a new component for displaying cart items"

#### Inline Suggestions

As you type, Claude can provide:
- Code completions
- Function suggestions
- Quick fixes

#### Code Actions

1. Select code in your editor
2. Right-click
3. Choose **Claude Code** options:
   - Explain code
   - Refactor
   - Generate tests
   - Find bugs

### Advanced Features

#### Custom Commands with Context Files

This project includes pre-built context files in the `context/` directory:

1. **component.md** - Generate new React components
2. **page.md** - Create new Next.js pages
3. **api.md** - Build API routes
4. **types.md** - Define TypeScript types

To use them:
```
/custom @context/component.md Create a ProductFilter component
```

#### Multi-file Context

Reference multiple files for complex tasks:
```
@ProductCard.tsx @types/index.ts Update ProductCard to use the new CartItem type
```

## Project-Specific Setup

### Understanding CLAUDE.md

The `CLAUDE.md` file in your project root tells Claude Code:
- Your tech stack (Next.js, TypeScript, Tailwind)
- Coding preferences (functional components, async/await)
- Project structure
- Best practices to follow

Always keep this file updated as your project evolves.

### Effective Prompting Tips

#### Good Prompts

✅ **Specific and contextual**
```
Task: Create a Button component
Context: Next.js with Tailwind CSS
Requirements: 
- Support size prop (sm/md/lg)
- Support variant prop (primary/secondary/outline)
- Include loading state
- TypeScript with proper types
Output: Single component file
```

✅ **Reference existing code**
```
@ProductCard.tsx Refactor this component to use the new Button component from @modules/common/Button.tsx
```

#### Weak Prompts

❌ **Too vague**
```
make a button
```

❌ **No context**
```
create a product page
```

### Best Practices

1. **Start with CLAUDE.md** - Always ensure Claude has project context
2. **Be specific** - Clearly describe what you want
3. **Reference files** - Use @ to point Claude to relevant code
4. **Iterate** - Start simple, then refine with follow-up prompts
5. **Review code** - Always read and understand Claude's suggestions
6. **Learn actively** - Ask "why" and "explain" to understand concepts

## Troubleshooting

### Extension Not Appearing

- **Solution**: Reload VS Code (`Ctrl+Shift+P` → "Reload Window")
- Check that the extension is enabled in Extensions panel

### Authentication Fails

- **Claude Pro**: Ensure your subscription is active
- **API Key**: Verify the key is correct and has credits
- Try logging out and back in

### Slow Responses

- **Check your internet connection**
- **Verify Claude status**: [status.anthropic.com](https://status.anthropic.com)
- **Rate limits**: Pro has 45 messages per 5 hours
- **API credits**: Check your balance in the console

### Claude Gives Wrong Context

- **Update CLAUDE.md** with current project details
- **Be more specific** in prompts with file references
- **Clear chat history** and start a new conversation

### Code Suggestions Don't Match Style

- **Review CLAUDE.md** - Ensure coding standards are clear
- **Provide examples** of preferred style in your prompts
- **Give feedback** - Tell Claude when output doesn't match expectations

## Cost Management

### Claude Pro ($20/month)

- 45 messages per 5-hour window
- Unlimited context length (up to 200k tokens)
- Access to latest Claude Sonnet 4 model
- **Best value** for active development

### API Credits (Pay-as-you-go)

- Costs vary by usage
- Claude Sonnet 4: ~$3 per million input tokens
- Monitor usage in console.anthropic.com
- Set budget alerts to avoid surprises

### Tips to Minimize Costs

1. **Be concise** - Shorter prompts = lower costs
2. **Batch questions** - Ask multiple things in one message
3. **Use autocomplete** instead of full chat when appropriate
4. **Clear context** when starting new topics

## Keyboard Shortcuts

Default shortcuts for Claude Code:

- **Open Chat**: `Ctrl+Shift+L`
- **Quick Command**: `Ctrl+Shift+K`
- **Toggle Sidebar**: `Ctrl+Shift+C`

Customize in: `File` → `Preferences` → `Keyboard Shortcuts` → Search "Claude"

## Additional Resources

- **Claude Code Documentation**: [docs.anthropic.com/claude-code](https://docs.anthropic.com/claude-code)
- **Anthropic Support**: support@anthropic.com
- **Community Discord**: [Join the Anthropic Discord](https://discord.gg/anthropic)
- **Best Practices Guide**: Check `/docs/claude-code-best-practices.md`

## Next Steps

Now that Claude Code is installed:

1. ✅ Open this project in VS Code
2. ✅ Ensure CLAUDE.md is in the root directory
3. ✅ Try a simple prompt: "Explain the project structure"
4. ✅ Create your first component: "Help me build a ProductGrid component"
5. ✅ Reference the context files in `/context` for pre-made prompts

## Getting Help

If you run into issues:

1. **Check CLAUDE.md** - Ensure project context is correct
2. **Review this guide** - Many common issues are covered
3. **Anthropic Status Page**: [status.anthropic.com](https://status.anthropic.com)
4. **VS Code Output Panel**: `View` → `Output` → Select "Claude Code"
5. **Reload Window**: `Ctrl+Shift+P` → "Reload Window"

---

Happy coding with Claude! 🚀

Remember: Claude Code is a powerful tool, but you're the developer. Always review, understand, and test the code it generates.
