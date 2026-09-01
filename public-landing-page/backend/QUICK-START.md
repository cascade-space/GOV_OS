# Backend Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Configure Environment
```bash
# Copy the example file
copy .env.example .env

# Edit .env and update these values:
# DB_PASSWORD=your_postgres_password
# JWT_SECRET=your_secret_key_min_32_characters
```

### Step 3: Create Required Directories
```bash
mkdir uploads logs
```

### Step 4: Start the Server
```bash
npm run dev
```

You should see:
```
✅ Database connected successfully
🚀 Server running on port 5000
```

### Step 5: Test the API
Open your browser: http://localhost:5000

You should see:
```json
{
  "message": "CivicPath API Server Running",
  "version": "v1",
  "status": "healthy"
}
```

## ✅ Verification Checklist

- [ ] Node.js 18+ installed
- [ ] PostgreSQL running
- [ ] Database `civicpath` created
- [ ] Schema loaded (from database/schema.sql)
- [ ] .env file configured
- [ ] Dependencies installed
- [ ] Server starts without errors
- [ ] Can access http://localhost:5000

## 🔗 Next Steps

1. Test API endpoints with Postman or cURL
2. Connect frontend to backend
3. Test complaint submission
4. Verify data appears in database

## 📞 Need Help?

Check BACKEND-SETUP.md for detailed documentation.
