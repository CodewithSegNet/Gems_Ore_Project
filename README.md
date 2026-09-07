# 💎 Gems – Jewelry E-Commerce Storefront

A modern, full-featured jewelry e-commerce frontend built with **React + Vite**. Includes a customer-facing storefront with product browsing, cart, checkout (Paystack), Google Auth, an admin dashboard, and more.

---

## 🚀 Tech Stack

### Core Framework

| Tool                                            | Purpose                 |
| -------------------------------------------------| -------------------------|
| [React 18](https://react.dev/)                  | UI library              |
| [Vite 6](https://vite.dev/)                     | Build tool & dev server |
| [React Router DOM v6](https://reactrouter.com/) | Client-side routing     |

### Styling & UI

| Tool                                                                                                 | Purpose                                                                |
| ------------------------------------------------------------------------------------------------------| ------------------------------------------------------------------------|
| [Tailwind CSS v3](https://tailwindcss.com/)                                                          | Utility-first CSS framework                                            |
| [MUI (Material UI v6)](https://mui.com/)                                                             | Component library                                                      |
| [Radix UI](https://www.radix-ui.com/)                                                                | Accessible headless components (Accordion, Dialog, Select, Tabs, etc.) |
| [Lucide React](https://lucide.dev/)                                                                  | Icon library                                                           |
| [React Icons](https://react-icons.github.io/react-icons/)                                            | Extended icon set                                                      |
| [Framer Motion](https://www.framer.com/motion/)                                                      | Animations & transitions                                               |
| [class-variance-authority](https://cva.style/)                                                       | Component variant management                                           |
| [clsx](https://github.com/lukeed/clsx) + [tailwind-merge](https://github.com/dcastil/tailwind-merge) | Conditional class merging                                              |

### Forms & Validation

| Tool | Purpose |
|------|---------|
| [React Hook Form](https://react-hook-form.com/) | Performant form management |
| [Zod](https://zod.dev/) | Schema-based validation |
| [@hookform/resolvers](https://github.com/react-hook-form/resolvers) | Zod ↔ RHF adapter |

### Data Fetching & State

| Tool | Purpose |
|------|---------|
| [TanStack Query v5](https://tanstack.com/query/latest) | Server state management & caching |
| [Axios](https://axios-http.com/) | HTTP client |
| Custom `fetch`-based API layer | REST calls to the backend (`/api/v1`) |

### Authentication

| Tool | Purpose |
|------|---------|
| [@react-oauth/google](https://github.com/MomenSherif/react-oauth) | Google OAuth 2.0 |
| JWT (via localStorage) | Session token storage |

### Payments

| Tool | Purpose |
|------|---------|
| [react-paystack](https://github.com/iamraphson/react-paystack) | Paystack payment integration |
| Crypto payment flow | Manual proof-of-payment upload |

### Charts & Data Visualization

| Tool | Purpose |
|------|---------|
| [Recharts](https://recharts.org/) | Admin dashboard charts |
| [React CountUp](https://github.com/glennreyes/react-countup) | Animated stat counters |

### PDF & Export

| Tool | Purpose |
|------|---------|
| [jsPDF](https://github.com/parallax/jsPDF) + [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable) | PDF generation |
| [html2pdf.js](https://github.com/eKoopmans/html2pdf.js) | HTML-to-PDF export |
| [react-to-print](https://github.com/matthewsalan/react-to-print) | Print component utility |

### Media & UX

| Tool | Purpose |
|------|---------|
| [Swiper](https://swiperjs.com/) | Touch-friendly carousels |
| [React Slick](https://react-slick.neostack.com/) + [Slick Carousel](https://kenwheeler.github.io/slick/) | Image sliders |
| [React Datepicker](https://reactdatepicker.com/) | Date pickers |
| [React Lazy Load Image Component](https://github.com/Aljullu/react-lazy-load-image-component) | Lazy image loading |
| [browser-image-compression](https://github.com/Donaldcwl/browser-image-compression) | Client-side image optimization |
| [QRCode.react](https://github.com/zpao/qrcode.react) | QR code generation |
| [Sonner](https://sonner.emilkowal.ski/) | Toast notifications |

### SEO & Meta

| Tool | Purpose |
|------|---------|
| [React Helmet Async](https://github.com/staylor/react-helmet-async) | Dynamic `<head>` management |
| `sitemap.xml` + `robots.txt` | Search engine discoverability |

### Dev Tools & Linting

| Tool | Purpose |
|------|---------|
| [ESLint v9](https://eslint.org/) | Code linting |
| [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) | React-specific lint rules |
| [PostCSS](https://postcss.org/) + [Autoprefixer](https://github.com/postcss/autoprefixer) | CSS processing |
| [TypeScript types](https://www.typescriptlang.org/) (`@types/react`) | Type support |

### Deployment

| Tool | Purpose |
|------|---------|
| [Vercel](https://vercel.com/) | Hosting & deployment (`vercel.json` configured) |

---

## 📁 Project Structure

```
Jewelry/
├── public/              # Static assets
├── src/
│   ├── admin/           # Admin dashboard pages & components
│   ├── components/      # Shared UI components
│   ├── contexts/        # React Context providers
│   ├── data/            # Static data / seed content
│   ├── features/        # Feature-specific modules
│   ├── layouts/         # Page layout wrappers
│   ├── pages/           # Route-level page components
│   │   ├── homePage/
│   │   ├── productPage/
│   │   ├── productDetailPage/
│   │   ├── cartPage/
│   │   ├── checkoutPage/
│   │   ├── loginPage/
│   │   ├── signUpPage/
│   │   ├── orderSuccessPage/
│   │   ├── transactionHistoryPage/
│   │   ├── cryptoPaymentPage/
│   │   └── ...policies
│   ├── services/        # API layer & auth services
│   │   ├── api.js       # REST client (fetch-based)
│   │   └── googleAuth.tsx
│   ├── utils/           # Helper utilities & cache
│   ├── App.tsx          # Root component with routing
│   └── main.jsx         # App entry point
├── index.html
├── vite.config.js
├── tailwind.config.js
├── vercel.json
└── package.json
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root (see `.env.example`):

```env
VITE_API_BASE_URL=http://localhost:7001
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
```

---

## 🛠️ Getting Started

### Prerequisites

- **Node.js** v18+ ([download](https://nodejs.org/))
- **npm** v9+ (bundled with Node)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/gems.git
cd gems

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env and fill in your values
```

### Running Locally

```bash
npm run dev
```

The app will start at **http://localhost:5173** (default Vite port).

### Other Scripts

```bash
# Lint the codebase
npm run lint

# Build for production
npm run build

# Preview the production build locally
npm run preview
```

---

## 🌐 Deployment (Vercel)

The project is pre-configured for Vercel with `vercel.json`. To deploy:

```bash
# Install Vercel CLI (optional)
npm i -g vercel

# Deploy
vercel
```

Or simply connect the repo to [vercel.com](https://vercel.com) and it will auto-deploy on every push to `main`.

---

## 📄 License

This project is licensed under the terms of the [LICENSE](./LICENSE) file.
