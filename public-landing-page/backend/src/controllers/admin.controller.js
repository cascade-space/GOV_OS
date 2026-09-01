const { pool } = require('../config/database');
const logger = require('../utils/logger');
const bcrypt = require('bcrypt');

exports.getDashboardStats = async (req, res, next) => {
    try {
        const statsQuery = `
            SELECT 
                COUNT(*) as total_complaints,
                COUNT(CASE WHEN status IN ('submitted', 'validated', 'assigned', 'in_progress') THEN 1 END) as pending,
                COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
                COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed,
                COUNT(CASE WHEN is_escalated = true THEN 1 END) as escalated,
                COUNT(CASE WHEN sla_deadline < CURRENT_TIMESTAMP AND status NOT IN ('resolved', 'closed') THEN 1 END) as sla_breached,
                AVG(citizen_satisfaction_rating) as avg_satisfaction
            FROM complaints
            WHERE deleted_at IS NULL
        `;
        
        const result = await pool.query(statsQuery);
        
        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        logger.error('Error fetching dashboard stats:', error);
        next(error);
    }
};

exports.getAnalytics = async (req, res, next) => {
    try {
        const { range = '30d' } = req.query;
        
        let days = 30;
        if (range === '7d') days = 7;
        if (range === '90d') days = 90;
        
        const query = `
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved
            FROM complaints
            WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
            AND deleted_at IS NULL
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `;
        
        const result = await pool.query(query);
        
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        logger.error('Error fetching analytics:', error);
        next(error);
    }
};

exports.getAllOfficers = async (req, res, next) => {
    try {
        const query = `SELECT * FROM v_officer_performance ORDER BY performance_score DESC`;
        const result = await pool.query(query);
        
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        logger.error('Error fetching officers:', error);
        next(error);
    }
};

exports.createOfficer = async (req, res, next) => {
    try {
        const {
            full_name,
            email,
            mobile,
            employee_id,
            department_id,
            designation
        } = req.body;

        // Start transaction
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Create user first
            const userQuery = `
                INSERT INTO users (full_name, email, mobile, role, status)
                VALUES ($1, $2, $3, 'officer', 'active')
                RETURNING id
            `;

            const userResult = await client.query(userQuery, [full_name, email, mobile]);
            const userId = userResult.rows[0].id;

            // Create officer record
            const officerQuery = `
                INSERT INTO officers (user_id, employee_id, department_id, designation, is_available)
                VALUES ($1, $2, $3, $4, true)
                RETURNING *
            `;

            const officerResult = await client.query(officerQuery, [
                userId,
                employee_id,
                department_id,
                designation || 'Field Officer'
            ]);

            await client.query('COMMIT');

            // Fetch complete officer data
            const fetchQuery = `
                SELECT o.*, u.full_name, u.email, u.mobile, u.status, d.name as department_name
                FROM officers o
                JOIN users u ON o.user_id = u.id
                LEFT JOIN departments d ON o.department_id = d.id
                WHERE o.id = $1
            `;

            const result = await pool.query(fetchQuery, [officerResult.rows[0].id]);

            res.status(201).json({
                success: true,
                message: 'Officer created successfully',
                data: result.rows[0]
            });

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

    } catch (error) {
        logger.error('Error creating officer:', error);
        next(error);
    }
};


exports.createOfficer = async (req, res, next) => {
    try {
        const { 
            full_name, 
            email, 
            mobile, 
            employee_id, 
            department_id, 
            designation 
        } = req.body;
        
        // Start transaction
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Generate unique username from email or mobile with random suffix
            const baseUsername = email 
                ? email.split('@')[0].toLowerCase() 
                : `officer_${mobile.slice(-4)}`;
            const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            const username = `${baseUsername}_${randomSuffix}`;
            
            // Generate a default password (mobile number) - officer should change it on first login
            const defaultPassword = mobile; // Use mobile as default password
            const password_hash = await bcrypt.hash(defaultPassword, 10);
            
            // Create user first
            const userQuery = `
                INSERT INTO users (username, full_name, email, mobile, password_hash, role, status)
                VALUES ($1, $2, $3, $4, $5, 'officer', 'active')
                RETURNING id
            `;
            
            const userResult = await client.query(userQuery, [username, full_name, email, mobile, password_hash]);
            const userId = userResult.rows[0].id;
            
            // Create officer record
            const officerQuery = `
                INSERT INTO officers (user_id, employee_id, department_id, designation, is_available)
                VALUES ($1, $2, $3, $4, true)
                RETURNING *
            `;
            
            const officerResult = await client.query(officerQuery, [
                userId, 
                employee_id || `EMP-${Date.now()}`, 
                department_id, 
                designation || 'Field Officer'
            ]);
            
            await client.query('COMMIT');
            
            // Fetch complete officer data with correct department field names
            const fetchQuery = `
                SELECT 
                    o.*, 
                    u.full_name, 
                    u.email, 
                    u.mobile, 
                    u.status, 
                    d.name as department_name,
                    d.id as department_id
                FROM officers o
                JOIN users u ON o.user_id = u.id
                LEFT JOIN departments d ON o.department_id = d.id
                WHERE o.id = $1
            `;
            
            const result = await pool.query(fetchQuery, [officerResult.rows[0].id]);
            
            logger.info(`Officer created: ${full_name} (${employee_id || 'auto-generated'})`);
            
            res.status(201).json({
                success: true,
                message: 'Officer created successfully',
                data: result.rows[0]
            });
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
        
    } catch (error) {
        logger.error('Error creating officer:', error);
        next(error);
    }
};

exports.getNotificationCounts = async (req, res, next) => {
    try {
        // Get current timestamp for SLA calculations
        const now = new Date();
        
        // Query to get various notification counts
        const notificationQuery = `
            SELECT 
                -- New complaints (submitted in last 24 hours)
                COUNT(CASE WHEN created_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours' 
                          AND status = 'submitted' THEN 1 END) as new_complaints,
                
                -- Pending complaints (all non-resolved/closed)
                COUNT(CASE WHEN status IN ('submitted', 'validated', 'assigned', 'in_progress') THEN 1 END) as pending_complaints,
                
                -- SLA breached complaints
                COUNT(CASE WHEN sla_deadline < CURRENT_TIMESTAMP 
                          AND status NOT IN ('resolved', 'closed') THEN 1 END) as sla_breached,
                
                -- High priority pending complaints
                COUNT(CASE WHEN priority IN ('high', 'critical') 
                          AND status IN ('submitted', 'validated', 'assigned', 'in_progress') THEN 1 END) as high_priority_pending,
                
                -- Escalated complaints
                COUNT(CASE WHEN is_escalated = true 
                          AND status NOT IN ('resolved', 'closed') THEN 1 END) as escalated_complaints
            FROM complaints
            WHERE deleted_at IS NULL
        `;
        
        const result = await pool.query(notificationQuery);
        const stats = result.rows[0];
        
        // Calculate notification counts (no department alerts since departments section is removed)
        const notificationCounts = {
            newComplaints: parseInt(stats.new_complaints) || 0,
            pendingComplaints: parseInt(stats.pending_complaints) || 0,
            slaBreached: parseInt(stats.sla_breached) || 0,
            highPriorityPending: parseInt(stats.high_priority_pending) || 0,
            escalatedComplaints: parseInt(stats.escalated_complaints) || 0
        };
        
        logger.info('Notification counts fetched:', notificationCounts);
        
        res.json({
            success: true,
            data: notificationCounts
        });
     
   } catch (error) {
        logger.error('Error fetching notification counts:', error);
        next(error);
    }
};