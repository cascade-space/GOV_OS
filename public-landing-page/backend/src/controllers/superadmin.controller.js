const { pool } = require('../config/database');
const logger = require('../utils/logger');

exports.getOverview = async (req, res) => {
    try {
        const [complaintsResult, usersResult, officersResult, recentResult] = await Promise.all([
            pool.query(`
                SELECT
                    COUNT(*) as total,
                    COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
                    COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed,
                    COUNT(CASE WHEN status IN ('submitted','validated','assigned','in_progress') THEN 1 END) as pending,
                    COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
                    0 as escalated,
                    0 as sla_breached,
                    COUNT(CASE WHEN created_at >= CURRENT_DATE THEN 1 END) as today,
                    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as this_week
                FROM complaints
            `),
            pool.query(`
                SELECT
                    COUNT(*) as total,
                    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
                    COUNT(CASE WHEN role = 'mla' THEN 1 END) as mlas,
                    COUNT(CASE WHEN status = 'active' THEN 1 END) as active
                FROM users
            `),
            pool.query(`
                SELECT
                    COUNT(*) as total,
                    COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
                    COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive
                FROM officers
            `),
            pool.query(`
                SELECT id, title, status, priority, category, citizen_name, created_at
                FROM complaints
                ORDER BY created_at DESC
                LIMIT 10
            `)
        ]);

        res.json({
            success: true,
            data: {
                complaints: complaintsResult.rows[0],
                users: usersResult.rows[0],
                officers: officersResult.rows[0],
                recentComplaints: recentResult.rows
            }
        });
    } catch (error) {
        logger.error('Super admin overview error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch overview' });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                u.id, u.email, u.role, u.full_name, u.status, u.created_at,
                COUNT(o.id) as officer_count
            FROM users u
            LEFT JOIN officers o ON o.mla_id = u.id::text
            WHERE u.role IN ('admin', 'mla')
            GROUP BY u.id, u.email, u.role, u.full_name, u.status, u.created_at
            ORDER BY u.role, u.created_at DESC
        `);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        logger.error('Super admin users error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch users' });
    }
};

exports.getAllOfficers = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                o.id, o.name, o.email, o.department, o.status, o.created_at, o.last_login,
                u.email as mla_email, u.full_name as mla_name,
                COUNT(c.id) as assigned_complaints
            FROM officers o
            LEFT JOIN users u ON u.id::text = o.mla_id
            LEFT JOIN complaints c ON c.assigned_officer_id = o.id AND c.status NOT IN ('resolved','closed')
            GROUP BY o.id, o.name, o.email, o.department, o.status, o.created_at, o.last_login, u.email, u.full_name
            ORDER BY o.created_at DESC
        `);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        logger.error('Super admin officers error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch officers' });
    }
};

exports.getAllComplaints = async (req, res) => {
    try {
        const { status, priority, limit = 50, offset = 0 } = req.query;
        let where = 'WHERE 1=1';
        const params = [];
        let i = 1;
        if (status) { where += ` AND status = $${i++}`; params.push(status); }
        if (priority) { where += ` AND priority = $${i++}`; params.push(priority); }
        params.push(parseInt(limit), parseInt(offset));

        const result = await pool.query(
            `SELECT id, title, status, priority, category, citizen_name, location_address, created_at, updated_at
             FROM complaints ${where} ORDER BY created_at DESC LIMIT $${i} OFFSET $${i+1}`,
            params
        );
        const countResult = await pool.query(`SELECT COUNT(*) FROM complaints ${where}`, params.slice(0, -2));
        res.json({ success: true, data: result.rows, total: parseInt(countResult.rows[0].count) });
    } catch (error) {
        logger.error('Super admin complaints error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch complaints' });
    }
};

exports.getTrend = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                TO_CHAR(DATE(created_at), 'Mon DD') as day,
                COUNT(*) as submitted,
                COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved
            FROM complaints
            WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
            GROUP BY DATE(created_at)
            ORDER BY DATE(created_at) ASC
        `);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        logger.error('Super admin trend error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch trend' });
    }
};
