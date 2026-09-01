# CivicPath Backend API

Express.js REST API server for CivicPath civic complaint management system.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Start development server
npm run dev
```

Server will start on: http://localhost:5000

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── utils/           # Utility functions
│   └── server.js        # Main entry point
├── uploads/             # File uploads
├── logs/                # Application logs
└── package.json
```

## 🔌 API Endpoints

### Complaints
- `POST /api/v1/complaints` - Submit complaint
- `GET /api/v1/complaints` - Get all complaints
- `GET /api/v1/complaints/:id` - Get complaint details
- `GET /api/v1/complaints/track/:number` - Track complaint
- `PATCH /api/v1/complaints/:id/status` - Update status
- `PATCH /api/v1/complaints/:id/assign` - Assign complaint

### Officers
- `GET /api/v1/officers` - Get all officers
- `GET /api/v1/officers/:id/tasks` - Get officer tasks

### Admin
- `GET /api/v1/admin/stats` - Dashboard statistics
- `GET /api/v1/admin/departments` - Get departments

### MLA
- `GET /api/v1/mla/issues` - Get constituency issues
- `POST /api/v1/mla/directives` - Issue directive

## 🔧 Environment Variables

See `.env.example` for all configuration options.

## 📚 Documentation

- [Setup Guide](../BACKEND-SETUP.md)
- [Quick Start](./QUICK-START.md)

## 🧪 Testing

```bash
# Test server is running
curl http://localhost:5000

# Test complaint submission
curl -X POST http://localhost:5000/api/v1/complaints \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","description":"Test description",...}'
```

## 📝 License

MIT
