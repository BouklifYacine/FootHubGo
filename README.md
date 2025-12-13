# ⚽ FootHubGo - Complete Football Club Management Platform

<div align="center">

![FootHubGo](https://img.shields.io/badge/FootHubGo-v1.0-green?style=for-the-badge)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4-black?style=for-the-badge&logo=socket.io)](https://socket.io/)

**All-in-one solution for managing amateur football clubs**

[🌐 Live Demo](https://footygogo.com) • [✨ Features](#-complete-feature-list) • [🛠 Tech Stack](#-tech-stack) • [📦 Installation](#-installation)

</div>

---

## 📋 Overview

**FootHubGo** is a comprehensive web application designed to streamline the management of amateur football clubs. From team rosters and match statistics to real-time chat and event scheduling, this platform provides everything coaches and players need in one place.

---

## ✨ Complete Feature List

### 🏠 Home Dashboard (`/accueil`)

| Feature                | Description                                 |
| ---------------------- | ------------------------------------------- |
| **Team Overview Card** | Quick view of your club's key information   |
| **Club Leaderboard**   | Rankings of all clubs with points and stats |
| **Next Events Widget** | Upcoming 3 events with countdown            |
| **Last 5 Results**     | Recent match results with W/D/L indicators  |
| **Quick Stats Panel**  | Key statistics at a glance                  |
| **Join Club Modal**    | OTP input to join a club with invite code   |
| **No Club State**      | Onboarding for users without a club         |

---

### 🏆 Club Management (`/club`, `/creationclub`, `/modifierinfosclub`)

| Feature                 | Description                                               |
| ----------------------- | --------------------------------------------------------- |
| **Create Club**         | One-click club creation, user becomes coach automatically |
| **Edit Club Info**      | Modify club name, description, logo                       |
| **Club Logo Upload**    | AWS S3 integration for image storage                      |
| **Delete Club**         | Complete club removal with confirmation                   |
| **Club Status Display** | Show club information and member count                    |

---

### 👥 Team Roster (`/effectif`)

| Feature               | Description                                       |
| --------------------- | ------------------------------------------------- |
| **Member Table**      | Full roster with avatars, positions, roles        |
| **Dynamic Filtering** | Filter by role (coach/player), position           |
| **Search**            | Instant search by player name                     |
| **Modify Roles**      | Change member from player to coach                |
| **Modify Position**   | Assign/change player positions (GK, CB, ST, etc.) |
| **Remove Player**     | Kick players from the club                        |

---

### 🔐 Invitation System (`/codeinvitation`, `/rejoindreclub`)

| Feature                  | Description                                         |
| ------------------------ | --------------------------------------------------- |
| **Generate Invite Code** | Create unique 6-digit codes                         |
| **Regenerate Code**      | Generate new code (invalidates old)                 |
| **Delete Code**          | Remove active invitation code                       |
| **Join via Code**        | OTP input to join with invite code                  |
| **Join Requests**        | Players can request to join with motivation message |
| **Request Management**   | Coaches can accept/reject join requests             |

---

### 📅 Calendar & Events (`/calendrier`, `/evenements`)

| Feature                  | Description                                    |
| ------------------------ | ---------------------------------------------- |
| **Interactive Calendar** | Beautiful month/week/day/agenda views          |
| **Drag & Drop**          | Reschedule events by dragging                  |
| **Event Types**          | Training (🟠), Championship (🔵), Cup (🟢)     |
| **Event Filtering**      | Filter by event type with colored checkboxes   |
| **Create Events**        | Modal form with validation                     |
| **Edit Events**          | Modify existing events                         |
| **Delete Events**        | Remove events with confirmation                |
| **Stats Protection**     | Can't modify/delete events with recorded stats |
| **Event Details Page**   | Full event information with presences/stats    |

---

### ✅ Presence Tracking (`/presences`)

| Feature                | Description                                  |
| ---------------------- | -------------------------------------------- |
| **Mark Presence**      | One-click Present/Absent/Pending for players |
| **Presence Table**     | Coach view of all player statuses            |
| **Summary Cards**      | Count of present/absent/pending players      |
| **Color-coded Badges** | Visual status indicators                     |
| **Past Event Lock**    | Can't change presence after event date       |

---

### 📋 Convocation System (`/convocations`, `/CallUp`)

| Feature                       | Description                                |
| ----------------------------- | ------------------------------------------ |
| **Match Lineup**              | Select players for upcoming matches        |
| **Convocation Status**        | Pending/Accepted/Declined                  |
| **Player Response**           | Players can accept or decline convocations |
| **Coach Overview**            | See all player responses at a glance       |
| **Convocation Notifications** | Alert players when convoked                |

---

### 📊 Player Statistics (`/statistiques`, `/stats/statsjoueur`)

| Feature                | Description                          |
| ---------------------- | ------------------------------------ |
| **Goals**              | Track goals scored per player        |
| **Assists**            | Track decisive passes                |
| **Minutes Played**     | Playing time tracking                |
| **Player Rating**      | 1-10 performance ratings             |
| **Position Tracking**  | Stats filtered by position           |
| **Starter/Sub Status** | Titulaire or substitute              |
| **Player Stats Card**  | Individual player statistics summary |
| **Stats Entry Form**   | Coach form to enter match stats      |
| **Stats Table**        | Sortable table of all player stats   |

---

### 📈 Team Statistics (`/stats/statsequipe`)

| Feature                | Description                 |
| ---------------------- | --------------------------- |
| **Match Results**      | Win/Draw/Loss records       |
| **Goals For/Against**  | Scoring and conceding stats |
| **Goal Difference**    | Net goals calculation       |
| **Points**             | League points (3/1/0)       |
| **Clean Sheets**       | Matches without conceding   |
| **Shots on Target**    | Total and on-target shots   |
| **Home/Away Split**    | Performance by venue        |
| **Form Indicator**     | Last 5 match results        |
| **Stats Entry Form**   | Record match statistics     |
| **Interactive Charts** | Recharts visualizations     |

---

### 💬 Real-Time Chat (`/chat`)

| Feature                  | Description                              |
| ------------------------ | ---------------------------------------- |
| **Private Messages**     | 1-on-1 conversations with teammates      |
| **Group Chats**          | Team-wide or custom group conversations  |
| **Create Conversation**  | Start new private or group chat          |
| **Message Replies**      | Reply to specific messages with preview  |
| **@Mentions**            | Mention teammates with autocomplete      |
| **Pin Conversations**    | Pin important chats to top               |
| **Pin Messages**         | Pin important messages in a conversation |
| **Delete Messages**      | Remove own messages                      |
| **Delete Conversations** | Remove entire conversation               |
| **Block Users**          | Block users from messaging you           |
| **Read Receipts**        | See when messages are read               |
| **Real-time Updates**    | WebSocket-powered instant delivery       |
| **Emoji Picker**         | Send emojis in messages                  |
| **Typing Indicators**    | See when someone is typing               |
| **Unread Badges**        | Count of unread messages in sidebar      |
| **Member Search**        | Find members to chat with                |

---

### 🔔 Notifications (`/notifications`)

| Feature                  | Description                               |
| ------------------------ | ----------------------------------------- |
| **Real-time Alerts**     | Instant WebSocket notifications           |
| **Multiple Types**       | Events, messages, join requests, injuries |
| **Notification Popover** | Quick view in header                      |
| **Mark as Read**         | Individual or bulk read status            |
| **Mark All Read**        | One-click clear all                       |
| **Notification History** | View past notifications                   |
| **Sidebar Badge**        | Unread count always visible               |

---

### 🏥 Injury Management (`/blessures`, `/injuries`)

| Feature               | Description                           |
| --------------------- | ------------------------------------- |
| **Report Injury**     | Players declare injuries with details |
| **Injury Type**       | Categorize injury type                |
| **Description**       | Detailed injury description           |
| **Expected End Date** | Recovery timeline                     |
| **Injury Timeline**   | Historical view per player            |
| **Coach Dashboard**   | View all team injuries                |
| **Status Updates**    | Track recovery progress               |

---

### 💰 Finance Tracking (`/features/dashboard/components`)

| Feature            | Description                 |
| ------------------ | --------------------------- |
| **Team Finances**  | Track club budget           |
| **Member Dues**    | Individual payment tracking |
| **Expenses**       | Record club expenses        |
| **Payment Status** | Paid/Pending indicators     |

---

### ⚙️ Settings & Profile (`/parametres`)

| Feature                | Description                     |
| ---------------------- | ------------------------------- |
| **Profile Management** | Update name, email, bio         |
| **Avatar Upload**      | Profile picture with S3 storage |
| **Password Change**    | Secure password update          |
| **Password Reset**     | Email-based recovery flow       |
| **Theme Toggle**       | Light/Dark mode switch          |
| **Delete Account**     | Complete account removal        |

---

### 🔄 Transfers (`/transfert`)

| Feature           | Description                   |
| ----------------- | ----------------------------- |
| **Leave Club**    | Player can leave current club |
| **Transfer Flow** | Managed club transitions      |

---

### 🔐 Authentication (`/connexion`, `/inscription`)

| Feature                  | Description                |
| ------------------------ | -------------------------- |
| **Email/Password Login** | Traditional authentication |
| **User Registration**    | Create new account         |
| **Email Verification**   | Verify email address       |
| **Password Recovery**    | Reset password via email   |
| **Session Management**   | Better Auth integration    |

---

### 📧 Email System

| Feature                 | Description                |
| ----------------------- | -------------------------- |
| **Welcome Email**       | On registration            |
| **Password Reset**      | Reset link delivery        |
| **Notification Emails** | Event reminders (optional) |
| **React Email**         | Beautiful templated emails |
| **Resend Integration**  | Reliable email delivery    |

---

## 🛠 Tech Stack

### Frontend

| Technology          | Version | Purpose                         |
| ------------------- | ------- | ------------------------------- |
| **Next.js**         | 16.0    | React framework with App Router |
| **React**           | 19.2    | UI library with latest features |
| **TypeScript**      | 5.x     | Type-safe development           |
| **Tailwind CSS**    | 4.x     | Utility-first styling           |
| **Radix UI**        | Latest  | Accessible component primitives |
| **Framer Motion**   | 12.x    | Smooth animations               |
| **Recharts**        | 3.x     | Data visualization              |
| **React Hook Form** | 7.x     | Form handling                   |
| **Zod**             | 3.x     | Schema validation               |
| **TanStack Query**  | 5.x     | Server state management         |
| **TanStack Table**  | 8.x     | Data tables                     |
| **Zustand**         | 5.x     | Client state management         |
| **Dayjs**           | 1.x     | Date manipulation               |
| **Lucide React**    | Latest  | Icon library                    |

### Backend

| Technology             | Version | Purpose                         |
| ---------------------- | ------- | ------------------------------- |
| **Next.js API Routes** | 16.0    | RESTful API endpoints           |
| **Prisma ORM**         | 6.x     | Database access layer           |
| **PostgreSQL**         | 15+     | Primary database                |
| **Socket.IO**          | 4.x     | Real-time WebSocket connections |
| **Better Auth**        | 1.x     | Authentication system           |
| **Resend**             | 4.x     | Email delivery                  |
| **AWS S3**             | Latest  | File storage                    |

### Infrastructure

| Technology         | Purpose                       |
| ------------------ | ----------------------------- |
| **Neon.tech**      | Serverless PostgreSQL         |
| **AWS S3**         | File storage (avatars, logos) |
| **Stripe**         | Payment processing            |
| **Coolify/Docker** | Deployment                    |
| **Bun**            | Fast JavaScript runtime       |

---

## 📦 Installation

### Prerequisites

- Node.js 18+ or Bun 1.0+
- PostgreSQL database (or Neon.tech account)
- AWS S3 bucket (for file uploads)

### 1. Clone the repository

```bash
git clone https://github.com/BouklifYacine/FootHubGo.git
cd FootHubGo
```

### 2. Install dependencies

```bash
# Using bun (recommended)
bun install

# Or using npm
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# Authentication
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"

# WebSocket
NEXT_PUBLIC_SOCKET_URL="ws://localhost:3000"

# AWS S3
AWS_REGION="eu-west-3"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_BUCKET_NAME="your-bucket-name"

# Email (Resend)
RESEND_API_KEY="your-resend-key"

# Stripe (optional)
STRIPE_SECRET_KEY="your-stripe-key"
```

### 4. Setup the database

```bash
# Generate Prisma client
bunx prisma generate

# Run migrations
bunx prisma migrate dev
```

### 5. Start the development server

```bash
# Using bun
bun run dev

# Or using npm
npm run dev
```

The application will be available at `http://localhost:3000`

---

## 📁 Project Structure

```
FootHubGo/
├── app/                          # Next.js App Router
│   ├── api/                      # 50+ API routes
│   ├── dashboardfoothub/         # Main dashboard pages
│   │   ├── blessures/           # Injuries page
│   │   ├── calendrier/          # Calendar page
│   │   ├── chat/                # Messaging page
│   │   ├── convocations/        # Convocations page
│   │   ├── effectif/            # Team roster page
│   │   ├── evenements/          # Events page
│   │   ├── statistiques/        # Statistics page
│   │   └── transfert/           # Transfer page
│   ├── connexion/               # Login page
│   └── inscription/             # Registration page
├── components/                   # Shared UI components
│   └── ui/                      # shadcn/ui components
├── features/                     # 27 Feature modules
│   ├── accueil/                 # Home dashboard
│   ├── calendrier/              # Calendar & events
│   ├── CallUp/                  # Convocation system
│   ├── chat/                    # Messaging system
│   ├── club/                    # Club management
│   ├── dashboard/               # Dashboard components
│   ├── evenements/              # Event management
│   ├── injuries/                # Injury tracking
│   ├── notifications/           # Notification system
│   ├── parametres/              # Settings
│   ├── presences/               # Presence tracking
│   ├── stats/                   # Statistics
│   │   ├── statsjoueur/        # Player stats
│   │   └── statsequipe/        # Team stats
│   └── ...                      # 15+ more modules
├── lib/                         # Utilities & helpers
├── prisma/                      # Database schema
│   ├── schema.prisma           # Prisma models
│   └── migrations/             # Database migrations
└── public/                      # Static assets
```

---

## 🎯 User Roles & Permissions

### 👔 Coach (ENTRAINEUR)

| Permission                    | Access |
| ----------------------------- | :----: |
| Create/Edit/Delete Events     |   ✅   |
| Record Match Statistics       |   ✅   |
| Manage Club Settings          |   ✅   |
| Invite/Remove Members         |   ✅   |
| Change Member Roles/Positions |   ✅   |
| View All Team Injuries        |   ✅   |
| Manage Convocations           |   ✅   |
| Generate Invite Codes         |   ✅   |

### ⚽ Player (JOUEUR)

| Permission              | Access |
| ----------------------- | :----: |
| View Events             |   ✅   |
| Mark Own Presence       |   ✅   |
| View Statistics         |   ✅   |
| Report Injuries         |   ✅   |
| Respond to Convocations |   ✅   |
| Chat with Teammates     |   ✅   |
| Leave Club              |   ✅   |
| View Club Info          |   ✅   |

---

## 🔗 API Routes Overview

| Endpoint               | Methods          | Description              |
| ---------------------- | ---------------- | ------------------------ |
| `/api/auth/*`          | Various          | Authentication endpoints |
| `/api/calendar/events` | GET              | Fetch all team events    |
| `/api/evenements`      | GET, POST        | Event management         |
| `/api/evenements/[id]` | GET, PUT, DELETE | Single event operations  |
| `/api/chat/*`          | Various          | Messaging endpoints      |
| `/api/club/*`          | Various          | Club management          |
| `/api/statistiques/*`  | Various          | Statistics endpoints     |
| `/api/notifications`   | GET, PATCH       | Notification management  |
| `/api/upload`          | POST             | File upload to S3        |
| `/api/membres/*`       | Various          | Member management        |

---

## 📄 License

MIT License - Copyright (c) 2025 Yacine Bouklif

---

<div align="center">

**Built with ❤️ for amateur football clubs**

[⬆ Back to Top](#-foothubgo---complete-football-club-management-platform)

</div>
