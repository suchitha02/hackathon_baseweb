# 🚀 IdeaSpark - Hackathon Collaboration Platform

A modern web application designed for hackathons and innovation communities where students and developers can share ideas, form teams, and collaborate on projects.

![IdeaSpark](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)
![Vite](https://img.shields.io/badge/Vite-5.4.19-purple)
![Supabase](https://img.shields.io/badge/Supabase-Ready-green)

## ✨ Features

### 📝 Feed & Posts

- Browse innovative ideas from the community
- Filter by trending, teammates needed, or all posts
- Like and comment on posts
- Create new posts with tags, images, and descriptions
- Detailed post view with full interaction capabilities

### 👥 Teams

- Create and manage teams
- Invite members and assign roles (owner, member)
- Team dashboard with member overview
- Collaboration spaces for team communication
- Ready for real-time chat integration

### 🤖 AI Assistant

- Interactive AI chatbot for brainstorming
- Context-aware responses for problem-solving
- Quick prompt suggestions to get started
- Helps with idea validation and team building
- Systematic approach to tackling challenges

### 📋 Kanban Board

- Visual task management with drag-and-drop ready structure
- Four-column workflow: To Do, In Progress, Review, Done
- Create tasks with title, description, and status
- Color-coded status indicators
- Perfect for team project management

### 🔔 Notifications

- Real-time notification center
- Support for likes, comments, follows, and team invites
- Unread badge in header
- Mark as read and delete functionality
- Time-stamped with relative time display

### 👤 User Profiles

- Customizable user profiles with avatars
- Bio, college, and interests
- View user's posts and activity
- Follow/unfollow functionality
- Profile statistics (posts, followers, following)

### 📊 Dashboard

- Personal dashboard with statistics
- Quick actions for creating posts and exploring ideas
- Recent posts overview
- Track your innovation journey

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Routing**: React Router v6
- **State Management**: React Hooks (useState, useCallback, useEffect)
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **Date Formatting**: date-fns

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/ideaspark.git
   cd ideaspark
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:

   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:8080`

## 🗄️ Database Setup

The application uses Supabase as the backend. You'll need to set up the following tables:

### Tables

- `profiles` - User profiles
- `posts` - User posts/ideas
- `comments` - Post comments
- `likes` - Post likes
- `follows` - User follows
- `tags` - Post tags
- `post_tags` - Post-tag relationships
- `user_interests` - User interests
- `teams` - Team information
- `team_members` - Team membership
- `tasks` - Kanban tasks
- `notifications` - User notifications

See `supabase/migrations/` for the complete schema.

## 🚀 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 📁 Project Structure

```
ideaspark/
├── src/
│   ├── components/        # Reusable components
│   │   ├── ui/           # shadcn/ui components
│   │   └── Header.tsx    # Main navigation header
│   ├── pages/            # Page components
│   │   ├── Landing.tsx   # Landing page
│   │   ├── Feed.tsx      # Ideas feed
│   │   ├── Teams.tsx     # Teams listing
│   │   ├── Kanban.tsx    # Kanban board
│   │   ├── AIChat.tsx    # AI assistant
│   │   └── ...
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   └── integrations/     # Supabase integration
├── public/               # Static assets
└── supabase/            # Database migrations
```

## 🎨 Design System

The application uses a custom design system built on:

- **Colors**: Gradient-based primary colors with HSL variables
- **Typography**: System font stack with responsive sizing
- **Components**: shadcn/ui component library
- **Spacing**: Tailwind CSS spacing scale
- **Animations**: Smooth transitions and hover effects

## 🔐 Authentication

IdeaSpark uses Supabase Authentication with:

- Email/password sign up and login
- User onboarding flow
- Protected routes
- Session management
- Profile creation on signup

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Netlify

1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Configure environment variables
4. Set up redirects for SPA routing

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Lucide](https://lucide.dev/) for the icon set
- [Tailwind CSS](https://tailwindcss.com/) for the styling framework

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

Built with ❤️ for the hackathon community
