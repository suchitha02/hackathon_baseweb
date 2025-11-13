# IdeaSpark Backend API

REST API for IdeaSpark - Hackathon Collaboration Platform built with Express.js and MongoDB.

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Navigate to backend directory**

   ```bash
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your MongoDB connection string:

   ```env
   MONGODB_URI=mongodb://localhost:27017/ideaspark
   JWT_SECRET=your-super-secret-key
   PORT=5000
   ```

4. **Start MongoDB** (if running locally)

   ```bash
   mongod
   ```

5. **Start the server**

   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

The API will be running at `http://localhost:5000/api`

## 📚 API Endpoints

### Authentication

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Posts

- `GET /api/posts` - Get all posts
- `GET /api/posts/:id` - Get post by ID
- `POST /api/posts` - Create post (requires auth)
- `POST /api/posts/:id/like` - Like post (requires auth)
- `POST /api/posts/:id/unlike` - Unlike post (requires auth)
- `GET /api/posts/:id/comments` - Get post comments
- `POST /api/posts/:id/comments` - Create comment (requires auth)

### Teams

- `GET /api/teams` - Get all teams
- `GET /api/teams/:id` - Get team by ID
- `POST /api/teams` - Create team (requires auth)
- `GET /api/teams/:id/members` - Get team members
- `POST /api/teams/:id/members` - Add team member (requires auth)

### Tasks (Kanban)

- `GET /api/tasks` - Get all tasks (requires auth)
- `POST /api/tasks` - Create task (requires auth)
- `PUT /api/tasks/:id` - Update task (requires auth)
- `DELETE /api/tasks/:id` - Delete task (requires auth)

### Users

- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile (requires auth)
- `GET /api/users/:id/posts` - Get user posts
- `GET /api/users/:id/stats` - Get user statistics

### Tags

- `GET /api/tags` - Get all tags
- `POST /api/tags` - Create tag

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-token>
```

## 📊 Database Models

### User

- email, password, username, full_name
- avatar_url, bio, college, role
- interests (array of tag references)

### Post

- author_id, title, content, cover_image_url
- status, looking_for_teammates
- tags, likes_count, comments_count

### Team

- name, description, creator_id
- members (array with user_id and role)

### Task

- title, description, status
- user_id, team_id, assigned_to
- priority, due_date

### Comment

- post_id, author_id, content
- parent_id (for nested comments)

### Like

- post_id, user_id

### Tag

- name

## 🧪 Testing the API

### Using curl

**Register a user:**

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "username": "testuser",
    "full_name": "Test User"
  }'
```

**Login:**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Create a post (with auth token):**

```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "My First Idea",
    "content": "This is an amazing idea!",
    "looking_for_teammates": true
  }'
```

## 🔧 Development

### Project Structure

```
backend/
├── models/          # Mongoose models
├── routes/          # API routes
├── middleware/      # Custom middleware (auth, etc.)
├── server.js        # Main server file
├── package.json     # Dependencies
└── .env            # Environment variables
```

### Adding New Features

1. Create model in `models/`
2. Create routes in `routes/`
3. Register routes in `server.js`
4. Update frontend API service in `src/services/api.ts`

## 🐛 Troubleshooting

**MongoDB Connection Error:**

- Make sure MongoDB is running
- Check your connection string in `.env`
- For MongoDB Atlas, whitelist your IP address

**Port Already in Use:**

- Change PORT in `.env` file
- Kill the process using the port: `lsof -ti:5000 | xargs kill`

**JWT Token Invalid:**

- Make sure JWT_SECRET matches between requests
- Check token expiration time

## 📝 License

MIT
