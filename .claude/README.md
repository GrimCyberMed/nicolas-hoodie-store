# Claude Code Custom Commands Guide

## What Are These Files?

The `.claude/prompts/` folder contains **context files** that give Claude Code specialized knowledge about different parts of your project. When you use a custom command, Claude reads the relevant context file and provides expert guidance.

## Available Commands

| Command | Purpose | Use When |
|---------|---------|----------|
| `/custom frontend-component` | Create React components | Building UI elements |
| `/custom page-layout` | Create Next.js pages | Adding new pages/routes |
| `/custom fetch-data` | Fetch from Supabase | Getting data from database |
| `/custom shopping-cart` | Cart functionality | Implementing cart features |
| `/custom stripe-checkout` | Payment processing | Adding checkout/payments |

## How to Use

### Method 1: Direct Command

1. Open Claude Code panel in VS Code
2. Type: `/custom [command-name]`
3. Add your specific request

**Example:**
```
/custom frontend-component

Create a ProductCard component that displays:
- Product image (Next.js Image)
- Product name
- Price in USD
- "Add to Cart" button
- Should be mobile responsive
```

### Method 2: Reference and Ask

1. Reference the context file: `@frontend-component.md`
2. Ask your question

**Example:**
```
@frontend-component.md

Using the patterns from this guide, create a Button component with 
primary, secondary, and outline variants.
```

## Detailed Command Usage

### `/custom frontend-component`

**When to use:**
- Creating reusable UI components
- Building product cards, buttons, forms
- Need TypeScript types for props
- Want Tailwind CSS styling patterns

**Example requests:**
```
/custom frontend-component
Create a Header component with logo, navigation, and cart icon

/custom frontend-component
Make a LoadingSpinner component that works on any background color

/custom frontend-component
Build a Modal component that can display any content as children
```

---

### `/custom page-layout`

**When to use:**
- Creating new pages in your app
- Setting up routing
- Adding SEO metadata
- Need layout structure

**Example requests:**
```
/custom page-layout
Create a products listing page at /products with SEO metadata

/custom page-layout
Make a dynamic product detail page at /products/[id]

/custom page-layout
Build a custom 404 not found page
```

---

### `/custom fetch-data`

**When to use:**
- Getting data from Supabase
- Writing database queries
- Implementing search/filter
- Pagination

**Example requests:**
```
/custom fetch-data
Fetch all products from Supabase and display in a grid

/custom fetch-data
Query products by category with price filter

/custom fetch-data
Implement pagination showing 12 products per page
```

---

### `/custom shopping-cart`

**When to use:**
- Setting up cart store
- Add/remove cart items
- Update quantities
- Calculate totals

**Example requests:**
```
/custom shopping-cart
Set up the Zustand cart store with persistence

/custom shopping-cart
Create an "Add to Cart" button that shows loading state

/custom shopping-cart
Build a cart page with quantity controls and remove buttons
```

---

### `/custom stripe-checkout`

**When to use:**
- Implementing payment processing
- Creating checkout flow
- Handling webhooks
- Testing payments

**Example requests:**
```
/custom stripe-checkout
Create the API route for Stripe checkout session

/custom stripe-checkout
Build a checkout button that redirects to Stripe

/custom stripe-checkout
Set up webhook endpoint to save orders
```

## Tips for Better Results

### 1. Be Specific

**❌ Bad:**
```
/custom frontend-component
Make a component
```

**✅ Good:**
```
/custom frontend-component
Create a ProductCard component with:
- Image (use Next.js Image component)
- Product name (h3 heading)
- Price (formatted as USD)
- Stock status (show "In Stock" or "Out of Stock")
- "Add to Cart" button with loading state
Use Tailwind CSS and TypeScript
```

### 2. Reference Existing Code

```
/custom frontend-component

I have this ProductCard component: @ProductCard.tsx
Create a similar CategoryCard component that shows category 
name, image, and product count
```

### 3. Ask for Explanations

```
/custom shopping-cart

Create the cart store, then explain:
1. Why use Zustand vs Redux
2. How persistence works
3. When to use client vs server components
```

### 4. Request Variations

```
/custom frontend-component

Show me 3 different button component designs:
1. Minimalist style
2. Bold with shadows
3. Gradient background
```

## Combining Commands

You can combine multiple commands in one conversation:

```
First, /custom page-layout to create the products page

Then /custom fetch-data to get products from Supabase

Finally /custom frontend-component to create the ProductCard
```

## Common Workflows

### Creating a New Feature

1. **Plan the structure**
   ```
   @CLAUDE.md
   I want to add a wishlist feature. What pages and components do I need?
   ```

2. **Create the page**
   ```
   /custom page-layout
   Create a wishlist page at /wishlist
   ```

3. **Build components**
   ```
   /custom frontend-component
   Create an "Add to Wishlist" heart button
   ```

4. **Fetch data**
   ```
   /custom fetch-data
   Query wishlist items from Supabase for current user
   ```

### Debugging Issues

1. **Share error and context file**
   ```
   /custom shopping-cart
   
   I'm getting this error: [paste error]
   Here's my code: @cartStore.ts
   ```

2. **Ask for best practices**
   ```
   /custom fetch-data
   
   My queries are slow. How can I optimize them?
   ```

## Context File Structure

Each context file contains:
- **Purpose:** What it helps with
- **Templates:** Ready-to-use code patterns
- **Examples:** Real implementations
- **Best Practices:** Do's and don'ts
- **Checklists:** Verification steps
- **Common Issues:** Troubleshooting

## Updating Context Files

As your project evolves, update these files:

```markdown
<!-- Add new patterns you discover -->
<!-- Document your specific needs -->
<!-- Note gotchas you encounter -->
```

Keep them in sync with your actual implementation.

## Troubleshooting

### Command not working?

1. **Check command name:** Use exact name from list
2. **Verify file exists:** Look in `.claude/prompts/`
3. **Restart VS Code:** Reload window if needed

### Getting generic responses?

1. **Be more specific** in your request
2. **Reference the context file** explicitly
3. **Provide examples** of what you want

### Claude not following patterns?

1. **Check CLAUDE.md** is up to date
2. **Reference both** CLAUDE.md and context file
3. **Explicitly mention** "Follow project conventions"

## Best Practices

### ✅ DO:
- Read context files to learn patterns
- Use commands when starting new features
- Ask for explanations of generated code
- Update context files with learnings
- Test all generated code thoroughly

### ❌ DON'T:
- Blindly copy-paste without understanding
- Ignore TypeScript errors
- Skip testing mobile responsiveness
- Forget to follow up with questions

## Learning Resources

Want to understand the code better?

1. **Ask Claude to explain:**
   ```
   Explain this code line-by-line like I'm a beginner
   ```

2. **Request alternatives:**
   ```
   Show me 2 other ways to implement this
   ```

3. **Get pros/cons:**
   ```
   What are the trade-offs of this approach?
   ```

## Examples in Action

### Example 1: Building Product Page

```
User: /custom page-layout
Create a products page with grid layout

Claude: [Provides page template]

User: Now /custom fetch-data
Fetch products from Supabase

Claude: [Provides data fetching code]

User: Finally /custom frontend-component
Create ProductCard for the grid

Claude: [Provides component]
```

### Example 2: Adding Cart

```
User: /custom shopping-cart
Set up the cart store with Zustand

Claude: [Provides store setup]

User: Create "Add to Cart" button using this store

Claude: [Provides button component]

User: Now create the cart page

Claude: [Provides cart page]
```

## Need More Help?

Check these files:
- `CLAUDE.md` - Overall project context
- `00-QUICK-START-GUIDE.md` - Development roadmap
- `01-CLAUDE-CODE-INSTALLATION.md` - Setup guide
- `02-GIT-WORKFLOW.md` - Version control
- `03-DEPLOYMENT-GUIDE.md` - Going live

## Summary

Custom commands make Claude Code an expert in:
- ✅ Your tech stack (Next.js, Supabase, Stripe)
- ✅ Your coding conventions
- ✅ Your project structure
- ✅ Common patterns you use
- ✅ Best practices for e-commerce

**Use them liberally** to build faster and learn better!

---

**Pro Tip:** Start each coding session by opening `CLAUDE.md` so Claude knows your full project context, then use specific commands as needed.
