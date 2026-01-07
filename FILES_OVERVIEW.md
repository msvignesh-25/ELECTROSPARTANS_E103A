# Files Overview - Complete Project Structure

## 📂 Complete File Tree Structure

```
aimanager/
│
├── 📁 app/                                    # Next.js App Router (Pages & Routes)
│   ├── 📄 layout.tsx                         # Root layout with Navbar/Footer
│   ├── 📄 page.tsx                           # Home page (Business Advisor)
│   ├── 📄 globals.css                        # Global styles & Tailwind CSS
│   │
│   ├── 📁 about/
│   │   └── 📄 page.tsx                       # About page (/about route)
│   │
│   ├── 📁 contact/
│   │   └── 📄 page.tsx                       # Contact page (/contact route)
│   │
│   ├── 📁 customer/
│   │   └── 📄 page.tsx                       # Customer page (/customer route)
│   │
│   ├── 📁 owner/
│   │   └── 📄 page.tsx                       # Owner dashboard (/owner route)
│   │
│   ├── 📁 investor/
│   │   └── 📄 page.tsx                       # Investor portal (/investor route)
│   │
│   ├── 📁 ai-features/
│   │   └── 📄 page.tsx                       # AI Features page (/ai-features route)
│   │
│   └── 📁 queries/
│       └── 📄 page.tsx                       # Queries page (/queries route)
│
├── 📁 components/                            # React Components
│   ├── 📄 BusinessAdvisor.tsx               # Main Business Growth Advisor Component
│   ├── 📄 EnhancedSchedulingCalendar.tsx    # Enhanced Calendar with Reminders
│   ├── 📄 SchedulingCalendar.tsx             # Basic Scheduling Calendar
│   ├── 📄 OperationalDashboard.tsx          # Operational AI Dashboard
│   ├── 📄 MetricsDashboard.tsx              # Metrics & Analytics Dashboard
│   ├── 📄 Navbar.tsx                         # Navigation Bar Component
│   ├── 📄 Footer.tsx                         # Footer Component
│   ├── 📄 HeroSection.tsx                    # Hero Section Component
│   ├── 📄 HowItWorks.tsx                     # How It Works Section
│   ├── 📄 ThemeToggle.tsx                    # Dark/Light Theme Toggle
│   ├── 📄 Logo.tsx                           # Logo Component (TypeScript)
│   ├── 📄 Logo.jsx                           # Logo Component (JavaScript)
│   │
│   └── 📁 ai-features/                       # AI Feature Components
│       ├── 📄 AIFeaturesDashboard.tsx        # AI Features Dashboard
│       ├── 📄 AIFeaturesLink.tsx             # AI Features Link Component
│       ├── 📄 AIFlavorProfiler.tsx           # AI Flavor Profiler Quiz
│       ├── 📄 AIGuestbook.tsx                # AI Guestbook (Voice-to-Visual)
│       ├── 📄 AIOutreach.tsx                 # AI Outreach Component
│       ├── 📄 AIPoetryReceipt.tsx            # AI Poetry Receipt
│       ├── 📄 AISleeveArt.tsx                # AI-Generated Sleeve Art
│       ├── 📄 DigitalBarista.tsx             # Digital Barista Lore
│       ├── 📄 InstagramAutoPoster.tsx         # Instagram Auto Poster
│       ├── 📄 LiveAIWindowArt.tsx             # Live AI Window Art
│       ├── 📄 MysteryDrink.tsx               # Mystery Drink/Brew Feature
│       ├── 📄 SmartDynamicPricing.tsx        # Smart Dynamic Pricing
│       └── 📄 SmellToImage.tsx               # Smell-to-Image Social Contest
│
├── 📁 services/                              # Business Logic & Services
│   ├── 📄 aiServices.ts                      # AI Content Generation Services
│   ├── 📄 cartService.ts                     # Shopping Cart Management
│   ├── 📄 detailedMarketingPlanService.ts    # Detailed Marketing Plan Generator
│   ├── 📄 metricsService.ts                  # Metrics & Analytics Service
│   ├── 📄 notificationService.ts             # Notification Management Service
│   ├── 📄 operationalAIService.ts            # Operational AI Assistant Service
│   ├── 📄 schedulingService.ts               # Task Scheduling Service
│   ├── 📄 specialOccasionsService.ts         # Festival & Occasion Service
│   ├── 📄 stockMonitoringService.ts           # Stock Monitoring Service
│   ├── 📄 whatsappAlertsService.ts            # WhatsApp Alerts Service
│   └── 📄 whatsappService.ts                 # WhatsApp Integration Service
│
├── 📁 public/                                # Static Assets
│   ├── 📄 favicon.ico                        # Website Favicon
│   ├── 📄 index.html                         # HTML Template
│   ├── 📄 logo.png                           # Logo Image
│   └── 📄 vite.svg                           # Vite Logo (if used)
│
├── 📁 scripts/                               # Utility Scripts
│   ├── 📄 free-port.js                       # Cross-platform Port Freeing Script
│   ├── 📄 free-port.bat                      # Windows Batch Script
│   └── 📄 free-port.ps1                      # PowerShell Script
│
├── 📁 src/                                   # Legacy Source Files (if any)
│   ├── 📄 app.jsx                            # Legacy App Component
│   ├── 📄 main.jsx                           # Legacy Entry Point
│   ├── 📄 constants.js                       # Constants File
│   ├── 📄 index.css                          # Legacy Styles
│   │
│   ├── 📁 components/                        # Legacy Components
│   │   └── [Legacy component files]
│   │
│   └── 📁 assests/                           # Legacy Assets (typo: assets)
│       ├── 📄 hero.jpg                       # Hero Image
│       ├── 📁 steps-icons/                   # Step Icons
│       └── 📁 testimonials/                  # Testimonial Images
│
├── 📄 Configuration Files
│   ├── 📄 package.json                       # NPM Dependencies & Scripts
│   ├── 📄 package-lock.json                  # Dependency Lock File
│   ├── 📄 tsconfig.json                      # TypeScript Configuration
│   ├── 📄 tailwind.config.js                 # Tailwind CSS Configuration
│   ├── 📄 postcss.config.js                  # PostCSS Configuration
│   └── 📄 next-env.d.ts                      # Next.js TypeScript Declarations
│
└── 📄 Documentation Files
    ├── 📄 FILES_OVERVIEW.md                  # This File - Project Structure
    ├── 📄 PROJECT_DOCUMENTATION.md           # Complete Project Documentation
    ├── 📄 AI_FEATURES_README.md              # AI Features Documentation
    ├── 📄 PORT_3000_TROUBLESHOOTING.md       # Port Troubleshooting Guide
    └── 📄 readme.md                          # Project README
```

## 📊 File Statistics

### By Category

| Category | Count | Description |
|---------|-------|-------------|
| **Pages (app/)** | 9 | Next.js route pages |
| **Components** | 25 | React components |
| **Services** | 11 | Business logic services |
| **Static Assets** | 4 | Images, icons, etc. |
| **Scripts** | 3 | Utility scripts |
| **Config Files** | 6 | Configuration files |
| **Documentation** | 5 | Documentation files |
| **Total Source Files** | ~63 | Excluding node_modules & .next |

### Key Files by Size & Importance

| File | Lines | Type | Purpose |
|------|-------|------|---------|
| `components/BusinessAdvisor.tsx` | ~1,841 | Component | Main Business Growth Advisor |
| `services/detailedMarketingPlanService.ts` | ~560 | Service | Detailed Marketing Plan Generator |
| `services/operationalAIService.ts` | ~330 | Service | Operational AI Assistant |
| `components/EnhancedSchedulingCalendar.tsx` | ~370 | Component | Enhanced Scheduling Calendar |
| `app/owner/page.tsx` | ~88 | Page | Owner Dashboard |
| `app/customer/page.tsx` | ~300+ | Page | Customer Shopping Page |
| `services/aiServices.ts` | ~400+ | Service | AI Content Generation |

## 🎯 File Purpose Summary

### Core Application Files

#### Pages (app/)
- **`page.tsx`** - Home page with Business Advisor form
- **`layout.tsx`** - Root layout with Navbar & Footer
- **`about/page.tsx`** - About page
- **`contact/page.tsx`** - Contact form page
- **`customer/page.tsx`** - Customer shopping interface
- **`owner/page.tsx`** - Owner dashboard with metrics & scheduling
- **`investor/page.tsx`** - Investor portal with analytics
- **`ai-features/page.tsx`** - AI features showcase
- **`queries/page.tsx`** - Customer queries page

#### Main Components
- **`BusinessAdvisor.tsx`** - Core business growth advisor with detailed plans
- **`EnhancedSchedulingCalendar.tsx`** - Calendar with reminders & alerts
- **`OperationalDashboard.tsx`** - Operational AI dashboard
- **`MetricsDashboard.tsx`** - Shared metrics for owner & investor
- **`Navbar.tsx`** - Navigation bar
- **`Footer.tsx`** - Footer component
- **`ThemeToggle.tsx`** - Dark/light mode toggle

#### Services
- **`detailedMarketingPlanService.ts`** - Generates very detailed marketing plans
- **`operationalAIService.ts`** - Operational AI automation engine
- **`notificationService.ts`** - Handles all notifications (website + mobile)
- **`whatsappAlertsService.ts`** - WhatsApp alert system (sends to 8825484735)
- **`stockMonitoringService.ts`** - Stock level monitoring
- **`schedulingService.ts`** - Task scheduling management
- **`metricsService.ts`** - Revenue & metrics calculation
- **`specialOccasionsService.ts`** - Festival & occasion detection
- **`aiServices.ts`** - AI content generation (Instagram, outreach, etc.)
- **`cartService.ts`** - Shopping cart management

## 🔍 Quick Access Commands

```bash
# View main component
cat components/BusinessAdvisor.tsx

# View owner dashboard
cat app/owner/page.tsx

# View services
ls services/

# View all components
ls components/

# View package dependencies
cat package.json

# View TypeScript config
cat tsconfig.json
```

## 📝 File Dependencies

### BusinessAdvisor.tsx Dependencies
- `services/detailedMarketingPlanService.ts`
- `services/notificationService.ts`
- `services/whatsappAlertsService.ts`

### Owner Dashboard Dependencies
- `components/OperationalDashboard.tsx`
- `components/MetricsDashboard.tsx`
- `components/EnhancedSchedulingCalendar.tsx`
- `services/operationalAIService.ts`

### Customer Page Dependencies
- `services/cartService.ts`
- `components/` (various)

## 🚀 Build & Runtime Files (Excluded from Tree)

These files are generated and not part of source code:
- `.next/` - Next.js build output
- `node_modules/` - NPM dependencies
- `.next/cache/` - Build cache
- `tsconfig.tsbuildinfo` - TypeScript build info

## 📌 Notes

- All source files are in TypeScript (.ts/.tsx) except some legacy files
- Services are organized by functionality
- Components follow a modular structure
- All pages use Next.js App Router
- Configuration files are at root level
- Documentation files are at root level

---

**Last Updated**: Current project state
**Total Source Files**: ~63 files (excluding build artifacts)
**Main Entry Point**: `app/page.tsx`
**Core Component**: `components/BusinessAdvisor.tsx`
