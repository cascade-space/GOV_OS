require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const http = require('http');
const { Server } = require('socket.io');

const { pool, testConnection } = require('./config/database');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/error.middleware');

// Import routes
const complaintRoutes = require('./routes/complaint.routes');
const officerRoutes = require('./routes/officer.routes');
const adminRoutes = require('./routes/admin.routes');
const mlaRoutes = require('./routes/mla.routes');
const uploadRoutes = require('./routes/upload.routes');
const authRoutes = require('./routes/auth.routes');
const superadminRoutes = require('./routes/superadmin.routes');
const constituencyRoutes = require('./routes/constituency.routes');
const superAdminRoutes = require('./routes/superadmin.routes');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: process.env.SOCKET_CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
        credentials: true
    }
});

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: process.env.CORS_CREDENTIALS === 'true'
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'CivicPath API Server Running',
        version: process.env.API_VERSION || 'v1',
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({
            status: 'healthy',
            database: 'connected',
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            database: 'disconnected',
            error: error.message
        });
    }
});

// API Routes
const apiVersion = process.env.API_VERSION || 'v1';
app.use(`/api/${apiVersion}/complaints`, complaintRoutes);
app.use(`/api/${apiVersion}/officers`, officerRoutes);
app.use(`/api/${apiVersion}/admin`, adminRoutes);
app.use(`/api/${apiVersion}/mla`, mlaRoutes);
app.use(`/api/${apiVersion}/upload`, uploadRoutes);
app.use(`/api/${apiVersion}/auth`, authRoutes);
app.use(`/api/${apiVersion}/superadmin`, superadminRoutes);
app.use(`/api/${apiVersion}/constituencies`, constituencyRoutes);
app.use(`/api/${apiVersion}/superadmin`, superAdminRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.path
    });
});

// Error handler (must be last)
app.use(errorHandler);

// Socket.io connection handling
io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    socket.on('join:officer', (officerId) => {
        socket.join(`officer:${officerId}`);
        logger.info(`Officer ${officerId} joined their room`);
    });

    socket.on('join:admin', () => {
        socket.join('admin');
        logger.info('Admin joined admin room');
    });

    socket.on('join:mla', (mlaId) => {
        socket.join(`mla:${mlaId}`);
        logger.info(`MLA ${mlaId} joined their room`);
    });

    socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
    });
});

// Start server
const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        // Test database connection
        await testConnection();
        logger.info('✅ Database connected successfully');
        logger.info('🔐 Authentication routes loaded');

        // Start listening
        server.listen(PORT, () => {
            logger.info(`🚀 Server running on port ${PORT}`);
            logger.info(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
            logger.info(`🔗 API Base URL: http://localhost:${PORT}/api/${apiVersion}`);
            logger.info(`🔌 Socket.io ready for real-time connections`);
        });
    } catch (error) {
        logger.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully...');
    server.close(async () => {
        await pool.end();
        logger.info('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down gracefully...');
    server.close(async () => {
        await pool.end();
        logger.info('Server closed');
        process.exit(0);
    });
});

// Start the server
startServer();

module.exports = { app, io };
