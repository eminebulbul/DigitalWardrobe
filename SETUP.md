# Setup Guide - Digital Wardrobe Backend & Frontend

## Prerequisites
- Node.js 16+ 
- PostgreSQL 12+
- npm or yarn
- Expo CLI (for mobile frontend)

---

## Backend Setup

### 1. Environment Variables
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and fill in:
- **DATABASE_URL:** PostgreSQL connection string
  - Example: `postgresql://user:password@localhost:5432/digital_wardrobe`
- **JWT_SECRET:** Random 32+ character string (generate with: `openssl rand -base64 32`)
- **REMOVE_BG_API_KEY:** From https://remove.bg/api (optional, for background removal)
- **S3_* variables:** Only if using cloud storage (leave empty for local filesystem)

### 2. Install Dependencies
```bash
cd backend
npm install
```

### 3. Database Setup
```bash
# Create database
createdb digital_wardrobe

# Run schema
psql digital_wardrobe < schema.sql
```

### 4. Start Backend
```bash
npm run dev    # Development (auto-reload)
npm start      # Production
```

Server runs on `http://localhost:3001`

---

## Frontend Setup

### 1. Environment Variables
```bash
cp .env.example .env
```

Edit `.env` and fill in:
- **EXPO_PUBLIC_API_URL:** Backend URL (e.g., `http://localhost:3001` or `https://api.example.com`)
- **EXPO_PUBLIC_BG_API_URL:** Same as above

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Frontend
```bash
npm start      # Expo dev server
a              # Open in Android emulator
i              # Open in iOS simulator
w              # Open in web browser
```

---

## Environment Variable Reference

### Frontend (.env)
| Variable | Example | Notes |
|----------|---------|-------|
| EXPO_PUBLIC_API_URL | http://localhost:3001 | Backend base URL |
| EXPO_PUBLIC_BG_API_URL | http://localhost:3001 | Background removal endpoint |

### Backend (.env)
| Variable | Example | Required |
|----------|---------|----------|
| DATABASE_URL | postgresql://user:pass@localhost/dbname | ✅ Yes |
| JWT_SECRET | (32+ char random string) | ✅ Yes |
| PORT | 3001 | Default: 3001 |
| REMOVE_BG_API_KEY | (API key from remove.bg) | ❌ Optional |
| AWS_S3_BUCKET | my-bucket | ❌ Optional (for cloud storage) |
| AWS_ACCESS_KEY_ID | (AWS credentials) | ❌ Optional (for cloud storage) |
| AWS_SECRET_ACCESS_KEY | (AWS credentials) | ❌ Optional (for cloud storage) |
| AWS_REGION | us-east-1 | ❌ Optional |
| S3_ENDPOINT | https://s3.amazonaws.com | ❌ Optional (for S3-compatible) |
| S3_PUBLIC_BASE_URL | https://bucket.s3.amazonaws.com | ❌ Optional |

---

## Security Checklist

Before deploying to production:

- [ ] `.env` file is in `.gitignore` (never commit secrets)
- [ ] `.env.example` is committed (template only, no real values)
- [ ] JWT_SECRET is strong and random (32+ characters)
- [ ] DATABASE_URL uses HTTPS in production
- [ ] S3 credentials (if used) are from IAM user with minimal permissions
- [ ] REMOVE_BG_API_KEY is kept private
- [ ] CORS is configured (if needed, backend restricts origins)
- [ ] API rate limiting is in place
- [ ] All endpoints require authentication (except login/register)

---

## Troubleshooting

**"Database connection refused"**
- Check DATABASE_URL format
- Ensure PostgreSQL is running
- Create database with `createdb digital_wardrobe`

**"JWT_SECRET missing"**
- Add JWT_SECRET to .env
- Generate with: `openssl rand -base64 32`

**"API connection failed from frontend"**
- Check EXPO_PUBLIC_API_URL matches backend URL
- Ensure backend is running on PORT (default 3001)
- On Android emulator, use `10.0.2.2:3001` instead of `localhost:3001`

**"S3 upload fails"**
- Leave S3_* variables empty to use local filesystem
- For production, ensure AWS credentials have S3 permissions

---

## File Structure
```
digital-wardrobe/
├── backend/
│   ├── .env                 (NEVER commit)
│   ├── .env.example         (commit this)
│   ├── server.js
│   ├── schema.sql
│   ├── package.json
│   └── uploads/             (local image storage)
├── src/
│   ├── screens/
│   ├── components/
│   ├── services/
│   └── ...
├── .env                     (NEVER commit)
├── .env.example             (commit this)
└── app.json
```

---

## API Documentation

### Authentication
- **POST /api/auth/register** - Create account
- **POST /api/auth/login** - Get JWT token

### Clothes
- **GET /api/clothes** - List user's clothes (requires auth)
- **POST /api/clothes** - Add clothing (requires auth, multipart image)
- **DELETE /api/clothes/:id** - Delete clothing (requires auth)
- **GET /api/clothes/:id/image** - Get clothing image (requires auth token)

### Outfits
- **GET /api/outfits** - List user's outfits (requires auth)
- **POST /api/outfits** - Create outfit (requires auth)
- **DELETE /api/outfits/:id** - Delete outfit (requires auth)

### Profile
- **GET /api/profile/me** - Get user profile (requires auth)
- **PUT /api/profile/me** - Update profile (requires auth)

---

**Last Updated:** May 17, 2026
