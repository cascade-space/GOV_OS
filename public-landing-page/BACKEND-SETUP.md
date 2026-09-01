# CivicPath Backend API Setup Guide

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     CivicPath System                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Citizen    │  │   Officer    │  │     MLA      │      │
│  │   Portal     │  │   Portal     │  │   Portal     │      │
│  │  (Port 3000) │  │  (Port 3001) │  │  (Port 3003) │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │               │
│         └──────────────────┼──────────────────┘              │
│                            │                                  │
│                   ┌────────▼────────┐                        │
│                   │   Next.js App   │                        │
│                   │   (Frontend)    │                        │
│                   └────────┬────────┘                        │
│                            │                                  │
│                            │ HTTP REST API                    │
│                            │ WebSocket (Socket.io)            │
│                            │                                  │
│                   ┌────────▼────────┐                        │
│                   │  Express API    │                        │
│                   │  (Port 5000)    │                        │
│                   │  + Socket.io    │                        │
│                   └────────┬────────┘                        │
│                            │                                  │
│                            │ PostgreSQL Driver (pg)           │
│                            │                                  │
│                   ┌────────▼────────┐                        │
│                   │  PostgreSQL DB  │                        │
│                   │  (Port 5432)    │                        │
│                   └─────────────────┘                        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 📋 What You'll Build

A production-ready Express.js backend API with:
- ✅ RESTful API endpoints
- ✅ PostgreSQL database integration
- ✅ Real-time notifications (Socket.io)
- ✅ JWT authentication
- ✅ File upload handling
- ✅ Error handling & logging
- ✅ Input validation
- ✅ CORS configuration
- ✅ API documentation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database setup (see database/SETUP-GUIDE.md)
- Git (optional)

### Installation Steps

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   # Copy example env file
   cp .env.example .env
   
   # Edit .env with your database credentials
   ```

4. **Start the server**
   ```bash
   # Development mode (with auto-reload)
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Verify it's running**
   - Open: http://localhost:5000
   - You should see: "CivicPath API Server Running"

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js       # PostgreSQL connection
│   │   └── socket.js         # Socket.io configuration
│   ├── controllers/
│   │   ├── complaint.controller.js
│   │   ├── officer.controller.js
│   │   ├── admin.controller.js
│   │   └── mla.controller.js
│   ├── models/
│   │   ├── complaint.model.js
│   │   ├── user.model.js
│   │   └── department.model.js
│   ├── routes/
│   │   ├── complaint.routes.js
│   │   ├── officer.routes.js
│   │   ├── admin.routes.js
│   │   └── mla.routes.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── validation.middleware.js
│   │   └── error.middleware.js
│   ├── utils/
│   │   ├── logger.js
│   │   └── helpers.js
│   └── server.js             # Main entry point
├── uploads/                  # File uploads directory
├── logs/                     # Application logs
├── .env.example             # Environment variables template
├── .env                     # Your environment variables (gitignored)
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Complaints
- `POST /api/v1/complaints` - Submit new complaint
- `GET /api/v1/complaints` - Get all complaints (paginated)
- `GET /api/v1/complaints/:id` - Get complaint by ID
- `GET /api/v1/complaints/track/:number` - Track by complaint number
- `PATCH /api/v1/complaints/:id/status` - Update status
- `PATCH /api/v1/complaints/:id/assign` - Assign to officer
- `POST /api/v1/complaints/:id/escalate` - Escalate complaint

### Officers
- `GET /api/v1/officers` - Get all officers
- `GET /api/v1/officers/:id` - Get officer details
- `GET /api/v1/officers/:id/tasks` - Get officer tasks
- `PATCH /api/v1/officers/:id/availability` - Update availability

### Admin
- `GET /api/v1/admin/stats` - Dashboard statistics
- `GET /api/v1/admin/departments` - Get departments
- `POST /api/v1/admin/departments` - Create department
- `GET /api/v1/admin/analytics` - Analytics data

### MLA
- `GET /api/v1/mla/issues` - Get constituency issues
- `POST /api/v1/mla/directives` - Issue directive
- `GET /api/v1/mla/stats` - MLA dashboard stats

### File Upload
- `POST /api/v1/upload` - Upload files (photos/documents)

## 🔐 Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=civicpath
DB_USER=civicpath_user
DB_PASSWORD=your_secure_password_here
DB_POOL_MIN=2
DB_POOL_MAX=10

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg,application/pdf

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:3003
CORS_CREDENTIALS=true

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# Socket.io
SOCKET_CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:3003

# Email (Optional - for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# SMS (Optional - for notifications)
SMS_API_KEY=your_sms_api_key
SMS_SENDER_ID=CIVICPATH
```

## 🧪 Testing the API

### Using cURL

```bash
# Test server is running
curl http://localhost:5000

# Submit a complaint
curl -X POST http://localhost:5000/api/v1/complaints \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Pothole on Main Street",
    "description": "Large pothole causing issues",
    "category": "Roads & Infrastructure",
    "subCategory": "Potholes",
    "priority": "high",
    "citizenName": "John Doe",
    "citizenMobile": "9876543210",
    "location": {
      "address": "Main Street, Ward 12",
      "latitude": 12.9716,
      "longitude": 77.5946,
      "ward": "Ward 12"
    }
  }'

# Get all complaints
curl http://localhost:5000/api/v1/complaints

# Track complaint
curl http://localhost:5000/api/v1/complaints/track/CMP-2024-00001
```

### Using Postman

1. Import the API collection (if provided)
2. Set base URL: `http://localhost:5000/api/v1`
3. Test each endpoint

## 📊 Database Connection

The backend connects to PostgreSQL using the `pg` library:

```javascript
// Example query
const result = await pool.query(
  'SELECT * FROM complaints WHERE id = $1',
  [complaintId]
);
```

Connection pooling is configured for optimal performance.

## 🔄 Real-time Updates

Socket.io is used for real-time notifications:

```javascript
// Server emits
io.emit('complaint:new', complaintData);
io.emit('complaint:status', { id, status });

// Client listens
socket.on('complaint:new', (data) => {
  // Update UI
});
```

## 🐛 Debugging

### Check Server Logs
```bash
# View logs
tail -f logs/app.log

# Or use npm script
npm run logs
```

### Common Issues

**Issue: Port 5000 already in use**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

**Issue: Database connection failed**
- Check PostgreSQL is running
- Verify credentials in .env
- Test connection: `psql -U civicpath_user -d civicpath`

**Issue: CORS errors**
- Add frontend URL to CORS_ORIGIN in .env
- Restart backend server

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
# Build (if using TypeScript)
npm run build

# Start
npm start

# Or use PM2
pm2 start src/server.js --name civicpath-api
```

### Docker (Optional)
```bash
docker build -t civicpath-api .
docker run -p 5000:5000 civicpath-api
```

## 📈 Performance Tips

1. **Database Indexing** - Already configured in schema.sql
2. **Connection Pooling** - Configured with min/max connections
3. **Caching** - Add Redis for frequently accessed data
4. **Rate Limiting** - Prevent API abuse
5. **Compression** - Enable gzip compression
6. **Load Balancing** - Use Nginx for multiple instances

## 🔒 Security Best Practices

- ✅ Environment variables for secrets
- ✅ JWT for authentication
- ✅ Input validation on all endpoints
- ✅ SQL injection prevention (parameterized queries)
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Helmet.js for security headers
- ✅ File upload validation

## 📚 Additional Resources

- Express.js Docs: https://expressjs.com/
- PostgreSQL Node Driver: https://node-postgres.com/
- Socket.io Docs: https://socket.io/docs/
- JWT: https://jwt.io/

## 🆘 Support

If you encounter issues:
1. Check logs: `npm run logs`
2. Verify database connection
3. Check environment variables
4. Review error messages

## 📝 Next Steps

After backend is running:
1. ✅ Test all API endpoints
2. ✅ Connect frontend to backend
3. ✅ Test real-time notifications
4. ✅ Add authentication
5. ✅ Deploy to production

---

**Last Updated:** February 24, 2026
**Version:** 1.0.0
**Node.js Version:** 18+
