# Nicolas Hoodie Store

A modern e-commerce website built with Next.js 14, Supabase, Stripe, and Tailwind CSS. This project is designed as a learning journey from complete beginner to launching a functional online store.

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **State Management**: Zustand
- **Deployment**: Vercel

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18 LTS or 20 LTS ([Download here](https://nodejs.org/))
- Git ([Download here](https://git-scm.com/))
- A code editor (VS Code recommended)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd Nicolas
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Fill in the following values in `.env.local`:

#### Supabase Configuration
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → API
4. Copy your project URL and anon key

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Stripe Configuration
1. Go to [stripe.com](https://stripe.com)
2. Create an account and enable test mode
3. Go to Developers → API keys
4. Copy your publishable and secret keys

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
```

### 4. Set Up Database (Supabase)

Run the following SQL in your Supabase SQL Editor:

```sql
-- Create products table
create table products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  price decimal(10, 2) not null,
  image_url text not null,
  stock_quantity integer default 0,
  category text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create orders table (for future use)
create table orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users,
  status text default 'pending',
  total decimal(10, 2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create order_items table (for future use)
create table order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references orders on delete cascade,
  product_id uuid references products on delete cascade,
  quantity integer not null,
  price decimal(10, 2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert sample products
insert into products (name, description, price, image_url, stock_quantity, category) values
  ('Classic Black Hoodie', 'Premium heavyweight cotton hoodie in timeless black', 59.99, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7', 25, 'Classic'),
  ('Navy Blue Essential', 'Comfortable everyday hoodie with kangaroo pocket', 49.99, 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633', 30, 'Essential'),
  ('Grey Minimalist', 'Sleek minimalist design for modern style', 54.99, 'https://images.unsplash.com/photo-1620799139834-6b8f844fbe61', 20, 'Modern');
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   ├── products/          # Product pages
│   ├── cart/              # Shopping cart
│   └── api/               # API routes
├── modules/               # Feature-based components
│   ├── common/            # Shared components
│   ├── catalog/           # Product components
│   └── layout/            # Layout components
├── lib/                   # Utilities & configurations
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript types
└── styles/               # Global styles
```

## 🎯 Development Roadmap

### Phase 0: Product Showcase ✅ (You are here!)
- [x] Project setup
- [x] Basic homepage
- [x] Product card component
- [ ] Products listing page
- [ ] Product detail page

### Phase 1: Inquiry Handling
- [ ] Contact form integration
- [ ] Email notifications
- [ ] Manual order processing

### Phase 2: E-commerce Features
- [ ] Shopping cart with Zustand
- [ ] Stripe Checkout integration
- [ ] Order confirmation

### Phase 3: Advanced Features
- [ ] User authentication
- [ ] Order history
- [ ] Admin dashboard
- [ ] Inventory management

## 🧪 Testing

### Test with Stripe (Test Mode)

Use these test card numbers:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 9995

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your repository
5. Add environment variables
6. Deploy!

Vercel will automatically deploy on every push to your main branch.

## 📚 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## 🤝 Contributing

This is a learning project, but suggestions and improvements are welcome!

## 📝 License

MIT License - feel free to use this project for learning purposes.

## 🆘 Troubleshooting

### Common Issues

**Port 3000 already in use**
```bash
# Kill the process using port 3000
npx kill-port 3000
```

**Environment variables not loading**
- Ensure `.env.local` is in the root directory
- Restart the development server after adding variables
- Check that variables start with `NEXT_PUBLIC_` for client-side access

**Supabase connection errors**
- Verify your Supabase URL and anon key are correct
- Check that RLS (Row Level Security) policies allow public read access
- Ensure your Supabase project is not paused

**Image loading errors**
- Add image domains to `next.config.js`
- Check that image URLs are accessible
- Verify Next.js Image component configuration

## 📧 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the CLAUDE.md file for project context
3. Search for similar issues on Stack Overflow
4. Ask in Next.js or Supabase Discord communities

---

Built with ❤️ as a learning journey into modern web development
