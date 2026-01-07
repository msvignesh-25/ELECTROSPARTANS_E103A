# AI-Powered Business Management System - Complete Project Documentation

## 📋 Project Overview

This is a **comprehensive Next.js 14 web application** (using the App Router) that serves as an **AI-powered business management and growth assistant** designed specifically for small and family-run businesses. The system provides:

- **Business Growth Advisor**: Personalized marketing strategies based on constraints
- **Operational AI Assistant**: Automated task scheduling, stock monitoring, and alerts
- **Owner Dashboard**: Complete business overview with metrics and scheduling
- **Customer Interface**: Shopping experience with cart management
- **Investor Portal**: Analytics and performance metrics
- **AI Features**: 13+ unique AI-powered marketing features

### Core Purpose
The application helps business owners by:
- Analyzing specific resource constraints (budget, time, team size)
- Providing **very detailed, step-by-step execution plans** with exact rupee breakdowns
- Automatically generating daily task lists based on constraints
- Monitoring stock levels and sending alerts via WhatsApp
- Tracking sales performance and growth metrics
- Offering unique AI-powered marketing experiences
- Sending automated notifications to owners and customers

---

## 🏗️ Architecture & Technology Stack

### Framework & Language
- **Next.js 14.2.30** (React-based framework with App Router)
- **TypeScript 5.3.3** (for type safety)
- **React 18.3.1** (UI library)
- **Tailwind CSS 3.4.1** (utility-first CSS framework)

### Build Tools
- **PostCSS 8.4.35** (CSS processing)
- **Autoprefixer 10.4.17** (CSS vendor prefixing)
- **TypeScript compiler** (type checking and compilation)

### Key Features
- **Server-Side Rendering (SSR)** with Next.js App Router
- **Client-Side State Management** with React Hooks
- **Local Storage** for data persistence
- **WhatsApp Integration** for alerts (8825484735)
- **Responsive Design** with Tailwind CSS
- **Dark Mode Support** throughout

---

## 📁 Complete Project Structure

### Application Pages (app/)

```
app/
├── layout.tsx                    # Root layout with Navbar/Footer
├── page.tsx                      # Home page (Business Advisor)
├── globals.css                   # Global styles & Tailwind
│
├── about/
│   └── page.tsx                  # About page (/about)
│
├── contact/
│   └── page.tsx                  # Contact page (/contact)
│
├── customer/
│   └── page.tsx                  # Customer shopping page (/customer)
│
├── owner/
│   └── page.tsx                  # Owner dashboard (/owner)
│
├── investor/
│   └── page.tsx                  # Investor portal (/investor)
│
├── ai-features/
│   └── page.tsx                  # AI features showcase (/ai-features)
│
└── queries/
    └── page.tsx                  # Customer queries page (/queries)
```

### Components

```
components/
├── BusinessAdvisor.tsx           # Main Business Growth Advisor (~1,841 lines)
├── EnhancedSchedulingCalendar.tsx # Enhanced Calendar with Reminders
├── SchedulingCalendar.tsx         # Basic Scheduling Calendar
├── OperationalDashboard.tsx      # Operational AI Dashboard
├── MetricsDashboard.tsx          # Shared Metrics Dashboard
├── Navbar.tsx                    # Navigation Bar
├── Footer.tsx                    # Footer Component
├── HeroSection.tsx               # Hero Section
├── HowItWorks.tsx                # How It Works Section
├── ThemeToggle.tsx               # Dark/Light Theme Toggle
├── Logo.tsx                      # Logo Component
│
└── ai-features/                  # AI Feature Components (13 files)
    ├── AIFeaturesDashboard.tsx
    ├── AIFeaturesLink.tsx
    ├── AIFlavorProfiler.tsx      # AI Flavor Profiler Quiz
    ├── AIGuestbook.tsx           # Voice-to-Visual Guestbook
    ├── AIOutreach.tsx            # AI Outreach Automation
    ├── AIPoetryReceipt.tsx       # AI Poetry Receipt
    ├── AISleeveArt.tsx           # AI-Generated Sleeve Art
    ├── DigitalBarista.tsx        # Digital Barista Lore
    ├── InstagramAutoPoster.tsx   # Instagram Auto Posting
    ├── LiveAIWindowArt.tsx       # Live AI Window Art
    ├── MysteryDrink.tsx          # Mystery Drink/Brew
    ├── SmartDynamicPricing.tsx   # Smart Dynamic Pricing
    └── SmellToImage.tsx          # Smell-to-Image Contest
```

### Services (Business Logic)

```
services/
├── detailedMarketingPlanService.ts  # Very Detailed Marketing Plans
├── operationalAIService.ts          # Operational AI Assistant Engine
├── notificationService.ts            # Notification Management
├── whatsappAlertsService.ts         # WhatsApp Alerts (8825484735)
├── stockMonitoringService.ts        # Stock Level Monitoring
├── schedulingService.ts              # Task Scheduling
├── metricsService.ts                 # Revenue & Metrics Calculation
├── specialOccasionsService.ts       # Festival & Occasion Detection
├── aiServices.ts                     # AI Content Generation
├── cartService.ts                    # Shopping Cart Management
└── whatsappService.ts                # WhatsApp Integration
```

### Static Assets & Scripts

```
public/
├── favicon.ico
├── logo.png
└── index.html

scripts/
├── free-port.js                    # Cross-platform port freeing
├── free-port.bat                   # Windows batch script
└── free-port.ps1                   # PowerShell script
```

---

## 🔑 Key Features & Components Explained

### 1. **BusinessAdvisor.tsx** - Main Growth Advisor Component ⭐

**Purpose**: Core component that generates very detailed, step-by-step marketing execution plans

**Key Features**:
- **Very Detailed Execution Plans**: No generic phrases, only specific actions
- **Exact Rupee Breakdown**: Every rupee accounted for in budget
- **Worker Assignments**: Specific tasks for each worker
- **Time-Based Execution**: Week-by-week or day-by-day plans
- **Goal-Specific**: Completely different plans for Visibility/Sales/Expansion
- **WhatsApp Integration**: Sends shop info to 8825484735 on form submission

**Input Fields**:
1. Business Type
2. Monthly Budget (in rupees) - with ₹ symbol
3. Hours Available Per Day
4. Number of Workers
5. Growth Goal (Visibility/Sales/Expansion)
6. Target Time Span (days)
7. Owner Mobile Number (for WhatsApp alerts)

**Output Sections**:
1. Business Summary
2. Selected Growth Goal
3. Exact Marketing Actions (WHAT, HOW, WHO, COST, WHERE, WHEN)
4. Exact Budget Breakdown (₹-wise table)
5. Worker-Wise Task Assignment
6. Time-Based Execution Plan
7. Task Classification (Automated/AI-Assisted/Human-Only)
8. AI Contribution Summary
9. Safety Note

**Lines of Code**: ~1,841 lines

---

### 2. **EnhancedSchedulingCalendar.tsx** - Enhanced Calendar

**Purpose**: Advanced scheduling calendar with automated reminders and alerts

**Features**:
- **Daily Task Generation**: Auto-generates tasks based on constraints
- **Stock Alerts**: Same-day alerts when stock is about to exhaust
- **Festival Reminders**: Reminds to advertise on website and Instagram
- **WhatsApp Alerts**: Sends alerts to owner's mobile (8825484735 for stock)
- **Sales Monitoring**: Alerts when sales drop >20%
- **Refresh Button**: Manual refresh capability
- **Auto-Update**: Refreshes every 2 minutes

**Displays**:
- Today's Tasks
- Upcoming Tasks (next 7 days)
- Stock Alerts
- Special Occasions
- Recent Notifications

---

### 3. **OperationalDashboard.tsx** - Operational AI Dashboard

**Purpose**: Central dashboard for operational AI assistant

**Features**:
- **Today's Tasks**: Auto-generated from constraints
- **Upcoming Tasks**: Next 7 days
- **Urgent Alerts**: Stock, sales, and occasion alerts
- **All Notifications**: Website and mobile notifications
- **Settings**: Owner mobile, customer registration

**Integration**:
- Uses `operationalAIService.ts` for automation
- Integrates with `notificationService.ts`
- Connects to `stockMonitoringService.ts`
- Links with `schedulingService.ts`

---

### 4. **MetricsDashboard.tsx** - Shared Metrics

**Purpose**: Shared dashboard for owner and investor

**Metrics Displayed**:
- **Monthly Revenue**: Factual, auto-updated
- **Orders Completed**: Total orders this month
- **Repeated Customers**: Customers who submitted reviews
- **Growth Trend**: Last 6 months with visualization
- **Average Order Value**: Calculated automatically
- **Customer Retention Rate**: Percentage

**Features**:
- Auto-updates from order data
- Visual growth trend chart
- No predictions, only factual data
- Visible to both owner and investor

---

### 5. **Owner Dashboard** (`app/owner/page.tsx`)

**Purpose**: Complete owner dashboard

**Sections**:
1. **Operational Dashboard**: Tasks, alerts, notifications
2. **Metrics Dashboard**: Revenue, orders, customers, growth
3. **Enhanced Scheduling Calendar**: Reminders and alerts

**Features**:
- Loads business constraints from BusinessAdvisor
- Loads weekly plan for task generation
- Displays all operational information
- Real-time updates

---

### 6. **Customer Page** (`app/customer/page.tsx`)

**Purpose**: Customer shopping interface

**Features**:
- Product catalog with stock status
- Shopping cart functionality
- Stock updates when items added to cart
- Currency in rupees (₹)
- Responsive design

**Integration**:
- Uses `cartService.ts` for cart management
- Updates stock in real-time

---

### 7. **Investor Portal** (`app/investor/page.tsx`)

**Purpose**: Investor analytics portal

**Features**:
- Shared metrics dashboard
- Business statistics
- AI-powered insights
- Growth analysis

---

## 🔧 Services Explained

### 1. **detailedMarketingPlanService.ts**

**Purpose**: Generates VERY SPECIFIC, ACTION-ORIENTED marketing plans

**Key Functions**:
- `generateDetailedPlan()`: Creates detailed execution plan
- **No Generic Phrases**: Only specific physical/digital actions
- **Exact Rupee Breakdown**: Every rupee accounted for
- **Worker Assignments**: Specific tasks per worker
- **Time-Based Execution**: Week-by-week breakdown

**Output Structure**:
- Business Summary
- Exact Actions (WHAT, HOW, WHO, COST, WHERE, WHEN)
- Budget Breakdown (item, quantity, unit cost, total)
- Worker Assignments
- Time-Based Execution Plan
- Task Classification
- AI Contribution Summary
- Safety Note

---

### 2. **operationalAIService.ts**

**Purpose**: Operational AI automation engine

**Key Functions**:
- `generateDailyTasks()`: Auto-generates daily tasks
- `monitorStockAndAlert()`: Monitors stock and sends alerts
- `monitorSalesAndAlert()`: Monitors sales and alerts on drops
- `checkFestivalsAndRemind()`: Detects festivals and adds tasks

**Features**:
- Executes actions automatically (not just suggestions)
- Integrates with all other services
- Pauses advertising when stock exhausted
- Sends notifications to website and mobile

---

### 3. **notificationService.ts**

**Purpose**: Centralized notification management

**Key Functions**:
- `sendNotification()`: Sends to website and mobile
- `sendCustomerNotification()`: Sends to registered customers
- `setOwnerMobileNumber()`: Sets owner's mobile
- `registerCustomer()`: Registers customers for alerts

**Features**:
- Website notifications (always)
- Mobile notifications (when number provided)
- Customer notifications with preferences
- Frequency limits (max 1 per day per customer)

---

### 4. **whatsappAlertsService.ts**

**Purpose**: WhatsApp alert system

**Key Functions**:
- `sendWhatsAppAlert()`: Sends WhatsApp alert
- `generateStockExhaustedAlert()`: Stock exhaustion alert
- `generateLowStockAlert()`: Low stock alert
- `generateSalesDropAlert()`: Sales drop alert
- `generateSpecialOccasionAlert()`: Festival reminder

**Default Number**: 8825484735 (for stock alerts and shop registration)

**Features**:
- Always sends stock alerts to 8825484735
- Sends shop registration info to 8825484735
- Stores alerts in localStorage
- Prepares WhatsApp URLs

---

### 5. **stockMonitoringService.ts**

**Purpose**: Stock level monitoring

**Key Functions**:
- `checkStockLevels()`: Checks all products
- `saveStockAlerts()`: Saves alerts
- `loadStockAlerts()`: Loads saved alerts

**Thresholds**:
- **Low**: < 10 units
- **Critical**: < 5 units
- **Exhausted**: 0 units

---

### 6. **schedulingService.ts**

**Purpose**: Task scheduling management

**Key Functions**:
- `scheduleTasksFromWeeklyPlan()`: Schedules from weekly plan
- `getTasksForDay()`: Gets tasks for specific day
- `checkAndSendTaskReminders()`: Checks and sends reminders

---

### 7. **metricsService.ts**

**Purpose**: Revenue and metrics calculation

**Key Functions**:
- `calculateMonthlyRevenue()`: Calculates current month revenue
- `getPreviousMonthRevenue()`: Gets previous month
- `getMetricsData()`: Gets all metrics data

**Metrics**:
- Monthly revenue
- Orders completed
- Repeated customers
- Growth trend
- Average order value
- Customer retention rate

---

### 8. **specialOccasionsService.ts**

**Purpose**: Festival and occasion detection

**Key Functions**:
- `checkUpcomingOccasions()`: Checks upcoming festivals
- `generateOccasionReminder()`: Generates reminder

**Features**:
- Detects festivals and special occasions
- Adds advertising tasks automatically
- Sends reminders to owner
- Sends promotional notifications to customers

---

### 9. **aiServices.ts**

**Purpose**: AI content generation

**Key Functions**:
- `generateInstagramPost()`: Instagram post generation
- `generateOutreachMessage()`: Outreach message generation
- `generateReceiptPoem()`: Poetry receipt generation
- `generateWindowArtPrompt()`: Window art prompt
- `generateFlavorProfile()`: Flavor profiler quiz
- And many more AI features...

**Features**:
- Highly specific to shop data
- Varies based on owner inputs
- Generates personalized content

---

### 10. **cartService.ts**

**Purpose**: Shopping cart management

**Key Functions**:
- `addToCart()`: Adds product to cart
- `removeFromCart()`: Removes from cart
- `clearCart()`: Clears entire cart
- `getCartTotal()`: Calculates total
- `updateStock()`: Updates product stock

**Features**:
- Stock updates when items added
- Stock restoration when removed
- Cart persistence

---

## 🔄 Application Flow

### User Journey - Business Owner

1. **Home Page** (`/`)
   - Fills Business Advisor form
   - Enters business details, budget (₹), time, workers, goal
   - Enters owner mobile number
   - Clicks "Get My Growth Strategy"

2. **Form Submission**
   - WhatsApp message sent to 8825484735 with shop info
   - Detailed marketing plan generated
   - Weekly plan saved to localStorage
   - Owner mobile number saved

3. **Results Display**
   - Very detailed execution plan shown
   - Exact rupee breakdown
   - Worker assignments
   - Time-based execution plan
   - Task classification

4. **Owner Dashboard** (`/owner`)
   - Views operational dashboard
   - Sees today's tasks (auto-generated)
   - Monitors stock alerts
   - Views metrics dashboard
   - Checks scheduling calendar

5. **Automated Operations**
   - Stock monitoring (every 5 minutes)
   - Sales monitoring (continuous)
   - Festival detection (daily)
   - Task generation (every 2 minutes)
   - WhatsApp alerts (when needed)

### User Journey - Customer

1. **Customer Page** (`/customer`)
   - Browses products
   - Views stock status
   - Adds items to cart
   - Stock updates automatically
   - Checks out

2. **Order Completion**
   - Order saved to metrics
   - Revenue calculated
   - Metrics updated

### User Journey - Investor

1. **Investor Portal** (`/investor`)
   - Views shared metrics dashboard
   - Sees revenue, orders, customers
   - Analyzes growth trends
   - Gets AI-powered insights

---

## 🧠 Algorithm Logic

### Detailed Marketing Plan Generation

**Goal-Specific Logic**:

#### If Goal = "Increase Visibility"
- **Actions**: Pamphlet distribution, poster placement, Google Maps optimization
- **Budget Allocation**: 30% pamphlets, 20% posters, rest for other items
- **Tasks**: Physical distribution, directory submissions, review collection
- **No Sales Focus**: Only awareness actions

#### If Goal = "Increase Sales"
- **Actions**: WhatsApp offers, in-store upselling, repeat customer reminders
- **Budget Allocation**: 40% offer flyers, 20% packaging inserts
- **Tasks**: Messaging, follow-ups, promotions
- **No Expansion Focus**: Only conversion actions

#### If Goal = "Business Expansion"
- **Actions**: Partner identification, collaboration meetings, pilot tests
- **Budget Allocation**: 30% meetings, 20% pilot programs
- **Tasks**: Research, outreach, documentation
- **No Promotional Focus**: Only scale-oriented actions

### Stock Monitoring Logic

```typescript
if (stock === 0) {
  // Exhausted - Send urgent alert to 8825484735
  // Pause advertising tasks
} else if (stock <= 5) {
  // Critical - Send high priority alert
} else if (stock <= 10) {
  // Low - Send warning alert
}
```

### Sales Monitoring Logic

```typescript
if (currentRevenue < previousRevenue * 0.8) {
  // Sales dropped >20%
  // Send alert to owner
  // Display warning on website
}
```

### Task Generation Logic

```typescript
// Use constraints or defaults
const constraints = userConstraints || {
  timePerDay: 2,
  monthlyBudget: 1000,
  numberOfWorkers: 1,
  daysAvailable: ['Monday', 'Tuesday', ...]
};

// Generate tasks for today
const tasks = generateDailyTasks(constraints, weeklyPlan);
```

---

## 📊 Data Flow

### Business Advisor Flow

```
User Input (Form)
    ↓
Form State (React useState)
    ↓
handleSubmit()
    ↓
Send WhatsApp to 8825484735 (Shop Info)
    ↓
generateRecommendations()
    ↓
generateDetailedPlan()
    ↓
Save to localStorage
    ↓
Display Results
```

### Operational AI Flow

```
System Startup
    ↓
Load Constraints from localStorage
    ↓
Generate Daily Tasks (Every 2 min)
    ↓
Monitor Stock (Every 5 min)
    ↓
Monitor Sales (Continuous)
    ↓
Check Festivals (Daily)
    ↓
Send Alerts (When Needed)
    ↓
Update Dashboard (Real-time)
```

### Stock Alert Flow

```
Stock Check
    ↓
Stock Level < Threshold?
    ↓
Generate Alert
    ↓
Send to Website Dashboard
    ↓
Send WhatsApp to 8825484735
    ↓
Send to Owner Mobile (if set)
    ↓
Pause Advertising (if exhausted)
```

---

## 🔐 Important Business Rules

1. **Stock Alerts Always Go to 8825484735**: Regardless of owner mobile
2. **Shop Registration Always Goes to 8825484735**: When form submitted
3. **Detailed Plans**: No generic phrases, only specific actions
4. **Exact Budget Breakdown**: Every rupee accounted for
5. **Goal-Specific**: Plans completely change based on goal
6. **Worker Assignments**: Each worker gets specific tasks
7. **Time-Based Execution**: Week-by-week breakdown
8. **AI Role Visible**: Clearly shows AI contribution
9. **Safety Note**: Results not guaranteed, owner makes decisions
10. **Currency**: All amounts in Indian Rupees (₹)

---

## 🚀 How to Run

### Development
```bash
npm install          # Install dependencies
npm run dev          # Start dev server at http://localhost:3000
```

### Production
```bash
npm run build        # Create optimized build
npm start            # Run production server
```

### Port Management
```bash
npm run free-port    # Free port 3000
npm run start:clean  # Free port and start
```

### Testing Routes
- Home: `http://localhost:3000/`
- About: `http://localhost:3000/about`
- Contact: `http://localhost:3000/contact`
- Customer: `http://localhost:3000/customer`
- Owner: `http://localhost:3000/owner`
- Investor: `http://localhost:3000/investor`
- AI Features: `http://localhost:3000/ai-features`
- Queries: `http://localhost:3000/queries`

---

## 📝 Key TypeScript Interfaces

### Business Inputs
```typescript
interface BusinessInputs {
  businessType: string;
  budget: string;
  timePerDay: string;
  numberOfWorkers: string;
  growthGoal: 'visibility' | 'sales' | 'expansion';
  targetTimeSpan: string;
  ownerMobile?: string;
}
```

### Detailed Plan
```typescript
interface DetailedPlan {
  businessSummary: string;
  selectedGoal: string;
  exactActions: DetailedAction[];
  budgetBreakdown: DetailedBudgetBreakdown[];
  workerAssignments: Array<{
    worker: string;
    tasks: string[];
    timePerDay: number;
  }>;
  timeBasedExecution: Array<{
    period: string;
    actions: string[];
    expectedResults: string;
  }>;
  taskClassification: {
    automated: string[];
    aiAssisted: string[];
    humanOnly: string[];
  };
  aiContribution: string;
  safetyNote: string;
}
```

### Business Constraints
```typescript
interface BusinessConstraints {
  timePerDay: number;
  monthlyBudget: number;
  numberOfWorkers: number;
  businessType: string;
  daysAvailable: string[];
}
```

### Daily Task
```typescript
interface DailyTask {
  id: string;
  task: string;
  assignedTo: string;
  time: string;
  priority: 'low' | 'medium' | 'high';
  category: 'routine' | 'advertising' | 'stock' | 'customer' | 'festival';
  autoGenerated: boolean;
  completed: boolean;
}
```

---

## 🎯 Current Features

### ✅ Implemented Features

1. **Very Detailed Marketing Plans**
   - No generic phrases
   - Exact rupee breakdowns
   - Worker assignments
   - Time-based execution

2. **Operational AI Assistant**
   - Auto task generation
   - Stock monitoring
   - Sales monitoring
   - Festival detection

3. **WhatsApp Integration**
   - Stock alerts to 8825484735
   - Shop registration to 8825484735
   - Owner mobile alerts

4. **Multi-Page System**
   - Owner dashboard
   - Customer page
   - Investor portal
   - AI features showcase

5. **Real-Time Updates**
   - Auto-refreshing calendars
   - Live stock updates
   - Dynamic metrics

6. **Currency Support**
   - All amounts in ₹ (Indian Rupees)
   - Proper formatting (en-IN locale)

---

## 🎨 UI/UX Features

### Design System
- **Color Scheme**: Blue primary, gray neutrals
- **Dark Mode**: Fully supported throughout
- **Responsive**: Mobile-first design
- **Accessibility**: Semantic HTML, proper labels
- **Currency**: ₹ symbol with Indian number formatting

### Visual Hierarchy
- **Form**: Clean, organized, grouped logically
- **Results**: Color-coded sections
  - Green = Automated (easy)
  - Yellow = AI-Assisted (moderate)
  - Blue = Human-Only (important)
- **Typography**: Clear headings, readable body text
- **Tables**: Budget breakdown tables with proper formatting

---

## 🔧 Dependencies Breakdown

### Production Dependencies
- **next**: ^14.2.30 - React framework
- **react**: ^18.3.1 - UI library
- **react-dom**: ^18.3.1 - React DOM renderer

### Development Dependencies
- **typescript**: ^5.3.3 - Type checking
- **tailwindcss**: ^3.4.1 - CSS framework
- **postcss**: ^8.4.35 - CSS processing
- **autoprefixer**: ^10.4.17 - CSS vendor prefixes
- **@types/node**: ^20.11.0 - Node.js types
- **@types/react**: ^18.2.0 - React types
- **@types/react-dom**: ^18.2.0 - React DOM types

---

## 📚 Key Concepts Explained

### Next.js App Router
- File-based routing: Folders in `app/` become routes
- Server Components by default
- Client Components marked with `'use client'`
- Layout components wrap routes

### React Hooks Used
- `useState`: Managing form state, results, and UI state
- `useEffect`: Loading data, setting up intervals, side effects

### Local Storage
- Used for data persistence (business inputs, weekly plans, notifications)
- All localStorage calls wrapped in `typeof window !== 'undefined'` checks
- Prevents SSR errors

### WhatsApp Integration
- Uses WhatsApp Web URL format: `https://wa.me/{number}?text={message}`
- Stores alerts in localStorage for tracking
- Ready for WhatsApp Business API integration

---

## 🐛 Troubleshooting

### Common Issues

1. **Port 3000 in use**
   - Solution: Run `npm run free-port` or `npm run start:clean`

2. **TypeScript errors**
   - Solution: Run `npm run build` to check types

3. **SSR localStorage errors**
   - Solution: All localStorage calls are wrapped in `typeof window !== 'undefined'` checks

4. **Stock not updating**
   - Solution: Ensure `cartService.ts` is properly integrated

5. **WhatsApp alerts not sending**
   - Solution: Check that number 8825484735 is correct, alerts are stored in localStorage

---

## 📋 File Checklist

### Core Files Created/Modified:
✅ `components/BusinessAdvisor.tsx` - Main component (~1,841 lines)
✅ `components/EnhancedSchedulingCalendar.tsx` - Enhanced calendar
✅ `components/OperationalDashboard.tsx` - Operational dashboard
✅ `components/MetricsDashboard.tsx` - Metrics dashboard
✅ `app/owner/page.tsx` - Owner dashboard
✅ `app/customer/page.tsx` - Customer page
✅ `app/investor/page.tsx` - Investor portal
✅ `services/detailedMarketingPlanService.ts` - Detailed plans
✅ `services/operationalAIService.ts` - Operational AI
✅ `services/notificationService.ts` - Notifications
✅ `services/whatsappAlertsService.ts` - WhatsApp alerts
✅ `services/stockMonitoringService.ts` - Stock monitoring
✅ And many more...

---

## 💡 Usage Examples

### Example 1: Business Advisor Input
- **Business Type**: "Coffee Shop"
- **Monthly Budget**: ₹5,000
- **Time Available**: 3 hours/day
- **Workers**: 2
- **Growth Goal**: "Increase Sales"
- **Target Time**: 30 days
- **Owner Mobile**: +91 9876543210

**Output**: Very detailed plan with exact actions, ₹5,000 breakdown, worker assignments, and 30-day execution plan

### Example 2: Stock Alert
- **Product**: "Premium Coffee Blend"
- **Stock**: 3 units (critical)
- **Action**: Alert sent to 8825484735 and owner mobile

### Example 3: Sales Drop
- **Current Revenue**: ₹40,000
- **Previous Revenue**: ₹60,000
- **Drop**: 33% (>20% threshold)
- **Action**: Alert sent to owner, warning displayed on dashboard

---

## 🎯 Future Enhancements

### Potential Additions
- Backend API for data storage
- Real WhatsApp Business API integration
- User authentication
- Email integration
- Analytics tracking
- More granular recommendations
- Industry-specific templates
- Multi-language support

---

This documentation provides a complete overview of the AI-Powered Business Management System. Use this as a reference when working with the codebase.

**Last Updated**: Current project state
**Total Source Files**: ~63 files
**Main Entry Point**: `app/page.tsx`
**Core Component**: `components/BusinessAdvisor.tsx`
**Key Service**: `services/detailedMarketingPlanService.ts`
