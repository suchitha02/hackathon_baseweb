# MongoDB & REST API Setup Guide

Complete guide to connect your IdeaSpark frontend to MongoDB via REST API.

## 🎯 Overview

Your application now uses:

- **Frontend**: React + TypeScript (Vite)
- **Backend**: Express.js + MongoDB
- **API Layer**: REST API with JWT authentication

## 📋 Prerequisites

1. **Node.js** (v14+) - [Download](https://nodejs.org/)
2. **MongoDB** - Choose one:
   - Local MongoDB - [Download](https://www.mongodb.com/try/download/community)
   - MongoDB Atlas (Cloud) - [Sign up free](https://www.mongodb.com/cloud/atlas/register)

## 🚀 Setup Steps

### Step 1: Install MongoDB

#### Option A: Local MongoDB (Recommended for Development)

**Windows:**

1. Download MongoDB Community Server
2. Run installer (keep default settings)
3. MongoDB will run as a Windows service automatically

**Mac (using Homebrew):**

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**

```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

#### Option B: MongoDB Atlas (Cloud - Free Tier)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create free account
3. Create a new cluster (M0 Free tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your database password

### Step 2: Set Up Backend

1. **Navigate to backend folder:**

   ```bash
   cd backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create `.env` file:**

   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` file:**

   For **Local MongoDB**:

   ```env
   MONGODB_URI=mongodb://localhost:27017/ideaspark
   JWT_SECRET=your-super-secret-key-change-this
   PORT=5000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:8080
   ```

   For **MongoDB Atlas**:

   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ideaspark
   JWT_SECRET=your-super-secret-key-change-this
   PORT=5000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:8080
   ```

5. **Start the backend server:**

   ```bash
   npm run dev
   ```

   You should see:

   ```
   ✅ MongoDB Connected
   🚀 Server running on port 5000
   📍 API URL: http://localhost:5000/api
   ```

### Step 3: Update Frontend Configuration

1. **Update `.env` in root directory:**

   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

2. **Restart frontend dev server:**
   ```bash
   npm run dev
   ```

### Step 4: Test the Connection

1. **Test API health:**

   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Test signup:**

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

3. **Open frontend:**
   - Go to http://localhost:8080
   - Click "Get Started"
   - Create an account
   - You should be able to sign up and login!

## 🔧 Running Both Servers

You need to run both frontend and backend simultaneously:

**Terminal 1 (Backend):**

```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**

```bash
npm run dev
```

## 📊 Database Structure

Your MongoDB will have these collections:

- `users` - User accounts
- `posts` - Ideas/posts
- `teams` - Team information
- `tasks` - Kanban tasks
- `comments` - Post comments
- `likes` - Post likes
- `tags` - Category tags

## 🐛 Troubleshooting

### Backend won't start

**Error: "Cannot find module"**

```bash
cd backend
npm install
```

**Error: "MongoDB connection failed"**

- Check if MongoDB is running: `mongod --version`
- Verify connection string in `.env`
- For Atlas: Check IP whitelist and password

### Frontend can't connect to API

**Error: "Network Error" or "Failed to fetch"**

- Make sure backend is running on port 5000
- Check CORS settings in `backend/server.js`
- Verify `VITE_API_BASE_URL` in `.env`

### Authentication issues

**Error: "Token is not valid"**

- Make sure `JWT_SECRET` is set in backend `.env`
- Clear browser localStorage and try again
- Check token expiration time

## 📱 Testing with Postman

1. Download [Postman](https://www.postman.com/downloads/)
2. Import this collection:

```json
{
  "info": { "name": "IdeaSpark API" },
  "item": [
    {
      "name": "Signup",
      "request": {
        "method": "POST",
        "url": "http://localhost:5000/api/auth/signup",
        "body": {
          "mode": "raw",
          "raw": "{\"email\":\"test@example.com\",\"password\":\"password123\",\"username\":\"testuser\",\"full_name\":\"Test User\"}"
        }
      }
    }
  ]
}
```

## 🎉 Success Checklist

- [ ] MongoDB is running
- [ ] Backend server starts without errors
- [ ] Frontend connects to backend
- [ ] Can create an account
- [ ] Can login
- [ ] Can create posts
- [ ] Can view feed

## 📚 Next Steps

1. **Seed sample data** - Create some test posts and users
2. **Deploy backend** - Use Heroku, Railway, or Render
3. **Deploy MongoDB** - Use MongoDB Atlas for production
4. **Add features** - Implement remaining API endpoints

## 🆘 Need Help?

- Check backend logs in terminal
- Use browser DevTools → Network tab
- Check MongoDB logs: `tail -f /var/log/mongodb/mongod.log`
- Verify all environment variables are set correctly

---

Your IdeaSpark app is now connected to MongoDB! 🎊
