# Filip Kareta - Prague Tour Guide Website

A modern, high-performance website for Prague tour guide Filip Kareta, built with Next.js 14+ and featuring multilingual support, booking integration, and SEO optimization.

## 🚀 Tech Stack

- **Framework**: Next.js 15.5.2 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with Prague-themed design system
- **Testing**: Jest + Playwright
- **Code Quality**: ESLint + Prettier
- **Performance**: Turbopack for fast builds

## 🎨 Design System

The website features a custom Prague-themed color palette:

- **Prague Gold**: `#d4af37` - Primary brand color inspired by Prague Castle
- **Prague Stone**: `#8b7355` - Secondary color inspired by Charles Bridge
- **Prague Blue**: `#4a90a4` - Accent color inspired by the Vltava River
- **Prague Red**: `#c44536` - Highlight color inspired by Old Town rooftops
- **Prague Green**: `#5a7c65` - Supporting color inspired by Prague's parks

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/
│   ├── ui/                # Reusable UI components
│   ├── booking/           # Booking-specific components
│   ├── tours/             # Tour-related components
│   └── layout/            # Layout components (Header, Footer)
├── lib/                   # Utility libraries and constants
├── types/                 # TypeScript type definitions
├── hooks/                 # Custom React hooks
└── utils/                 # Utility functions

e2e/                       # Playwright end-to-end tests
__tests__/                 # Jest unit tests
```

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Getting Started

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Start development server**:

   ```bash
   npm run dev
   ```

3. **Run tests**:

   ```bash
   # Unit tests
   npm test

   # E2E tests
   npm run test:e2e
   ```

4. **Code quality**:

   ```bash
   # Lint code
   npm run lint

   # Format code
   npm run format
   ```

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm test` - Run Jest unit tests
- `npm run test:e2e` - Run Playwright E2E tests
- `npm run test:coverage` - Run tests with coverage report

## 🌍 Internationalization

The website supports three languages:

- English (en) - Default
- German (de)
- French (fr)

Multilingual routing will be implemented using Next.js App Router internationalization patterns.

## 📊 Performance Features

- **Static Site Generation (SSG)** for tour and blog pages
- **Server-Side Rendering (SSR)** for dynamic booking content
- **Image optimization** with Next.js Image component
- **Lazy loading** for improved performance
- **Prague-themed design system** with CSS custom properties

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file for local development:

```env
# Add environment variables as needed for:
# - Booking system API keys
# - Payment processing (Stripe/PayPal)
# - Analytics tracking IDs
# - Review system API keys
```

### Tailwind CSS

The project uses Tailwind CSS v4 with a custom Prague-themed configuration. Colors and design tokens are defined in `src/app/globals.css`.

## 📝 Next Steps

This setup provides the foundation for implementing:

1. **Multilingual routing and content management**
2. **Tour pages with booking integration**
3. **Blog system with SEO optimization**
4. **Payment processing and booking confirmation**
5. **Review integration and social proof**
6. **Performance optimization and analytics**

## 🤝 Contributing

1. Follow the established code style (ESLint + Prettier)
2. Write tests for new functionality
3. Ensure all tests pass before submitting changes
4. Use semantic commit messages

## 📄 License

This project is proprietary and confidential.
