# Scheduler App - Complete Task & Time Management Platform

A modern, full-featured scheduling and task management application built with Next.js 14, TypeScript, Prisma, and PostgreSQL.

## ✨ Features

### Core Functionality
- **Task Management**: Create, organize, and track tasks with priorities, categories, and tags
- **Smart Scheduling**: Plan events with an intuitive calendar interface
- **Time Tracking**: Track time spent on tasks and projects
- **Analytics & Insights**: Visualize productivity with charts and statistics
- **Smart Notifications**: Get timely reminders for tasks and events
- **Categories & Tags**: Organize tasks and events with custom categories

### User Experience
- **Dark Mode**: Full dark mode support with system preference detection
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Real-time Updates**: Instant updates across the application
- **Intuitive UI**: Clean, modern interface built with Tailwind CSS

### Advanced Features
- **Recurring Events**: Support for daily, weekly, monthly, and yearly recurring events
- **Priority Levels**: Organize tasks by urgency (Low, Medium, High, Urgent)
- **Task Status**: Track progress (Todo, In Progress, Completed, Cancelled)
- **Progress Tracking**: Monitor completion rates and productivity metrics
- **Time Statistics**: View time spent today, this week, and this month

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, CSS Variables for theming
- **Backend**: Next.js API Routes, Server Actions
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Google OAuth & Credentials
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Custom components with Lucide icons
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns
- **Charts**: Recharts

## 📋 Prerequisites

- Node.js 18.0 or higher
- PostgreSQL database
- npm or yarn package manager

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd scheduler-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/scheduler_db?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Set up the database

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma db push

# (Optional) Seed the database
npx prisma db seed
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
scheduler-app/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication
│   │   │   └── v1/            # API endpoints
│   │   ├── auth/              # Auth pages
│   │   ├── dashboard/         # Dashboard page
│   │   ├── tasks/             # Tasks page
│   │   ├── calendar/          # Calendar page
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Landing page
│   │   └── providers.tsx      # App providers
│   ├── components/            # React components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── DashboardContent.tsx
│   │   └── ThemeProvider.tsx
│   ├── lib/
│   │   ├── db/
│   │   │   └── prisma.ts      # Prisma client
│   │   ├── auth.ts            # NextAuth config
│   │   ├── utils.ts           # Utility functions
│   │   └── validations.ts     # Zod schemas
│   └── types/
│       └── index.d.ts         # TypeScript types
├── .env.example               # Environment variables template
├── next.config.js             # Next.js configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies
```

## 🗄️ Database Schema

The application uses the following main models:

- **User**: User accounts with authentication
- **Task**: Tasks with priorities, status, and categories
- **Schedule**: Calendar events with recurrence support
- **TimeEntry**: Time tracking entries
- **Category**: Custom categories for organization
- **Tag**: Tags for tasks
- **Notification**: User notifications
- **Reminder**: Reminders for tasks and events

## 🔐 Authentication

The app supports two authentication methods:

1. **Email/Password**: Traditional credentials-based authentication
2. **Google OAuth**: Sign in with Google account

## 📊 API Endpoints

### Tasks
- `GET /api/v1/tasks` - Get all tasks
- `POST /api/v1/tasks` - Create a new task
- `PATCH /api/v1/tasks/[id]` - Update a task
- `DELETE /api/v1/tasks/[id]` - Delete a task

### Schedules
- `GET /api/v1/schedules` - Get all schedules
- `POST /api/v1/schedules` - Create a new schedule
- `PATCH /api/v1/schedules/[id]` - Update a schedule
- `DELETE /api/v1/schedules/[id]` - Delete a schedule

### Time Tracking
- `GET /api/v1/time-tracking` - Get time entries
- `POST /api/v1/time-tracking` - Create a time entry

### Categories
- `GET /api/v1/categories` - Get all categories
- `POST /api/v1/categories` - Create a category

### Analytics
- `GET /api/v1/analytics` - Get analytics data

### Notifications
- `GET /api/v1/notifications` - Get notifications
- `PATCH /api/v1/notifications` - Mark notifications as read

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy!

### Database Setup for Production

For production, use a managed PostgreSQL service like:
- **Vercel Postgres**
- **Supabase**
- **Railway**
- **Neon**
- **AWS RDS**

Update your `DATABASE_URL` in Vercel environment variables.

## 🎨 Customization

### Theme Colors

Edit `tailwind.config.js` to customize the color scheme:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Your custom colors
      },
    },
  },
}
```

### Adding New Features

1. Create database models in `prisma/schema.prisma`
2. Run `npx prisma db push`
3. Create API routes in `src/app/api/v1/`
4. Create UI components in `src/components/`
5. Add pages in `src/app/`

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, email support@scheduler-app.com or open an issue in the repository.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting and deployment
- Prisma for the excellent ORM
- All open-source contributors

---

Built with ❤️ using Next.js and TypeScript