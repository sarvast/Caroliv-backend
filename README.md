# Caloriv Backend

Production-ready Node.js/Express backend for the Caloriv fitness tracking application.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your values

# Start development server
npm run dev

# Start production server
npm start
```

## 📊 API Documentation

Interactive API documentation available at:
```
http://localhost:3000/api-docs
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Quick server test
node test-server.js
```

## 🔒 Security Features

- ✅ JWT authentication
- ✅ Rate limiting (5 req/15min for auth)
- ✅ Input validation (Zod schemas)
- ✅ Security headers (CSP, X-Frame-Options, etc.)
- ✅ CORS configuration
- ✅ Password hashing (bcrypt)

## ⚡ Performance

- ✅ Response compression (gzip)
- ✅ Database indexes (11 indexes)
- ✅ Query optimization
- ✅ In-memory caching
- ✅ Performance monitoring

## 📁 Project Structure

```
caroliv-backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.js  # DB initialization + indexes
│   │   ├── env.ts       # Environment validation
│   │   └── swagger.js   # API documentation
│   ├── controllers/     # Business logic
│   │   ├── authController.ts
│   │   └── userController.ts
│   ├── middleware/      # Express middleware
│   │   ├── auth.ts      # JWT verification
│   │   ├── rateLimit.ts # Rate limiting
│   │   ├── validation.ts # Input validation
│   │   └── errorHandler.ts
│   ├── routes/          # API routes
│   │   ├── auth.ts
│   │   ├── users.ts
│   │   └── index.ts
│   ├── utils/           # Utilities
│   │   ├── logger.ts    # Structured logging
│   │   ├── cache.ts     # Cache manager
│   │   └── queryOptimizer.ts
│   └── __tests__/       # Test files
├── server.js            # Main server file
├── caroliv.db           # SQLite database
└── package.json
```

## 🔧 Environment Variables

Required variables (see `.env.example`):
- `JWT_SECRET` - Secret key for JWT tokens
- `RAZORPAY_KEY_ID` - Razorpay payment gateway key
- `RAZORPAY_KEY_SECRET` - Razorpay secret
- `GEMINI_API_KEY` - Google Gemini AI API key

Optional:
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGIN` - Allowed origins for CORS

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/reset-password` - Reset password

### Users (Protected)
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/measurements` - Get body measurements
- `POST /api/users/measurements` - Add measurement

### Foods
- `GET /api/foods` - Get all foods
- `GET /api/foods/:id` - Get food by ID
- `POST /api/foods/submit` - Submit new food

### Exercises
- `GET /api/exercises` - Get all exercises
- `GET /api/exercises/:id` - Get exercise by ID
- `POST /api/exercises/submit` - Submit new exercise

### Admin (Protected)
- `GET /api/admin/users` - Get all users
- `GET /api/admin/stats` - Get statistics
- `POST /api/admin/foods` - Create food
- `PUT /api/admin/foods/:id` - Update food

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run in development mode (with auto-reload)
npm run dev

# Run linter
npm run lint

# Format code
npm run format
```

## 📦 Deployment

See [DEPLOYMENT.md](../DEPLOYMENT.md) for detailed deployment instructions.

Quick deploy:
```bash
# Build
npm run build

# Start with PM2
pm2 start dist/server.js --name caloriv-backend
```

## 🐛 Troubleshooting

### Port already in use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill
```

### Database locked
```bash
# Stop all node processes
taskkill /IM node.exe /F
```

### Tests failing
```bash
# Clear test cache
npm test -- --clearCache

# Run specific test
npm test -- auth.test.ts
```

## 📈 Performance Monitoring

The backend automatically logs:
- Slow requests (>1000ms)
- Database query times
- API response times

Access performance stats:
```bash
curl http://localhost:3000/api/admin/performance
```

## 🔐 Security Best Practices

1. Never commit `.env` file
2. Use strong JWT_SECRET (32+ characters)
3. Enable HTTPS in production
4. Keep dependencies updated
5. Review security headers regularly

## 📝 License

MIT

## 👥 Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md)

---

**Version:** 3.2.0  
**Last Updated:** December 23, 2025
